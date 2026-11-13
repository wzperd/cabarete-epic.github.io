/* Cabarete Épico. Efectos de scroll, contadores, galería, planificador y escena del día. */
(function () {
  'use strict';
  var app = document.querySelector('.cab-app');
  if (!app) return;

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  function $(s, c) { return (c || app).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || app).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* Imágenes reutilizadas: se copian de la galería para no duplicar datos */
  $$('img[data-use]').forEach(function (im) {
    var s = $('img[data-key="' + im.getAttribute('data-use') + '"]');
    if (s) im.src = s.currentSrc || s.src;
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var rv = $$('.cab-rv'), grid = $('.cab-grid');
  if (hasIO) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
    if (grid) io.observe(grid);
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
    if (grid) grid.classList.add('in');
  }
  if (grid) {
    $$('.c', grid).forEach(function (c) {
      var i = Array.prototype.indexOf.call(grid.children, c);
      c.style.animationDelay = ((i % 13) * 45) + 'ms';
    });
    var now = new Date().getMonth();
    $$('.m', grid).forEach(function (m, i) { if (i === now) m.classList.add('cur'); });
  }

  /* ---------- Contadores ---------- */
  var statsBox = $('.cab-stats');
  var counters = $$('[data-count]');
  function runCounters() {
    counters.forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1500;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = clamp((ts - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e).toLocaleString('es');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if (statsBox && hasIO && !reduce) {
    counters.forEach(function (el) { el.textContent = '0'; });
    var cio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { runCounters(); cio.disconnect(); }
    }, { threshold: 0.3 });
    cio.observe(statsBox);
  } else {
    counters.forEach(function (el) { el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString('es'); });
  }

  /* ---------- Inclinación 3D de tarjetas ---------- */
  if (!reduce && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.cab-card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------- Menú: scrollspy y cierre en móvil ---------- */
  try {
    if (window.bootstrap && bootstrap.ScrollSpy && $('#cabNav')) {
      new bootstrap.ScrollSpy(document.body, { target: '#cabNav', rootMargin: '-30% 0px -60% 0px', smoothScroll: false });
    }
  } catch (err) { /* sin scrollspy */ }
  var navCollapse = $('#cabMenu');
  $$('#cabMenu a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (navCollapse && navCollapse.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  /* ---------- Galería con visor ---------- */
  var tiles = $$('[data-light]');
  var modalEl = $('#cabLight');
  if (tiles.length && modalEl && window.bootstrap) {
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    var mImg = $('#cabLightImg'), mCap = $('#cabLightCap'), mCount = $('#cabLightCount'), cur = 0;
    var show = function (i) {
      cur = (i + tiles.length) % tiles.length;
      var im = $('img', tiles[cur]);
      mImg.src = im.currentSrc || im.src;
      mImg.alt = im.alt;
      mCap.textContent = tiles[cur].getAttribute('data-cap') || im.alt;
      mCount.textContent = (cur + 1) + ' / ' + tiles.length;
    };
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { show(i); modal.show(); }); });
    $('.cab-light__nav.prev', modalEl).addEventListener('click', function () { show(cur - 1); });
    $('.cab-light__nav.next', modalEl).addEventListener('click', function () { show(cur + 1); });
    modalEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- Costa: pestañas de las playas ---------- */
  /* Bootstrap maneja las pestañas; aquí solo se marca el nodo activo para el estilo. */

  /* ---------- Planificador ---------- */
  var plOut = $('#plOut'), plMonth = $('#plMonth');
  if (plOut && plMonth) {
    var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var CAP = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    var BUSY = [0, 1, 2, 3, 6, 7, 11];
    var STORM = [5, 6, 7, 8, 9];
    var INTERES = {
      kite: { n: 'Kitesurf', tip: 'En Kite Beach hay escuelas para todos los niveles. Los vientos de tarde son los más estables para aprender.' },
      surf: { n: 'Surf', tip: 'Playa Encuentro es de las más constantes del Caribe. Para surfistas con experiencia, lo mejor suele ser por la tarde.' },
      wind: { n: 'Windsurf y paddle', tip: 'Cabarete es famoso por el windsurf, con condiciones parecidas a las del kitesurf. Las lagunas y ríos cercanos sirven para paddle.' },
      nature: { n: 'Naturaleza', tip: 'Con o sin viento: cuevas en El Choco, cascadas en los 27 Charcos de Damajagua y paseos a caballo junto al mar.' },
      family: { n: 'Plan en familia', tip: 'Es un destino económico y apto para familias. La zona de Kite Beach es más para deportistas, así que elige hotel con calma.' }
    };
    var renderPlan = function () {
      var key = ($('input[name="pl-i"]:checked') || {}).value || 'kite';
      var m = parseInt(plMonth.value, 10);
      var kiteSeason = m >= 1 && m <= 7;
      var waveSeason = m >= 8 || m === 0;
      var dry = m === 11 || m <= 3;
      var storm = STORM.indexOf(m) > -1;
      var busy = BUSY.indexOf(m) > -1;
      var good = key === 'kite' || key === 'wind' ? kiteSeason : key === 'surf' ? waveSeason : key === 'nature' ? dry : !storm;
      var score = (good ? 2 : 1) + (storm ? 0 : 1);
      var verdict = score === 3 ? ['Muy buen momento', ''] : score === 2 ? ['Buen momento', 'mid'] : ['Posible, con matices', 'low'];
      var wind = kiteSeason ? 'De febrero a agosto hay vientos térmicos y alisios, lo mejor para kite y windsurf.'
        : 'Hay viento, pero la temporada más fuerte va de febrero a agosto.';
      var waves = waveSeason ? 'De septiembre a enero llegan más olas para surf, sobre todo por la mañana.'
        : 'Hay olas, aunque las más grandes llegan entre septiembre y enero.';
      var crowd = busy ? 'Temporada alta. En la playa principal cuesta encontrar espacio después de las 10 a. m.'
        : 'Temporada más tranquila. Hay más espacio en la playa y en las escuelas.';
      var clima = storm ? 'De junio a octubre hay lluvias y es temporada de huracanes. Los impactos directos son poco frecuentes, pero revisa el pronóstico.'
        : dry ? 'Temporada seca, con 25 a 28 °C.' : 'Sin temporada de huracanes. Puede haber lluvias.';
      plOut.innerHTML =
        '<div class="cab-verdict ' + verdict[1] + '"><i></i>' + verdict[0] + '</div>' +
        '<h3>' + INTERES[key].n + ' en ' + MESES[m] + '</h3>' +
        '<div class="cab-rows">' +
        '<div class="cab-row"><b>Viento</b><span>' + wind + '</span></div>' +
        '<div class="cab-row"><b>Olas</b><span>' + waves + '</span></div>' +
        '<div class="cab-row"><b>Gente</b><span>' + crowd + '</span></div>' +
        '<div class="cab-row"><b>Clima</b><span>' + clima + '</span></div>' +
        '</div><div class="cab-tip"><b>Consejo.</b> ' + INTERES[key].tip + '</div>';
    };
    plMonth.value = String(new Date().getMonth());
    $$('input[name="pl-i"]').forEach(function (r) { r.addEventListener('change', renderPlan); });
    plMonth.addEventListener('change', renderPlan);
    renderPlan();
  }

  /* ---------- Escena de un día ---------- */
  var dayEl = $('.cab-day'), arc = $('.cab-arc');
  var sun = $('#arcSun'), moon = $('#arcMoon'), stars = $('#arcStars'), clock = $('#arcClock'), steps = $$('.cab-step');
  var KEYS = [
    { p: 0.00, t: [43, 74, 122], b: [242, 166, 107] },
    { p: 0.34, t: [31, 143, 209], b: [154, 217, 240] },
    { p: 0.70, t: [58, 46, 107], b: [255, 123, 77] },
    { p: 1.00, t: [4, 12, 26], b: [14, 42, 68] }
  ];
  function mix(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function skyAt(p) {
    for (var i = 0; i < KEYS.length - 1; i++) {
      if (p <= KEYS[i + 1].p) {
        var t = (p - KEYS[i].p) / (KEYS[i + 1].p - KEYS[i].p);
        return { t: mix(KEYS[i].t, KEYS[i + 1].t, t), b: mix(KEYS[i].b, KEYS[i + 1].b, t) };
      }
    }
    return { t: KEYS[3].t, b: KEYS[3].b };
  }
  function drawDay(vh) {
    if (!dayEl || !arc) return;
    var r = dayEl.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    var p = clamp((vh * 0.5 - r.top) / Math.max(1, r.height - vh * 0.2), 0, 1);
    var c = skyAt(p);
    arc.style.background = 'linear-gradient(180deg, rgb(' + c.t.join(',') + '), rgb(' + c.b.join(',') + '))';
    var ps = clamp(p / 0.78, 0, 1);
    sun.setAttribute('transform', 'translate(' + (40 + 320 * ps).toFixed(1) + ' ' + (190 - 150 * Math.sin(Math.PI * ps)).toFixed(1) + ')');
    sun.setAttribute('opacity', (1 - smooth(0.66, 0.84, p)).toFixed(2));
    var pm = clamp((p - 0.62) / 0.38, 0, 1);
    moon.setAttribute('transform', 'translate(' + (300 - 120 * pm).toFixed(1) + ' ' + (196 - 140 * Math.sin(pm * Math.PI / 2)).toFixed(1) + ')');
    moon.setAttribute('opacity', smooth(0.7, 0.92, p).toFixed(2));
    stars.setAttribute('opacity', smooth(0.72, 0.98, p).toFixed(2));
    var hrs = 6.5 + 15.5 * p, h = Math.floor(hrs), mi = Math.floor((hrs - h) * 60 / 5) * 5;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    clock.firstChild.nodeValue = h12 + ':' + (mi < 10 ? '0' : '') + mi + (h < 12 ? ' a. m.' : ' p. m.');
    var idx = p < 0.34 ? 0 : p < 0.74 ? 1 : 2;
    steps.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
    clock.lastChild.textContent = ['Mañana', 'Tarde', 'Noche'][idx];
  }

  /* ---------- Bucle principal: parallax, progreso, cometa flotante, agua ---------- */
  var nav = $('.cab-nav'), bar = $('.cab-progress'), hero = $('.cab-hero'), heroBg = $('.cab-hero__bg');
  var band = $('.cab-band'), bandImg = band ? $('img', band) : null, fly = $('.cab-fly');
  var lastY = -1, lastW = 0;

  function frame(ts) {
    var t = ts / 1000, y = window.pageYOffset || 0, vh = window.innerHeight, vw = window.innerWidth;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = clamp(y / max, 0, 1);
    if (y !== lastY) {
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (nav) nav.classList.toggle('is-solid', y > 40);
      if (!reduce) {
        if (hero && heroBg && y < hero.offsetHeight + 40) heroBg.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0) scale(1.04)';
        if (band && bandImg) {
          var r = band.getBoundingClientRect();
          if (r.bottom > -60 && r.top < vh + 60) bandImg.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -0.14).toFixed(1) + 'px,0)';
        }
      }
      drawDay(vh);
      lastY = y;
    }
    if (fly && !reduce) {
      var hh = hero ? hero.offsetHeight : 600;
      fly.style.opacity = clamp((y - hh * 0.6) / 260, 0, 0.92).toFixed(2);
      var fx = vw - 58 + Math.sin(t * 0.8 + p * 7) * 12;
      var fy = vh * (0.18 + 0.58 * p) + Math.sin(t * 1.1) * 9;
      fly.style.transform = 'translate3d(' + fx.toFixed(1) + 'px,' + fy.toFixed(1) + 'px,0) rotate(' + (Math.sin(t * 0.9) * 13).toFixed(1) + 'deg)';
    }
    if (vw !== lastW) { lastW = vw; drawDay(vh); }
    if (!document.hidden) window.requestAnimationFrame(frame);
    else document.addEventListener('visibilitychange', function resume() { document.removeEventListener('visibilitychange', resume); window.requestAnimationFrame(frame); });
  }
  window.requestAnimationFrame(frame);

  /* ---------- Formulario (vista previa) ---------- */
  var form = $('form[data-preview]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = $('.cab-form__status', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      st.innerHTML = '<div class="cab-alert">Esto es una vista previa y el mensaje no se envía. En WordPress, este formulario manda el mensaje al correo del sitio.</div>';
    });
  }
})();
