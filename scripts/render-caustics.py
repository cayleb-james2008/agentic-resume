"""Reproduce the optical loop. Original was rendered in Higgsfield sandbox_exec.
Run with a scratch output directory; copy the three final media files into assets/motion.
Requires NumPy, Pillow and FFmpeg. No character artwork or model inference is used.
"""
import numpy as np, subprocess, pathlib, zipfile, json, sys
from PIL import Image, ImageFilter
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parents[1] / 'assets/motion'
out.mkdir(parents=True, exist_ok=True)
W,H,FPS,N = 960,540,24,192
y,x=np.mgrid[-1.25:1.25:complex(0,810),-2.15:2.15:complex(0,1440)].astype(np.float32)
base_x=(x/4.3+.5)*W
base_y=(y/2.5+.5)*H
py,px=np.mgrid[0:H,0:W].astype(np.float32)
sx=(px-W*.5)/(W*.49); sy=(py-H*.53)/(H*.52)
mask=np.exp(-3.3*(sx*sx+sy*sy)**1.5)
mask*=np.clip(1-(sx*sx+sy*sy)/1.65,0,1)
color=np.zeros((H,W,3),np.float32)
blend=np.clip((px/W-.25)*1.25,0,1)[...,None]
color[:]=np.array([.43,.79,.97])*(1-blend)+np.array([.74,.58,.92])*blend
warm=np.exp(-((px/W-.69)**2/.032+(py/H-.69)**2/.065))[...,None]
color=color*(1-warm*.27)+np.array([1,.65,.45])*warm*.27
waves=[(3.6,2.1,5.4,.0),(5.8,-3.1,3.5,1.5),(1.7,5.4,3.8,3.1),(-4.7,4.3,3.1,2.2),(7.7,2.8,1.5,.9)]
cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'hero-caustics.mp4')]
proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
samples=[]
for frame in range(N):
    t=frame/N*2*np.pi
    dx=np.zeros_like(x);dy=np.zeros_like(y)
    for kx,ky,amp,phase in waves:
        field=kx*x+ky*y+phase+.19*np.sin(t+phase)
        s=np.sin(field)
        dx+=amp*kx*s
        dy+=amp*ky*s
    ix=np.rint(base_x+dx).astype(np.int32)
    iy=np.rint(base_y+dy).astype(np.int32)
    ok=(ix>=0)&(ix<W)&(iy>=0)&(iy<H)
    dens=np.bincount((iy[ok]*W+ix[ok]).ravel(),minlength=W*H).reshape(H,W).astype(np.float32)
    dens=np.clip((dens/2.25-.45)/5.5,0,1)
    im=Image.fromarray((dens*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.1))
    glow=im.filter(ImageFilter.GaussianBlur(6))
    focus=np.asarray(im,dtype=np.float32)/255
    soft=np.asarray(glow,dtype=np.float32)/255
    light=(focus*.65+soft*.46)*mask
    rgb=np.clip(light[...,None]*color*255,0,255).astype('uint8')
    if frame in [0,64,128]:
        Image.fromarray(rgb).save(out/f'frame-{frame}.jpg',quality=85)
    if frame==0:
        Image.fromarray(rgb).save(out/'hero-caustics.webp',quality=88)
    proc.stdin.write(rgb.tobytes())
proc.stdin.close()
if proc.wait()!=0: raise RuntimeError('mp4 encoding failed')
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(out/'hero-caustics.mp4'),'-an','-c:v','libvpx-vp9','-b:v','0','-crf','35','-row-mt','1',str(out/'hero-caustics.webm')],check=True)
provenance={'method':'Procedural optical caustics rendered with Python/NumPy and encoded with FFmpeg inside Higgsfield sandbox_exec. No generative model was used; account plan blocked both requested model jobs.','duration_seconds':8,'fps':24,'width':W,'height':H,'loops':True,'audio':False,'characters_used':False}
(out/'provenance.json').write_text(json.dumps(provenance,indent=2))
with zipfile.ZipFile(out / 'caustic-exports.zip','w',zipfile.ZIP_DEFLATED) as z:
    for n in ['hero-caustics.mp4','hero-caustics.webm','hero-caustics.webp','provenance.json']:
        z.write(out/n,n)
print(json.dumps({p.name:p.stat().st_size for p in out.iterdir()}))

