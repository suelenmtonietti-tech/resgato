/* =========================================================
   Resgatô — landing page
   CONFIGURAÇÃO: preencha só o que estiver confirmado.
   Campos vazios = o botão correspondente se adapta sozinho
   (nenhum link quebrado aparece para o visitante).
   ========================================================= */
var RESGATO = {
  APP_STORE_URL: '',      // ex.: 'https://apps.apple.com/br/app/...'  (app iOS já aprovado — cole o link aqui)
  GOOGLE_PLAY_URL: '',    // ex.: 'https://play.google.com/store/apps/details?id=...'  (quando o Google aprovar)
  WHATSAPP_NUMBER: '',    // só números, com DDI+DDD. ex.: '5544999999999'
  WHATSAPP_MESSAGE: 'Olá, conheci o Resgatô pela landing page e gostaria de saber como minha empresa pode participar.',

  GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSf23S8OSqczXe7JsdE-TawGocUNQj9qhC3QG2aoN7wqlPll6A/formResponse',
  GOOGLE_FORM_FIELDS: {
    email: 'entry.1922994181',
    phone: 'entry.1878943381',
    role: 'entry.1611930393',
    segment: '',          // cole o entry.XXXX do campo "Segmento" (estava pendente como entry.SUBSTITUA_AQUI)
    origem: ''            // opcional: crie um campo "Origem" no Form e cole o entry.XXXX (recebe utm_source/medium/campaign)
  }
};

