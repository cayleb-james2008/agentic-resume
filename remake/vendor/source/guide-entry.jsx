import React from 'react';
import {createRoot} from 'react-dom/client';
import GlassSurface from './GlassSurface.jsx';
let root;
export function mountGuideMaterial(){
 const host=document.getElementById('guide-material');
 if(!host||root)return;
 root=createRoot(host);
 root.render(<GlassSurface width="100%" height="100%" borderRadius={32} borderWidth={.09} brightness={45} opacity={.94} blur={10} distortionScale={-32} redOffset={0} greenOffset={3} blueOffset={6} backgroundOpacity={.08} saturation={1.05}/>);
}
