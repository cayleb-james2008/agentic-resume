(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(id){ return document.getElementById(id); }
  function all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var dataEl = $('data'), D = dataEl ? JSON.parse(dataEl.textContent) : {};
  var rooms = D.rooms || {};

  /* entrances: transform only, once, from a visible resting state */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:0});
  all('[data-reveal]').forEach(function(el){ io.observe(el); });
  all('.ledger li, .steps .step, .people .person, .pgrid .card').forEach(function(el){ el.setAttribute('data-reveal',''); io.observe(el); });
  all('.board .tile').forEach(function(t){ t.classList.add('dev'); io.observe(t); });

  /* phone menu */
  var mb = $('menu-btn'), menu = $('menu');
  if(mb && menu){
    function setMenu(open){ mb.setAttribute('aria-expanded', open ? 'true' : 'false'); menu.hidden = !open; mb.setAttribute('aria-label', open ? 'Close menu' : 'Menu'); }
    mb.addEventListener('click', function(){ setMenu(menu.hidden); if(!menu.hidden){ var a = menu.querySelector('a'); if(a) a.focus(); } });
    document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && !menu.hidden){ setMenu(false); mb.focus(); } });
    addEventListener('resize', function(){ if(innerWidth >= 1100 && !menu.hidden) setMenu(false); });
  }

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

  /* ---------- room viewer (home sheet, ledger, project galleries) ---------- */
  var dlg = $('room'), openRoom = function(){ return false; };
  if(dlg){
    var stage = $('stage'), thumbs = $('thumbs'), cur = null, idx = 0, opener = null;
    var paint = function(){
      var r = rooms[cur], ph = r.photos[idx];
      swapInto(stage, '/' + ph.v, ph.w, ph.h, 200, false, r.name + ', image ' + (idx + 1) + ' of ' + r.photos.length);
      $('room-count').textContent = (r.label || 'Photo') + ' ' + (idx + 1) + ' of ' + r.photos.length;
      thumbs.querySelectorAll('button').forEach(function(b, j){ b.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
      var cb = thumbs.children[idx]; if(cb && cb.scrollIntoView) cb.scrollIntoView({block:'nearest', inline:'nearest'});
      var one = r.photos.length < 2;
      $('room-prev').disabled = one; $('room-next').disabled = one;
    };
    openRoom = function(id, i){
      var r = rooms[id]; if(!r) return false;
      cur = id; idx = i || 0; opener = document.activeElement;
      $('room-name').textContent = r.name;
      $('room-where').textContent = r.place;
      $('room-scope').textContent = r.scope;
      var dl = '';
      if(r.architect) dl += '<div><dt>Architect</dt><dd>' + esc(r.architect) + '</dd></div>';
      if(r.products && r.products.length) dl += '<div><dt>What we supplied</dt>' + r.products.map(function(p){ return '<dd><b>' + esc(p[0]) + '</b> ' + esc(p[1]) + '</dd>'; }).join('') + '</div>';
      $('room-dl').innerHTML = dl;
      $('room-credit').textContent = r.credit ? 'Photos: ' + r.credit : '';
      var link = $('room-url'); link.href = r.url; link.hidden = !!r.here;
      thumbs.innerHTML = r.photos.map(function(p, j){
        return '<button type="button" aria-label="Image ' + (j + 1) + '"><img src="/' + p.t + '" alt="" loading="lazy"></button>';
      }).join('');
      thumbs.hidden = r.photos.length < 2;
      thumbs.querySelectorAll('button').forEach(function(b, j){ b.addEventListener('click', function(){ idx = j; paint(); }); });
      stage.querySelectorAll('img').forEach(function(o){ o.remove(); });
      if(!dlg.open){ dlg.showModal(); document.documentElement.style.overflow = 'hidden'; }
      paint();
      return true;
    };
    var step = function(d){ var n = rooms[cur].photos.length; if(n < 2) return; idx = (idx + d + n) % n; paint(); };
    $('room-prev').addEventListener('click', function(){ step(-1); });
    $('room-next').addEventListener('click', function(){ step(1); });
    $('room-close').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('close', function(){ document.documentElement.style.overflow = ''; if(opener && opener.focus) opener.focus(); });
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
    /* project page gallery: any [data-open] button opens the viewer at that image */
    all('[data-open]').forEach(function(b){
      b.addEventListener('click', function(){ var p = b.getAttribute('data-open').split(':'); openRoom(p[0], +p[1]); });
    });
  }

  /* ---------- home: sheet + loupe ---------- */
  var sheet = $('sheet'), lp = $('lp'), stagger = function(){};
  if(sheet && lp){
    var frames = all('.frame', sheet);
    var lpName = $('lp-name'), lpPlace = $('lp-place'), lpSpec = $('lp-spec');
    var shown = {p: D.featured[0][0], i: D.featured[0][1]}, auto = null, autoIdx = 0, touched = false;
    var cols = function(){ return getComputedStyle(sheet).gridTemplateColumns.split(' ').length; };
    stagger = function(){
      var c = cols(), k = 0;
      frames.forEach(function(f){ if(f.hidden) return; f.style.setProperty('--d', ((k % c) * 32 + Math.min(Math.floor(k / c), 2) * 48) + 'ms'); k++; });
    };
    stagger();
    frames.forEach(function(f){
      f.classList.add('dev'); io.observe(f);
      f.addEventListener('transitionend', function(ev){ if(ev.propertyName === 'transform' && f.classList.contains('in')) f.classList.remove('dev'); });
    });
    var showLoupe = function(pid, i, slow){
      var r = rooms[pid], f = r.frames[i] || r.frames[0];
      shown = {p: pid, i: i};
      swapInto(lp, '/' + f.l, f.w, f.h, slow ? 1100 : 220, slow);
      lpName.textContent = r.name; lpPlace.textContent = r.place; lpSpec.innerHTML = r.spec;
      lp.setAttribute('aria-label', 'Open ' + r.name);
    };
    var stopAuto = function(){ touched = true; if(auto){ clearInterval(auto); auto = null; } };
    if(!reduce) auto = setInterval(function(){
      if(document.hidden || touched) return;
      autoIdx = (autoIdx + 1) % D.featured.length;
      showLoupe(D.featured[autoIdx][0], D.featured[autoIdx][1], true);
    }, 5200);
    var pointAt = function(fr){
      var id = fr.getAttribute('data-p');
      if(fine){ sheet.classList.add('hov'); frames.forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-p') === id); }); }
      showLoupe(id, +fr.getAttribute('data-i'), false);
    };
    var clear = function(){ sheet.classList.remove('hov'); frames.forEach(function(x){ x.classList.remove('on'); }); };
    sheet.addEventListener('pointerover', function(ev){ if(!fine) return; var fr = ev.target.closest('.frame'); if(fr){ stopAuto(); pointAt(fr); } });
    sheet.addEventListener('pointerleave', clear);
    sheet.addEventListener('focusin', function(ev){ var fr = ev.target.closest('.frame'); if(fr){ stopAuto(); pointAt(fr); } });
    sheet.addEventListener('focusout', function(ev){ if(!sheet.contains(ev.relatedTarget)) clear(); });
    /* the chooser: narrow the sheet to rooms like yours */
    var chips = all('.choose .chip'), count = $('count');
    chips.forEach(function(ch){
      ch.addEventListener('click', function(){
        var f = ch.getAttribute('data-f'), seen = {}, n = 0, firstFr = null;
        stopAuto();
        chips.forEach(function(c){ c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
        sheet.classList.toggle('filtered', f !== 'all');
        frames.forEach(function(fr){
          var ok = f === 'all' || fr.getAttribute('data-t').split(' ').indexOf(f) > -1;
          fr.hidden = !ok;
          if(ok){ n++; seen[fr.getAttribute('data-p')] = 1; fr.classList.add('in'); if(!firstFr) firstFr = fr; }
        });
        stagger();
        var r = Object.keys(seen).length;
        count.textContent = n + ' photos of ' + r + (r === 1 ? ' project' : ' projects');
        if(firstFr) showLoupe(firstFr.getAttribute('data-p'), +firstFr.getAttribute('data-i'), false);
      });
    });
    sheet.addEventListener('click', function(ev){
      var fr = ev.target.closest('.frame');
      if(fr){ if(rooms[fr.getAttribute('data-p')]){ ev.preventDefault(); stopAuto(); openRoom(fr.getAttribute('data-p'), +fr.getAttribute('data-i')); } return; }
      if(ev.target.closest('#lp') || ev.target.closest('#lp-open')){ stopAuto(); openRoom(shown.p, shown.i); }
    });
    addEventListener('resize', stagger);
  }

  /* ---------- home: lines ledger, index with preview ---------- */
  var ledger = $('ledger'), pv = $('pv');
  if(ledger && pv){
    var pcCap = $('pc-cap'), pcAlso = $('pc-also'), rows = all('.row', ledger);
    var point = function(row, dim){
      ledger.classList.toggle('hov', dim !== false);
      rows.forEach(function(r){ r.classList.toggle('on', r === row); });
      swapInto(pv, row.getAttribute('data-prev'), 1200, 800, 220, false);
      pcCap.textContent = row.getAttribute('data-cap');
      var al = row.getAttribute('data-also'), nm = row.querySelector('.nm'); pcAlso.textContent = al ? 'Also from ' + (nm ? nm.textContent : 'this line') + ': ' + al : '';
    };
    rows.forEach(function(row){
      if(fine) row.addEventListener('pointerenter', function(){ point(row); });
      row.addEventListener('focus', function(){ point(row); });
      row.addEventListener('click', function(){ openRoom(row.getAttribute('data-p'), +row.getAttribute('data-i')); });
    });
    ledger.addEventListener('pointerleave', function(){ point(rows[0], false); rows[0].classList.remove('on'); });
    ledger.addEventListener('focusout', function(ev){ if(!ledger.contains(ev.relatedTarget)){ ledger.classList.remove('hov'); rows.forEach(function(r){ r.classList.remove('on'); }); } });
  }

  /* ---------- filter chips for a list of items (projects, lines) ---------- */
  function chipFilter(group, items, match, countEl, noun, search){
    var chips = all('.chip', group), q = '';
    var current = function(){ var c = group.querySelector('.chip[aria-pressed="true"]'); return c ? c.getAttribute('data-f') : 'all'; };
    var apply = function(f){
      var n = 0;
      items.forEach(function(it){ var ok = match(it, f) && (!q || it.textContent.toLowerCase().indexOf(q) > -1); it.hidden = !ok; if(ok){ n++; it.classList.add('in'); } });
      if(countEl) countEl.textContent = n + ' ' + noun + (n === 1 ? '' : 's');
    };
    chips.forEach(function(ch){
      ch.addEventListener('click', function(){
        chips.forEach(function(c){ c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
        var f = ch.getAttribute('data-f'); apply(f);
        if(history.replaceState) history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
      });
    });
    if(search) search.addEventListener('input', function(){ q = search.value.trim().toLowerCase(); apply(current()); });
    var h = location.hash.slice(1), pre = h && group.querySelector('.chip[data-f="' + h + '"]');
    if(pre) pre.click();
  }
  var pf = $('pfilter');
  if(pf) chipFilter(pf, all('#pgrid .card'), function(it, f){ return f === 'all' || it.getAttribute('data-c').split(' ').indexOf(f) > -1; }, $('pcount'), 'project');
  var lf = $('lfilter');
  if(lf) chipFilter(lf, all('#lgrid li'), function(it, f){ return f === 'all' || it.getAttribute('data-c').split(' ').indexOf(f) > -1; }, $('lcount'), 'line', $('lsearch'));

  /* ---------- contact: find your account executive ---------- */
  var finder = $('finder');
  if(finder && D.reps){
    var st = $('f-state'), co = $('f-county'), coWrap = $('f-county-wrap'), out = $('f-out');
    var R = D.reps;
    var card = function(kind, p){
      if(!p) return '<div class="rep"><div class="none"><p class="k">' + kind + '</p><p>No account executive is listed for this area yet. Call <a href="tel:+18606458700">860.645.8700</a> and we will connect you.</p></div></div>';
      return '<div class="rep"><img src="/' + p.photo + '" alt="" width="72" height="72"><div><p class="k">' + kind + '</p><b>' + esc(p.name) + '</b>' +
        '<a href="tel:+1' + p.phone.replace(/\D/g, '') + '">' + p.phone + '</a><br><a class="link" href="/contact?to=' + p.slug + '#message">Send ' + esc(p.name.split(' ')[0]) + ' a message</a></div></div>';
    };
    var find = function(div, s, c){
      return R.people.filter(function(p){ return p.div === div && p.areas[s] && (p.areas[s] === 'all' || (c && p.areas[s].indexOf(c) > -1)); })[0];
    };
    var show = function(){
      var s = st.value, c = co.value;
      if(!s){ out.innerHTML = ''; return; }
      var needs = R.counties[s];
      if(needs && !c){ out.innerHTML = '<p class="muted">Pick a county.</p>'; return; }
      out.innerHTML = card('Furniture', find('furn', s, c)) + card('Bleachers, seating and gym equipment', find('arch', s, c));
    };
    st.addEventListener('change', function(){
      var list = R.counties[st.value];
      coWrap.hidden = !list;
      co.innerHTML = '<option value="">Choose a county</option>' + (list || []).map(function(c){ return '<option>' + c + '</option>'; }).join('');
      show();
    });
    co.addEventListener('change', show);
  }

  /* ---------- contact: demo message form (not connected to anything yet) ---------- */
  var form = $('cform');
  if(form){
    var to = new URLSearchParams(location.search).get('to'), sel = $('c-to');
    if(to && sel && sel.querySelector('option[value="' + to + '"]')) sel.value = to;
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      if(!form.reportValidity()) return;
      var msg = $('c-sent'); msg.hidden = false; msg.focus();
    });
  }
})();
