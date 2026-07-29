/* =========================================================
   Barker & Bloom — script.js (v2)
   ========================================================= */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scrolled state ---------- */
  var nav = document.getElementById('nav');
  function navState() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', navState, { passive: true });
  navState();

  /* ---------- Nav clearance: derive --nav-space from the nav's real height ---------- */
  var navInner = document.querySelector('.nav__inner');
  function setNavSpace() {
    if (!navInner) return;
    var inset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-inset'), 10) || 12;
    var h = Math.round(navInner.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--nav-space', (h + inset + 30) + 'px');
  }
  setNavSpace();
  window.addEventListener('resize', setNavSpace, { passive: true });
  window.addEventListener('load', setNavSpace);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setNavSpace);

  /* ---------- Scroll spy: highlight the current section's nav link ----------
     Measures live rather than caching offsets: lazy-loaded images shift the
     page after load, which left cached values stale (one section never lit). */
  var navLinks = document.querySelectorAll('.nav__links a');
  var SPY_IDS = ['home', 'services', 'gallery', 'reviews', 'team', 'faq', 'book', 'visit'];
  var spySecs = SPY_IDS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var curSpy = '', spyTicking = false;
  function updateSpy() {
    if (!spySecs.length) return;
    var cur = spySecs[0];
    for (var i = 0; i < spySecs.length; i++) {
      if (spySecs[i].getBoundingClientRect().top <= 120) cur = spySecs[i]; else break;
    }
    if (cur.id === curSpy) return;
    curSpy = cur.id;
    navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + cur.id); });
  }
  function onScrollSpy() {
    if (spyTicking) return; spyTicking = true;
    requestAnimationFrame(function () { updateSpy(); spyTicking = false; });
  }
  updateSpy();
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  window.addEventListener('load', updateSpy);

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
     PAW FIELD — ambient scattered paws on three depth layers.
     Each layer is translated by scrollY * factor, so it scrolls
     slower than the page and reads as further away.
     ========================================================== */
  var field = document.getElementById('pawField');
  if (field) {
    var PAW_D = 'M12 14.5c2.2 0 4.4 1.6 4.4 3.6 0 1.4-1.2 2.4-2.8 2.4-.8 0-1.2-.3-1.6-.3s-.8.3-1.6.3c-1.6 0-2.8-1-2.8-2.4 0-2 2.2-3.6 4.4-3.6ZM6.4 8.8a1.9 2.4 0 1 0 .01 0ZM17.6 8.8a1.9 2.4 0 1 0 .01 0ZM9.4 5.4a1.7 2.2 0 1 0 .01 0ZM14.6 5.4a1.7 2.2 0 1 0 .01 0Z';
    // deterministic scatter so the pattern is stable across reloads/resizes
    var seed = 20260728;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    // furthest layer first: smallest, faintest, slowest-looking (largest factor).
    // `spacing` is roughly one paw per N px of that layer's visible band.
    var LAYERS = [
      { spacing: 120, size: 17, cls: 'far',  factor: 0.50 },
      { spacing: 210, size: 28, cls: 'mid',  factor: 0.32 },
      { spacing: 360, size: 42, cls: 'near', factor: 0.17 }
    ];
    var layerEls = [];
    function buildField() {
      seed = 20260728;                       // reset so the scatter is reproducible
      field.innerHTML = ''; layerEls = [];
      var docH = document.documentElement.scrollHeight, vh = window.innerHeight;
      var svgns = 'http://www.w3.org/2000/svg';
      LAYERS.forEach(function (L) {
        var el = document.createElement('div');
        el.className = 'paw-layer paw-layer--' + L.cls;
        // A layer translating down by scrollY*f only ever reveals this much of
        // itself, so scatter within that band instead of the whole page height
        // (otherwise the slowest layer wastes half its paws off-screen).
        var band = (docH - vh) * (1 - L.factor) + vh;
        var n = Math.max(6, Math.round(band / L.spacing));
        for (var i = 0; i < n; i++) {
          var s = document.createElementNS(svgns, 'svg');
          s.setAttribute('viewBox', '0 0 24 24');
          s.setAttribute('width', L.size); s.setAttribute('height', L.size);
          s.style.left = (rnd() * 94 + 3) + '%';
          s.style.top = Math.round(rnd() * band) + 'px';
          s.style.transform = 'rotate(' + Math.round(rnd() * 360) + 'deg)';
          var pa = document.createElementNS(svgns, 'path'); pa.setAttribute('d', PAW_D);
          s.appendChild(pa); el.appendChild(s);
        }
        field.appendChild(el);
        layerEls.push({ el: el, factor: L.factor });
      });
    }
    buildField();
    var fRt;
    function rebuildField() { clearTimeout(fRt); fRt = setTimeout(function () { buildField(); moveField(); }, 200); }
    window.addEventListener('resize', rebuildField, { passive: true });
    window.addEventListener('load', rebuildField);

    var fTicking = false;
    function moveField() {
      var y = window.scrollY || window.pageYOffset || 0;
      layerEls.forEach(function (L) {
        L.el.style.transform = 'translate3d(0,' + (y * L.factor).toFixed(1) + 'px,0)';
      });
    }
    if (!reduce) {
      window.addEventListener('scroll', function () {
        if (fTicking) return; fTicking = true;
        requestAnimationFrame(function () { moveField(); fTicking = false; });
      }, { passive: true });
      moveField();
    }
  }
})();
