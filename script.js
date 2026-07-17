/* =========================================================
   Barker & Bloom — script.js (v2)
   ========================================================= */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scrolled state ---------- */
  var nav = document.getElementById('nav');
  function navState() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', navState, { passive: true });
  navState();

  /* ---------- Nav scroll-position capsule (scroll spy) ---------- */
  var spyLabel = document.getElementById('spyLabel');
  var navLinks = document.querySelectorAll('.nav__links a');
  var SPY = { home: 'Arrive', services: 'The pamper', gallery: 'The glow-up', reviews: 'Kind words', team: 'Meet Rosie', faq: 'Ask Rosie', book: 'Book a groom', visit: 'Find us' };
  var spySecs = [];
  function measureSpy() {
    spySecs = Object.keys(SPY).map(function (id) {
      var el = document.getElementById(id);
      return el ? { id: id, label: SPY[id], top: el.offsetTop } : null;
    }).filter(Boolean).sort(function (a, b) { return a.top - b.top; });
  }
  var curSpy = '';
  function updateSpy() {
    if (!spySecs.length) return;
    var line = (window.scrollY || 0) + 120, cur = spySecs[0];
    for (var i = 0; i < spySecs.length; i++) { if (spySecs[i].top <= line) cur = spySecs[i]; else break; }
    if (cur.label === curSpy) return;
    curSpy = cur.label;
    if (spyLabel) {
      if (reduce) spyLabel.textContent = cur.label;
      else { spyLabel.style.opacity = '0'; setTimeout(function () { spyLabel.textContent = cur.label; spyLabel.style.opacity = '1'; }, 130); }
    }
    navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + cur.id); });
  }
  measureSpy(); updateSpy();
  window.addEventListener('scroll', updateSpy, { passive: true });
  window.addEventListener('load', function () { measureSpy(); updateSpy(); });

  /* ---------- Mobile overlay menu ---------- */
  var hamburger = document.getElementById('hamburger'),
      menu = document.getElementById('mobileMenu'),
      scrim = document.getElementById('menuScrim'),
      closeBtn = document.getElementById('menuClose'),
      lastFocused = null;
  function focusables() { return menu ? menu.querySelectorAll('a[href], button') : []; }
  function openMenu() {
    lastFocused = document.activeElement;
    scrim.hidden = false; menu.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('is-open'); menu.classList.add('is-open'); });
    document.body.classList.add('menu-open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', menuKey);
  }
  function closeMenu() {
    scrim.classList.remove('is-open'); menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', menuKey);
    var done = function () { menu.hidden = true; scrim.hidden = true; menu.removeEventListener('transitionend', done); };
    if (reduce) { menu.hidden = true; scrim.hidden = true; } else menu.addEventListener('transitionend', done);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  function menuKey(e) {
    if (e.key === 'Escape') return closeMenu();
    if (e.key === 'Tab') {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Trust marquee: duplicate track for seamless loop ---------- */
  var mqTrack = document.querySelector('.marquee__track');
  if (mqTrack) {
    var originals = Array.prototype.slice.call(mqTrack.children);
    originals.forEach(function (chip) {
      var c = chip.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      mqTrack.appendChild(c);
    });
  }

  /* ---------- Before / After sliders ---------- */
  document.querySelectorAll('[data-ba]').forEach(function (stage) {
    var beforeWrap = stage.querySelector('.ba__before-wrap');
    var handle = stage.querySelector('.ba__handle');
    var value = 50, dragging = false, decided = false, startX = 0, startY = 0, pid = null;
    function apply(v) {
      value = Math.max(0, Math.min(100, v));
      beforeWrap.style.clipPath = 'inset(0 ' + (100 - value) + '% 0 0)';
      handle.style.left = value + '%';
      stage.setAttribute('aria-valuenow', Math.round(value));
    }
    function pctFromX(clientX) {
      var r = stage.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }
    stage.addEventListener('pointerdown', function (e) {
      startX = e.clientX; startY = e.clientY; pid = e.pointerId; decided = false;
      if (e.pointerType === 'mouse') { // mouse: drag immediately
        dragging = true; decided = true; stage.setPointerCapture(pid); apply(pctFromX(e.clientX)); e.preventDefault();
      }
    });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      if (!decided && e.pointerType !== 'mouse') {
        var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;          // not enough movement yet
        if (dy > dx) { pid = null; return; }   // vertical intent -> let the page scroll
        decided = true; dragging = true;
        try { stage.setPointerCapture(e.pointerId); } catch (x) {}
      }
      if (dragging) { apply(pctFromX(e.clientX)); }
    });
    function end(e) { if (dragging) { dragging = false; } decided = false; pid = null; }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft') { apply(value - step); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { apply(value + step); e.preventDefault(); }
      else if (e.key === 'Home') { apply(0); e.preventDefault(); }
      else if (e.key === 'End') { apply(100); e.preventDefault(); }
    });
    apply(50);
  });

  /* ---------- Booking stepper ---------- */
  var form = document.getElementById('bookForm');
  if (form) {
    var steps = form.querySelectorAll('.step');
    var countEl = document.getElementById('stepCount');
    var dots = form.querySelectorAll('.dot-node');
    var summary = document.getElementById('summaryChip');
    var current = 1;

    function showStep(n, opts) {
      opts = opts || {};
      current = n;
      steps.forEach(function (s) { s.hidden = (parseInt(s.dataset.step, 10) !== n); });
      if (countEl) countEl.textContent = 'Step ' + n + ' of 2';
      dots.forEach(function (d) {
        var dn = parseInt(d.dataset.dot, 10);
        d.classList.toggle('is-active', dn === n);
        d.classList.toggle('is-done', dn < n);
      });
      updateSummary();
      if (opts.scroll !== false) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (opts.focus !== false) {
        var target = form.querySelector('.step[data-step="' + n + '"] input, .step[data-step="' + n + '"] select, .step[data-step="' + n + '"] .sizecard');
        if (target && target.focus) setTimeout(function () { target.focus(); }, reduce ? 0 : 260);
      }
    }
    function updateSummary() {
      if (!summary) return;
      var size = form.querySelector('input[name="dogSize"]:checked');
      var svc = document.getElementById('service');
      var bits = [];
      if (svc && svc.value) bits.push(svc.value.replace('&amp;', '&'));
      if (size) bits.push(size.value + ' dog');
      if (current === 2 && bits.length) { summary.hidden = false; summary.textContent = '🐾 ' + bits.join(' · '); }
      else summary.hidden = true;
    }

    var nextBtn = form.querySelector('[data-next]');
    if (nextBtn) nextBtn.addEventListener('click', function () {
      var size = form.querySelector('input[name="dogSize"]:checked');
      if (!size) { setErr('dogSize', 'Please pick your dog’s size to continue.'); var sp = form.querySelector('.sizecard'); if (sp) sp.focus(); return; }
      clearErr('dogSize'); showStep(2);
    });
    var backBtn = form.querySelector('[data-back]');
    if (backBtn) backBtn.addEventListener('click', function () { showStep(1); });

    // deep-link from services "Book" buttons
    document.querySelectorAll('[data-service]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var svcVal = btn.getAttribute('data-service').replace(/&amp;/g, '&');
        var svc = document.getElementById('service');
        if (svc) for (var i = 0; i < svc.options.length; i++) {
          if (svc.options[i].text.replace(/&amp;/g, '&') === svcVal) { svc.selectedIndex = i; break; }
        }
        var sizeVal = btn.getAttribute('data-size');
        if (sizeVal) { var r = form.querySelector('input[name="dogSize"][value="' + sizeVal + '"]'); if (r) r.checked = true; }
        var haveSize = !!form.querySelector('input[name="dogSize"]:checked');
        document.getElementById('book').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        showStep(haveSize ? 2 : 1, { scroll: false });
      });
    });

    // validation
    function validUKMobile(raw) { var v = raw.replace(/[\s()-]/g, ''); return /^(?:(?:\+44|0044|44)7\d{9}|07\d{9})$/.test(v); }
    function setErr(id, msg) {
      var el = document.getElementById(id) || form.querySelector('[name="' + id + '"]');
      var err = document.getElementById(id + '-err');
      if (el && el.setAttribute && el.tagName) el.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = msg; err.hidden = false; }
    }
    function clearErr(id) {
      var el = document.getElementById(id);
      var err = document.getElementById(id + '-err');
      if (el) el.removeAttribute('aria-invalid');
      if (err) { err.hidden = true; err.textContent = ''; }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var size = form.querySelector('input[name="dogSize"]:checked');
      if (!size) { setErr('dogSize', 'Please pick your dog’s size.'); showStep(1); return; }
      clearErr('dogSize');
      var ok = true, firstBad = null;
      [['ownerName', function (v) { return v.trim().length >= 2; }, 'Please tell us your name.'],
       ['mobile', function (v) { return validUKMobile(v); }, 'Enter a valid UK mobile, e.g. 07700 900123.'],
       ['service', function (v) { return !!v; }, 'Please choose a service.']
      ].forEach(function (c) {
        var el = document.getElementById(c[0]); var val = el ? el.value : '';
        if (!c[1](val)) { setErr(c[0], c[2]); ok = false; if (!firstBad) firstBad = el; }
        else clearErr(c[0]);
      });
      if (!ok) { if (current !== 2) showStep(2, { focus: false }); if (firstBad) firstBad.focus(); return; }

      var success = document.getElementById('bookSuccess');
      steps.forEach(function (s) { s.hidden = true; });
      form.querySelector('.stepper__bar').hidden = true;
      if (success) {
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        success.focus();
      }
    });
    ['ownerName', 'mobile', 'service'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', function () { clearErr(id); updateSummary(); }); el.addEventListener('change', function () { clearErr(id); updateSummary(); }); }
    });
    form.querySelectorAll('input[name="dogSize"]').forEach(function (r) { r.addEventListener('change', function () { clearErr('dogSize'); updateSummary(); }); });

    showStep(1, { scroll: false, focus: false });
  }

  /* ==========================================================
     PAW TRAIL — content-aware SVG path that draws on scroll
     ========================================================== */
  var trailHost = document.getElementById('pawTrail');
  var PAW_D = 'M12 14.5c2.2 0 4.4 1.6 4.4 3.6 0 1.4-1.2 2.4-2.8 2.4-.8 0-1.2-.3-1.6-.3s-.8.3-1.6.3c-1.6 0-2.8-1-2.8-2.4 0-2 2.2-3.6 4.4-3.6ZM6.4 8.8a1.9 2.4 0 1 0 .01 0ZM17.6 8.8a1.9 2.4 0 1 0 .01 0ZM9.4 5.4a1.7 2.2 0 1 0 .01 0ZM14.6 5.4a1.7 2.2 0 1 0 .01 0Z';
  var thread = null, paws = [], stations = [], threadLen = 0, docH = 0, vh = 0;

  function buildTrail() {
    if (!trailHost) return;
    trailHost.innerHTML = '';
    paws = []; stations = [];
    var vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    docH = document.body.scrollHeight;
    var contentW = Math.min(vw - 32, 1200);
    var gutter = (vw - contentW) / 2;
    var mobile = vw < 768 || gutter < 60;
    var showStations = !mobile && gutter >= 108;

    // waypoints: vertical centre of each main section, alternating side
    var secs = Array.prototype.slice.call(document.querySelectorAll('main > section'));
    var navBottom = 96;
    var pts = [];
    secs.forEach(function (sec, i) {
      var top = sec.offsetTop, h = sec.offsetHeight;
      var y = top + h * 0.5;
      y = Math.max(navBottom + 40, Math.min(docH - 60, y));
      var x;
      if (mobile) {
        // hug the edges (never behind centred headings)
        x = (i % 2 ? vw * 0.955 : vw * 0.045);
      } else {
        x = (i % 2 ? vw - gutter * 0.5 : gutter * 0.5);
      }
      pts.push({ x: x, y: y, sec: sec });
    });
    if (pts.length < 2) return;

    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', vw); svg.setAttribute('height', docH);
    svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + docH);
    svg.setAttribute('preserveAspectRatio', 'none');

    // smooth path (Catmull-Rom -> cubic bezier)
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
    }
    thread = document.createElementNS(SVGNS, 'path');
    thread.setAttribute('class', 'thread'); thread.setAttribute('d', d);
    svg.appendChild(thread);
    threadLen = thread.getTotalLength();

    // paws along the path
    var pawSize = mobile ? 16 : 26;
    var spacing = mobile ? 170 : 185;
    var count = Math.max(6, Math.floor(threadLen / spacing));
    for (var k = 1; k < count; k++) {
      var len = (k / count) * threadLen;
      var pt = thread.getPointAtLength(len);
      var pt2 = thread.getPointAtLength(Math.min(threadLen, len + 1));
      var ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI + 90;
      var g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'paw');
      var s = pawSize / 24;
      g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ') rotate(' + ang + ') scale(' + s + ') translate(-12,-12)');
      var path = document.createElementNS(SVGNS, 'path'); path.setAttribute('d', PAW_D);
      g.appendChild(path); svg.appendChild(g);
      paws.push({ el: g, y: pt.y });
    }

    // stations (desktop, roomy gutters only): the 4 data-stage sections
    if (showStations) {
      pts.forEach(function (p) {
        var label = p.sec.getAttribute('data-stage');
        if (!label) return;
        var g = document.createElementNS(SVGNS, 'g');
        g.setAttribute('class', 'station');
        g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
        var c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('r', '20'); g.appendChild(c);
        var pw = document.createElementNS(SVGNS, 'path');
        pw.setAttribute('class', 'st-paw'); pw.setAttribute('d', PAW_D);
        pw.setAttribute('transform', 'scale(1.05) translate(-12,-12)'); g.appendChild(pw);
        var t = document.createElementNS(SVGNS, 'text');
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('y', '42'); t.textContent = label;
        g.appendChild(t);
        svg.appendChild(g); stations.push({ el: g, y: p.y });
      });
    }

    trailHost.appendChild(svg);
    thread.style.strokeDasharray = threadLen;
    updateTrail(true);
  }

  function updateTrail(force) {
    if (!thread) return;
    if (reduce) {
      thread.style.strokeDashoffset = 0;
      paws.forEach(function (p) { p.el.classList.add('is-in'); });
      stations.forEach(function (s) { s.el.classList.add('is-in'); });
      return;
    }
    var sy = window.scrollY || window.pageYOffset;
    // Lead the scroll: draw the thread down to ~just below the viewport bottom,
    // so the line reaches the content you're reading instead of trailing behind.
    var progress = Math.max(0, Math.min(1, (sy + vh * 0.98) / (docH || 1)));
    thread.style.strokeDashoffset = threadLen * (1 - progress);
    // toggle (not latch) so the trail rewinds when you scroll back up
    var revealY = sy + vh * 0.94;
    paws.forEach(function (p) { p.el.classList.toggle('is-in', p.y <= revealY); });
    stations.forEach(function (s) { s.el.classList.toggle('is-in', s.y <= revealY); });
  }

  var ticking = false;
  function onScrollTrail() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { updateTrail(); ticking = false; });
  }

  if (trailHost) {
    var ready = function () { buildTrail(); };
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready);
    // rebuild after fonts/images may shift height
    window.addEventListener('load', function () { setTimeout(buildTrail, 400); });
    window.addEventListener('scroll', onScrollTrail, { passive: true });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { buildTrail(); measureSpy(); updateSpy(); }, 200); }, { passive: true });
    // rebuild when a FAQ item toggles (height change)
    document.querySelectorAll('.qa').forEach(function (q) { q.addEventListener('toggle', function () { clearTimeout(rt); rt = setTimeout(buildTrail, 60); }); });
  }
})();
