/* =========================================================================
   5725 Trails Edge Ct — site behaviour
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     ANALYTICS CONFIGURATION
     ---------------------------------------------------------------------
     No measurement IDs were supplied for this property, so nothing is
     loaded and no events are sent. Do NOT paste in another property's IDs.

     To activate, fill in the values below with IDs issued for THIS
     property or for the Mysti Stewart Group / Compass account:

       ga4        'G-XXXXXXXXXX'
       googleAds  'AW-XXXXXXXXX'
       adsLabels  { cta_showing: 'AW-XXXXXXXXX/xxxxxxxxxxxxxxxx', ... }
       metaPixel  'XXXXXXXXXXXXXXX'

     Conversions fire on real visitor actions only — never on page load.
  --------------------------------------------------------------------- */
  var ANALYTICS = {
    /* GA4 is installed with Google's standard gtag.js snippet in the <head> of
       index.html. It is deliberately NOT loaded from here as well: two
       gtag('config', ...) calls for the same property double-count every
       pageview. To change the measurement ID, edit the snippet in the HTML. */
    googleAds: '',
    adsLabels: {},
    metaPixel: ''
  };

  window.dataLayer = window.dataLayer || [];

  function loadAnalytics() {
    /* Google Ads only. gtag.js itself is already on the page from the <head>
       snippet, so reuse it rather than loading a second copy. */
    if (ANALYTICS.googleAds) {
      if (typeof window.gtag !== 'function') {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS.googleAds);
        document.head.appendChild(s);
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
      }
      window.gtag('config', ANALYTICS.googleAds);
    }
    if (ANALYTICS.metaPixel) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', ANALYTICS.metaPixel);
      window.fbq('track', 'PageView');
    }
  }
  loadAnalytics();

  function track(name, params) {
    var data = Object.assign({ event: name, property: '5725-trails-edge-ct', mls: '21401750' }, params || {});
    window.dataLayer.push(data);
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, data);
      var label = ANALYTICS.adsLabels[name];
      if (label) window.gtag('event', 'conversion', { send_to: label });
    }
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, data);
  }
  window.msgTrack = track;

  /* Any element carrying data-track fires on activation. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { location: el.getAttribute('data-loc') || 'page' });
  });

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------ Year ------------------------------ */
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ------------------------------ Nav ------------------------------- */
  var nav = $('#nav'), toggle = $('#navToggle'), drawer = $('#drawer');

  function setDrawer(open) {
    if (!drawer || !toggle || !nav) return;
    drawer.hidden = !open;
    nav.setAttribute('data-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(drawer.hidden); });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) { setDrawer(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1040) setDrawer(false); });

  /* Scroll-spy */
  var navLinks = $$('.nav__links a');
  var spyTargets = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ------------------------------ Reveal ----------------------------- */
  function reveal(sel) {
    var els = $$(sel);
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var d = Math.min(i * 70, 280);
        setTimeout(function () { en.target.classList.add('is-in'); }, d);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------- Highlights ---------------------------- */
  /* Every highlight is drawn from NTREIS MLS #21401750 — the public remarks
     and the feature fields. Nothing here comes from anywhere else. */
  var HIGHLIGHTS = [
    ['A diving pool behind an iron safety fence', 'A large in-ground gunite diving pool with an iron safety fence and a pool sweep, with plenty of grassy space in the oversized backyard.'],
    ['Quiet cul-de-sac, oversized lot', 'The home sits at the end of a cul-de-sac on 0.24 acres, landscaped and on a sprinkler system.'],
    ['Primary suite on the main floor', 'A 17 × 15 primary bedroom downstairs, with dual vanities, a jetted tub, a separate shower and a walk-in closet.'],
    ['A den built for more than one job', 'A large den with a wet bar, built-in desks and extensive built-in storage — game room, home office, or both.'],
    ['Vaulted living room with a fireplace', 'A 20 × 15 living room under a vaulted ceiling, with a gas-log fireplace, opening to a formal dining area.'],
    ['Kitchen with a breakfast area', 'Granite counters, plenty of cabinetry and a large breakfast area that looks out over the backyard.'],
    ['Storage most homes do not have', 'An oversized utility room with space for a second refrigerator and a freezer, a walk-out attic upstairs, and a shed outside.'],
    ['No HOA, no PID, no MUD', 'No association dues or approvals, and no special district assessments on the tax bill.']
  ];
  var hlGrid = $('#hlGrid');
  if (hlGrid) {
    hlGrid.innerHTML = HIGHLIGHTS.map(function (h, i) {
      return '<article class="hl__item"><span class="hl__n">' + String(i + 1).padStart(2, '0') +
             '</span><h3>' + h[0] + '</h3><p>' + h[1] + '</p></article>';
    }).join('');
    reveal('.hl__item');
  }

  /* ----------------------------- Places ------------------------------ */
  /* Verifiable public places only (City of Arlington park pages, listing sources).
     No drive times or distances are published. */
  var PLACES = [
    ['Sheri Capehart Nature Preserve', 'City of Arlington nature preserve on Bowman Springs Road, formerly the Southwest Nature Preserve, with walking trails.'],
    ['The Parks Mall at Arlington', 'Regional shopping mall on the Interstate 20 corridor.'],
    ['Arlington Highlands', 'Open-air shopping, dining and entertainment center off Interstate 20.'],
    ['Tierra Verde Golf Club', 'City of Arlington public golf course in south Arlington.'],
    ['Interstate 20', 'Reached by way of SW Green Oaks Boulevard.'],
    ['Arlington Entertainment District', 'Home to AT&amp;T Stadium, Globe Life Field and Six Flags Over Texas.']
  ];
  var places = $('#places');
  if (places) {
    places.innerHTML = PLACES.map(function (p) {
      return '<li><b>' + p[0] + '</b><span>' + p[1] + '</span></li>';
    }).join('');
  }

  /* ----------------------------- Gallery ----------------------------- */
  var CATS = [
    ['all', 'All 7'],
    ['inside', 'Inside'],
    ['outside', 'Outside']
  ];

  /* slug, category, short caption, full alt text.
     Disclosure: every image that was virtually staged or AI-enhanced says so
     in its caption, which shows on the thumbnail and in the lightbox. Only
     the pool and side-yard photographs are unaltered camera files. */
  var PHOTOS = [
    ['exterior-front',   'outside', 'Front exterior · Digitally enhanced', 'Two-story brick and Tudor-style front elevation with the attached covered carport at right. Image digitally enhanced.'],
    ['living-fireplace', 'inside',  'Living room · Virtually staged', 'Living room with a vaulted ceiling and a brick gas-log fireplace. Furniture is virtually staged.'],
    ['living-dining',    'inside',  'Living & dining · Virtually staged', 'Living room looking toward the formal dining area between brick columns. Furniture is virtually staged.'],
    ['kitchen',          'inside',  'Kitchen · Digitally enhanced', 'Kitchen with granite counters, tile backsplash and built-in cabinetry. Image digitally enhanced.'],
    ['primary-bedroom',  'inside',  'Primary bedroom · Virtually staged', 'Downstairs primary bedroom with the ensuite bath beyond. Furniture is virtually staged.'],
    ['pool',             'outside', 'Diving pool', 'In-ground gunite diving pool along the covered patio, inside the iron safety fence.'],
    ['side-yard',        'outside', 'Side yard', 'Grassy side yard beside the house, looking toward the fenced pool.']
  ];

  var galBar = $('#galBar'), galGrid = $('#galGrid');

  if (galBar && galGrid) {
    galBar.hidden = CATS.length < 2;
    galBar.innerHTML = CATS.map(function (c, i) {
      return '<button class="chip" type="button" data-cat="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + '</button>';
    }).join('');

    galGrid.innerHTML = PHOTOS.map(function (p, i) {
      return '<figure style="display:contents"><button class="gal__item" type="button" data-i="' + i + '" data-cat="' + p[1] + '"' + (/Virtually staged|Digitally enhanced/.test(p[2]) ? ' data-altered' : '') + ' aria-label="Open photo ' + (i + 1) + ' of ' + PHOTOS.length + ': ' + p[3] + '">' +
        '<picture>' +
          '<source type="image/webp" srcset="/assets/img/gallery/' + p[0] + '-t.webp">' +
          '<img src="/assets/img/gallery/' + p[0] + '-t.jpg" width="800" height="533" loading="' + (i < 4 ? 'eager' : 'lazy') + '" decoding="async" alt="' + p[3] + '">' +
        '</picture>' +
        '<figcaption>' + p[2] + '</figcaption>' +
      '</button></figure>';
    }).join('');

    galBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip'); if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      $$('.chip', galBar).forEach(function (c) { c.setAttribute('aria-pressed', String(c === btn)); });
      $$('.gal__item', galGrid).forEach(function (it) {
        it.hidden = !(cat === 'all' || it.getAttribute('data-cat') === cat);
      });
      track('gallery_filter', { filter: cat });
    });

    galGrid.addEventListener('click', function (e) {
      var it = e.target.closest('.gal__item'); if (!it) return;
      openLb(parseInt(it.getAttribute('data-i'), 10));
    });
  }

  /* ---------------------------- Lightbox ----------------------------- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  var lbIndex = 0, lbReturn = null;

  function visibleIdx() {
    return PHOTOS.map(function (_, i) { return i; }).filter(function (i) {
      var el = galGrid && galGrid.querySelector('[data-i="' + i + '"]');
      return el && !el.hidden;
    });
  }

  function renderLb() {
    var p = PHOTOS[lbIndex];
    lbImg.src = '/assets/img/gallery/' + p[0] + '.jpg';
    lbImg.alt = p[3];
    lbCap.innerHTML = '<b>' + p[2] + '</b>' + p[3];
    var list = visibleIdx();
    lbCount.textContent = (list.indexOf(lbIndex) + 1) + ' / ' + list.length;
  }

  function openLb(i) {
    if (!lb) return;
    lbReturn = document.activeElement;
    lbIndex = i; renderLb();
    lb.hidden = false;
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
    track('gallery_open', { photo: PHOTOS[i][0] });
  }
  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    document.body.classList.remove('is-locked');
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }
  function stepLb(d) {
    var list = visibleIdx(); if (!list.length) return;
    var at = list.indexOf(lbIndex);
    lbIndex = list[(at + d + list.length) % list.length];
    renderLb();
  }

  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { stepLb(-1); });
    $('#lbNext').addEventListener('click', function () { stepLb(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.id === 'lbStage') closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stepLb(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepLb(1); }
      else if (e.key === 'Tab') {
        var f = $$('button', lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    /* swipe */
    var x0 = null, y0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) stepLb(dx < 0 ? 1 : -1);
      x0 = y0 = null;
    }, { passive: true });
  }

  /* --------------------------- Tax estimator -------------------------- */
  /* The estimator markup is not on this page (no verified rate breakdown), so
     this block is inert. Set RATE and restore the markup to bring it back. */
  var RATE = 0;
  var priceEl = $('#calcPrice'), yEl = $('#calcYear'), mEl = $('#calcMonth');
  var usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function calc() {
    if (!priceEl) return;
    var v = parseFloat(String(priceEl.value).replace(/[^0-9.]/g, '')) || 0;
    v = Math.min(v, 100000000);
    var annual = v * RATE;
    if (!RATE) v = 0;
    yEl.textContent = v ? usd0.format(annual) : '—';
    mEl.textContent = v ? usd0.format(annual / 12) : '—';
  }
  if (priceEl) {
    var calcTimer;
    priceEl.addEventListener('input', function () {
      calc();
      clearTimeout(calcTimer);
      calcTimer = setTimeout(function () { track('tax_estimator_used'); }, 1200);
    });
    priceEl.addEventListener('blur', function () {
      var v = parseFloat(String(priceEl.value).replace(/[^0-9.]/g, ''));
      if (v) priceEl.value = usd0.format(Math.min(v, 100000000));
      calc();
    });
    calc();
  }

  /* ------------------------------- Map -------------------------------- */
  /* The map is embedded directly and loads itself lazily as the reader nears
     it. Record that it was actually seen, once, so the section still reports
     engagement now that there is no button to click. */
  var mapBox = $('#mapBox');
  if (mapBox && 'IntersectionObserver' in window) {
    var mapSeen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        track('map_viewed');
        mapSeen.disconnect();
      });
    }, { threshold: 0.35 });
    mapSeen.observe(mapBox);
  }

  /* ------------------------------ Form -------------------------------- */
  var form = $('#leadForm'), status = $('#formStatus'), submitBtn = $('#leadSubmit');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var fd = new FormData(form);
      var intent = fd.get('intent') || 'unspecified';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      status.hidden = true;

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd).toString()
      })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        status.hidden = false;
        status.textContent = 'Thank you — your request is on its way to Diane. You will hear back shortly. For anything urgent, call or text 214-803-6296.';
        submitBtn.textContent = 'Request Sent';
        track('form_submit_success', { intent: intent });
      })
      .catch(function () {
        status.hidden = false;
        status.textContent = 'Something went wrong sending that. Please call or text Diane at 214-803-6296, or email diane.beaty@compass.com.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Request';
        track('form_submit_error', { intent: intent });
      });
    });

    /* Deep-link intents: #contact?intent=valuation etc. set the dropdown. */
    $$('[data-intent]').forEach(function (el) {
      el.addEventListener('click', function () {
        var sel = $('#f-intent');
        if (sel) sel.value = el.getAttribute('data-intent');
      });
    });
  }

  /* --------------------------- Reveal sections ------------------------ */
  reveal('.rv');
})();