(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function local(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- origem (UTM) ---------- */
  var params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    if (params.get(k)) store(k, params.get(k));
  });
  function utm() {
    return {
      utm_source: store('utm_source') || '(direct)',
      utm_medium: store('utm_medium') || '',
      utm_campaign: store('utm_campaign') || ''
    };
  }

  /* ---------- tracking ----------
     Envia para dataLayer (GTM/GA4). Se gtag ou fbq existirem, envia também. */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var payload = Object.assign({ event: event, ab_hero: abVariant }, utm(), data || {});
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') window.gtag('event', event, payload);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', event, payload);
  }
  window.resgatoTrack = track;

  /* ---------- teste A/B do título do hero ----------
     ?v=a ou ?v=b força a variante; senão sorteia e lembra no navegador. */
  // Título único: "Descubra lugares. Aproveite benefícios. Valorize o comércio local."
  // Para voltar a testar dois títulos, recrie dois <h1 data-ab-hero="a|b"> e sorteie a variante aqui.
  var abVariant = 'descubra-lugares';

  /* ---------- links de loja ---------- */
  var hasIOS = !!RESGATO.APP_STORE_URL, hasAndroid = !!RESGATO.GOOGLE_PLAY_URL;
  $$('[data-store="ios"]').forEach(function (a) {
    if (hasIOS) { a.href = RESGATO.APP_STORE_URL; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = '#baixar'; }
  });
  $$('[data-store="android"]').forEach(function (a) {
    if (hasAndroid) { a.href = RESGATO.GOOGLE_PLAY_URL; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.classList.add('opacity-60', 'cursor-default'); var s = a.querySelector('[data-store-label]'); if (s) s.textContent = 'Em breve no Google Play'; }
  });
  // CTA genérico "Baixar o app": vai direto à loja certa quando houver link
  $$('[data-download]').forEach(function (a) {
    var ua = navigator.userAgent || '';
    var isAndroid = /android/i.test(ua), isIOS = /iphone|ipad|ipod/i.test(ua);
    if (isAndroid && hasAndroid) { a.href = RESGATO.GOOGLE_PLAY_URL; a.target = '_blank'; a.rel = 'noopener'; }
    else if (isIOS && hasIOS) { a.href = RESGATO.APP_STORE_URL; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = '#baixar'; }
  });
  // Formulário "receber o link" só aparece se faltar algum link de loja
  var fallback = $('#form-cliente');
  if (fallback) fallback.hidden = hasIOS && hasAndroid;

  /* ---------- WhatsApp ---------- */
  var waURL = RESGATO.WHATSAPP_NUMBER
    ? 'https://wa.me/' + RESGATO.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(RESGATO.WHATSAPP_MESSAGE)
    : '';
  $$('[data-wa]').forEach(function (el) {
    if (waURL) { el.href = waURL; el.target = '_blank'; el.rel = 'noopener'; el.hidden = false; }
    else { el.hidden = true; }
  });

  /* ---------- cliques rastreados ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var ev = el.getAttribute('data-track');
    track(ev, { label: el.getAttribute('data-label') || (el.textContent || '').trim().slice(0, 60), location: el.getAttribute('data-loc') || '' });
  });

  /* ---------- segmento: pré-preenche o formulário ---------- */
  $$('[data-segment]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = $('#f-segmento'); if (sel) sel.value = b.getAttribute('data-segment');
      track('segment_click', { segment: b.getAttribute('data-segment') });
    });
  });

  /* ---------- Google Forms ---------- */
  function sendForm(data) {
    var F = RESGATO.GOOGLE_FORM_FIELDS, fd = new FormData();
    fd.append(F.email, data.email);
    fd.append(F.phone, data.phone);
    fd.append(F.role, data.role === 'empresa' ? 'EMPRESA' : 'CLIENTE FINAL');
    if (F.segment && data.segment) fd.append(F.segment, data.segment);
    if (F.origem) { var u = utm(); fd.append(F.origem, [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).join(' / ')); }
    return fetch(RESGATO.GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: fd }).catch(function () {});
  }
  function onlyDigits(s) { return (s || '').replace(/\D/g, ''); }
  function maskPhone(input) {
    input.addEventListener('input', function () {
      var d = onlyDigits(input.value).slice(0, 11), o = d;
      if (d.length > 2) o = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) o = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      input.value = o;
    });
  }
  $$('input[type="tel"]').forEach(maskPhone);

  function wireForm(form, role) {
    if (!form) return;
    var started = false, msg = form.querySelector('[data-form-msg]'), btn = form.querySelector('button[type="submit"]');
    form.addEventListener('focusin', function () {
      if (!started) { started = true; track(role === 'empresa' ? 'company_form_start' : 'consumer_form_start'); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), phone = form.phone.value.trim(), seg = form.segmento ? form.segmento.value : '';
      var err = '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = 'Confira o e-mail — parece que falta alguma coisa.';
      else if (onlyDigits(phone).length < 10) err = 'Coloque o WhatsApp com DDD, por exemplo (44) 99999-9999.';
      else if (form.segmento && !seg) err = 'Escolha o segmento da sua empresa.';
      if (err) { msg.textContent = err; msg.className = 'mt-3 text-[14px] font-semibold text-[#B3261E]'; return; }
      btn.disabled = true; var t = btn.textContent; btn.textContent = 'Enviando…';
      sendForm({ email: email, phone: phone, role: role, segment: seg }).then(function () {
        track(role === 'empresa' ? 'company_form_submit' : 'consumer_form_submit', { segment: seg });
        form.reset();
        msg.textContent = role === 'empresa'
          ? 'Recebemos! Vamos falar com você pelo WhatsApp para mostrar o Resgatô.'
          : 'Pronto! Vamos te mandar o link assim que o app estiver disponível para o seu celular.';
        msg.className = 'mt-3 rounded-2xl bg-lav-400 px-4 py-3 text-[15px] font-semibold text-brand-900';
        btn.disabled = false; btn.textContent = t;
      });
    });
  }
  wireForm($('#form-empresa'), 'empresa');
  wireForm($('#form-cliente'), 'cliente');

  /* ---------- FAQ ---------- */
  $$('details.faq').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq_open', { label: d.querySelector('summary').textContent.trim() }); });
  });

  /* ---------- demonstração em vídeo ---------- */
  var player = $('#demo-video'), title = $('#demo-title');
  function loadVideo(btn, autoplay) {
    $$('.vitem').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    player.poster = btn.getAttribute('data-poster');
    player.src = btn.getAttribute('data-src');
    title.textContent = btn.getAttribute('data-title');
    if (autoplay) { var p = player.play(); if (p && p.catch) p.catch(function () {}); }
  }
  $$('.vitem').forEach(function (b) {
    b.addEventListener('click', function () { loadVideo(b, true); track('video_select', { label: b.getAttribute('data-title') }); });
  });
  $$('.vtab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.vtab').forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      $$('[data-vpanel]').forEach(function (p) { p.hidden = p.getAttribute('data-vpanel') !== t.getAttribute('data-vtab'); });
      var first = $('[data-vpanel="' + t.getAttribute('data-vtab') + '"] .vitem');
      if (first) loadVideo(first, false);
      track('video_tab', { label: t.getAttribute('data-vtab') });
    });
  });
  if (player) {
    var played = {};
    player.addEventListener('play', function () {
      if (!played[player.src]) { played[player.src] = 1; track('video_play', { label: title.textContent }); }
    });
  }

  /* ---------- vídeos em loop: só carregam quando aparecem ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loops = $$('video[data-loop-src]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) v.src = v.getAttribute('data-loop-src');
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '200px' });
    loops.forEach(function (v) { vio.observe(v); });
  } else loops.forEach(function (v) { v.src = v.getAttribute('data-loop-src'); });

  /* ---------- section_view + profundidade de rolagem ---------- */
  if ('IntersectionObserver' in window) {
    var seen = {};
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting && !seen[id]) { seen[id] = 1; track('section_view', { section: id }); }
      });
    }, { threshold: 0.35 });
    $$('section[id], header[id]').forEach(function (s) { sio.observe(s); });
  }
  var marks = [25, 50, 75, 100], hit = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement, pct = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; track('scroll_depth', { percent: m }); } });
  }, { passive: true });

  /* ---------- menu mobile ---------- */
  var mb = $('#menu-btn'), mm = $('#menu-mobile');
  if (mb && mm) {
    mb.addEventListener('click', function () {
      var open = mb.getAttribute('aria-expanded') === 'true';
      mb.setAttribute('aria-expanded', open ? 'false' : 'true'); mm.hidden = open;
    });
    $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { mb.setAttribute('aria-expanded', 'false'); mm.hidden = true; }); });
  }

  var y = $('#ano'); if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- galeria "Por dentro do app" ---------- */
(function () {
  var g = document.getElementById('galeria');
  if (!g) return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-gal]'), function (b) {
    b.addEventListener('click', function () {
      var item = g.querySelector('li'); var step = item ? item.getBoundingClientRect().width + 16 : 280;
      g.scrollBy({ left: step * parseInt(b.getAttribute('data-gal'), 10), behavior: 'smooth' });
    });
  });
})();
