(function(){
  var D = JSON.parse(document.getElementById('data').textContent), rooms = D.rooms;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'cubic-bezier(.23,1,.32,1)';

  /* entrances: transform only, once, from a visible resting state */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:0});
  document.querySelectorAll('[data-reveal]').forEach(function(el){ io.observe(el); });
  document.querySelectorAll('.ledger li, .moments .m').forEach(function(el){ el.setAttribute('data-reveal',''); io.observe(el); });
  document.querySelectorAll('.board .tile').forEach(function(t){ t.classList.add('dev'); io.observe(t); });

  /* crossfade an image into a box: the new image lands on top and fades in; the old one is removed after */
  function swapInto(box, src, w, h, dur, settle, alt){
    var cur = box.querySelectorAll('img');
    if(cur.length && cur[cur.length - 1].getAttribute('src') === src){ cur[cur.length - 1].alt = alt || ''; return; }
    var img = new Image(); img.src = src; img.width = w; img.height = h; img.alt = alt || ''; img.decoding = 'async';
    var go = function(){
      box.appendChild(img);
      if(reduce || !img.animate){ cur.forEach(function(o){ o.remove(); }); return; }
      var a = img.animate(settle ? [{opacity:0, transform:'scale(1.03)'}, {opacity:1, transform:'none'}] : [{opacity:0}, {opacity:1}],
        {duration: dur, easing: settle ? 'cubic-bezier(.33,1,.68,1)' : 'ease', fill: 'both'});
      a.onfinish = function(){ box.querySelectorAll('img').forEach(function(o){ if(o !== img) o.remove(); }); a.cancel(); };
    };
    (img.decode ? img.decode() : Promise.resolve()).then(go, go);
  }

  /* ---------- sheet + loupe ---------- */
  var sheet = document.getElementById('sheet'), lp = document.getElementById('lp');
  var frames = Array.prototype.slice.call(sheet.querySelectorAll('.frame'));
  var lpName = document.getElementById('lp-name'), lpPlace = document.getElementById('lp-place'), lpSpec = document.getElementById('lp-spec');
  var shown = {p: D.featured[0][0], i: D.featured[0][1]}, auto = null, autoIdx = 0, touched = false;

  function cols(){ return getComputedStyle(sheet).gridTemplateColumns.split(' ').length; }
  function stagger(){
    var c = cols(), k = 0;
    frames.forEach(function(f){ if(f.hidden) return; f.style.setProperty('--d', ((k % c) * 32 + Math.min(Math.floor(k / c), 2) * 48) + 'ms'); k++; });
  }
  stagger();
  frames.forEach(function(f){
    f.classList.add('dev'); io.observe(f);
    f.addEventListener('transitionend', function(ev){ if(ev.propertyName === 'transform' && f.classList.contains('in')) f.classList.remove('dev'); });
  });

  function showLoupe(pid, i, slow){
    var r = rooms[pid], f = r.frames[i] || r.frames[0];
    shown = {p: pid, i: i};
    swapInto(lp, f.l, f.w, f.h, slow ? 1100 : 220, slow);
    lpName.textContent = r.name; lpPlace.textContent = r.place; lpSpec.innerHTML = r.spec;
    lp.setAttribute('aria-label', 'Open ' + r.name);
  }
  function stopAuto(){ touched = true; if(auto){ clearInterval(auto); auto = null; } }
  function startAuto(){
    if(reduce || touched || auto) return;
    auto = setInterval(function(){
      if(document.hidden) return;
      autoIdx = (autoIdx + 1) % D.featured.length;
      showLoupe(D.featured[autoIdx][0], D.featured[autoIdx][1], true);
    }, 5200);
  }
  startAuto();

  function pointAt(fr){
    var id = fr.getAttribute('data-p');
    if(fine){ sheet.classList.add('hov'); frames.forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-p') === id); }); }
    showLoupe(id, +fr.getAttribute('data-i'), false);
  }
  sheet.addEventListener('pointerover', function(ev){
    if(!fine) return;
    var fr = ev.target.closest('.frame'); if(!fr) return;
    stopAuto(); pointAt(fr);
  });
  sheet.addEventListener('pointerleave', function(){ sheet.classList.remove('hov'); frames.forEach(function(x){ x.classList.remove('on'); }); });
  sheet.addEventListener('focusin', function(ev){ var fr = ev.target.closest('.frame'); if(fr){ stopAuto(); pointAt(fr); } });
  sheet.addEventListener('focusout', function(ev){ if(!sheet.contains(ev.relatedTarget)){ sheet.classList.remove('hov'); frames.forEach(function(x){ x.classList.remove('on'); }); } });

  /* the chooser: narrow the sheet to rooms like yours */
  var chips = document.querySelectorAll('.chip'), count = document.getElementById('count');
  chips.forEach(function(ch){
    ch.addEventListener('click', function(){
      var f = ch.getAttribute('data-f'), seen = {}, n = 0, firstFr = null;
      stopAuto();
      chips.forEach(function(c){ c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
      frames.forEach(function(fr){
        var ok = f === 'all' || fr.getAttribute('data-t').split(' ').indexOf(f) > -1;
        fr.hidden = !ok;
        if(ok){ n++; seen[fr.getAttribute('data-p')] = 1; fr.classList.add('in'); if(!firstFr) firstFr = fr; }
      });
      stagger();
      var r = Object.keys(seen).length;
      count.textContent = n + ' photos of ' + r + (r === 1 ? ' room' : ' rooms');
      if(firstFr) showLoupe(firstFr.getAttribute('data-p'), +firstFr.getAttribute('data-i'), false);
    });
  });

  /* ---------- room viewer ---------- */
  var dlg = document.getElementById('room'), stage = document.getElementById('stage'), thumbs = document.getElementById('thumbs');
  var cur = null, idx = 0;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function paint(){
    var r = rooms[cur], ph = r.photos[idx];
    swapInto(stage, ph.v, ph.w, ph.h, 200, false, r.name + ', photo ' + (idx + 1) + ' of ' + r.photos.length);
    document.getElementById('room-count').textContent = 'Photo ' + (idx + 1) + ' of ' + r.photos.length;
    thumbs.querySelectorAll('button').forEach(function(b, j){ b.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
    var cb = thumbs.children[idx]; if(cb && cb.scrollIntoView) cb.scrollIntoView({block:'nearest', inline:'nearest'});
    var one = r.photos.length < 2;
    document.getElementById('room-prev').disabled = one; document.getElementById('room-next').disabled = one;
  }
  function openRoom(id, i){
    var r = rooms[id]; if(!r) return false;
    cur = id; idx = i || 0;
    document.getElementById('room-name').textContent = r.name;
    document.getElementById('room-where').textContent = r.place;
    document.getElementById('room-scope').textContent = r.scope;
    var dl = '';
    if(r.architect) dl += '<div><dt>Architect</dt><dd>' + esc(r.architect) + '</dd></div>';
    dl += '<div><dt>What we supplied</dt>' + r.products.map(function(p){ return '<dd><b>' + esc(p[0]) + '</b> ' + esc(p[1]) + '</dd>'; }).join('') + '</div>';
    document.getElementById('room-dl').innerHTML = dl;
    document.getElementById('room-credit').textContent = r.credit ? 'Photos: ' + r.credit : '';
    document.getElementById('room-url').href = r.url;
    thumbs.innerHTML = r.photos.map(function(p, j){
      return '<button type="button" aria-label="Photo ' + (j + 1) + '"><img src="' + p.t + '" alt="" loading="lazy"></button>';
    }).join('');
    thumbs.hidden = r.photos.length < 2;
    thumbs.querySelectorAll('button').forEach(function(b, j){ b.addEventListener('click', function(){ idx = j; paint(); }); });
    stage.querySelectorAll('img').forEach(function(o){ o.remove(); });
    if(!dlg.open) dlg.showModal();
    paint();
    return true;
  }
  function step(d){ var n = rooms[cur].photos.length; if(n < 2) return; idx = (idx + d + n) % n; paint(); }
  sheet.addEventListener('click', function(ev){
    var fr = ev.target.closest('.frame');
    if(fr){ if(rooms[fr.getAttribute('data-p')]){ ev.preventDefault(); stopAuto(); openRoom(fr.getAttribute('data-p'), +fr.getAttribute('data-i')); } return; }
    if(ev.target.closest('#lp') || ev.target.closest('#lp-open')){ stopAuto(); openRoom(shown.p, shown.i); }
  });
  document.getElementById('room-prev').addEventListener('click', function(){ step(-1); });
  document.getElementById('room-next').addEventListener('click', function(){ step(1); });
  document.getElementById('room-close').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(ev){ if(ev.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function(ev){ if(ev.key === 'ArrowRight') step(1); if(ev.key === 'ArrowLeft') step(-1); });
  /* swipe between photos: a quick flick is enough (velocity), or a long drag */
  var sw = null;
  stage.addEventListener('pointerdown', function(ev){ if(ev.pointerType === 'mouse') return; sw = {x: ev.clientX, y: ev.clientY, t: Date.now()}; });
  stage.addEventListener('pointerup', function(ev){
    if(!sw) return;
    var dx = ev.clientX - sw.x, dy = ev.clientY - sw.y, v = Math.abs(dx) / Math.max(1, Date.now() - sw.t);
    if(Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 60 || v > .11)) step(dx < 0 ? 1 : -1);
    sw = null;
  });
  stage.addEventListener('pointercancel', function(){ sw = null; });

  /* ---------- lines ledger: index with preview ---------- */
  var ledger = document.getElementById('ledger'), pv = document.getElementById('pv');
  var pcCap = document.getElementById('pc-cap'), pcAlso = document.getElementById('pc-also');
  var rows = Array.prototype.slice.call(ledger.querySelectorAll('.row'));
  function point(row, dim){
    ledger.classList.toggle('hov', dim !== false);
    rows.forEach(function(r){ r.classList.toggle('on', r === row); });
    swapInto(pv, row.getAttribute('data-prev'), 1200, 800, 220, false);
    pcCap.textContent = row.getAttribute('data-cap');
    var al = row.getAttribute('data-also'); pcAlso.textContent = al ? 'Also in: ' + al : '';
  }
  rows.forEach(function(row){
    if(fine) row.addEventListener('pointerenter', function(){ point(row); });
    row.addEventListener('focus', function(){ point(row); });
    row.addEventListener('click', function(){ openRoom(row.getAttribute('data-p'), +row.getAttribute('data-i')); });
  });
  ledger.addEventListener('pointerleave', function(){ point(rows[0], false); rows[0].classList.remove('on'); });
  ledger.addEventListener('focusout', function(ev){ if(!ledger.contains(ev.relatedTarget)){ ledger.classList.remove('hov'); rows.forEach(function(r){ r.classList.remove('on'); }); } });

  /* ---------- process row ---------- */
  var mo = document.getElementById('moments'), bar = document.getElementById('bar6');
  var back = document.getElementById('back'), fwd = document.getElementById('fwd');
  function sync(){
    var max = mo.scrollWidth - mo.clientWidth, p = max > 0 ? mo.scrollLeft / max : 1, vis = mo.clientWidth / mo.scrollWidth;
    bar.style.transform = 'scaleX(' + Math.min(1, vis + p * (1 - vis)).toFixed(4) + ')';
    back.disabled = mo.scrollLeft < 4; fwd.disabled = mo.scrollLeft > max - 4;
  }
  var ticking = false;
  mo.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(function(){ sync(); ticking = false; }); } }, {passive:true});
  addEventListener('resize', function(){ sync(); stagger(); });
  sync();
  function by(d){ var m = mo.querySelector('.m'); mo.scrollBy({left: d * (m.offsetWidth + 32), behavior: reduce ? 'auto' : 'smooth'}); }
  back.addEventListener('click', function(){ by(-1); });
  fwd.addEventListener('click', function(){ by(1); });
  var drag = null;
  mo.addEventListener('pointerdown', function(ev){ if(ev.pointerType !== 'mouse' || ev.button !== 0) return; drag = {x: ev.clientX, s: mo.scrollLeft, moved: false}; });
  mo.addEventListener('pointermove', function(ev){
    if(!drag) return;
    var dx = ev.clientX - drag.x;
    if(!drag.moved && Math.abs(dx) > 4){ drag.moved = true; mo.classList.add('dragging'); mo.setPointerCapture(ev.pointerId); }
    if(drag.moved) mo.scrollLeft = drag.s - dx;
  });
  function endDrag(){ if(!drag) return; mo.classList.remove('dragging'); drag = null; }
  mo.addEventListener('pointerup', endDrag); mo.addEventListener('pointercancel', endDrag);
})();
