(function () {
  'use strict';

  var MIN = 30, MAX = 700;
  var DRAFT_KEY = 'jarapa_draft_id';

  function rate(m2) {
    return m2 < 1 ? 150 : m2 <= 3 ? 105 : 95;
  }

  function init() {
    var root = document.getElementById('pc-root');
    if (!root) return;

    var workerUrl    = root.dataset.workerUrl;
    var productTitle = root.dataset.productTitle || 'Persiana a medida';
    var sectionId    = root.dataset.sectionId;

    var aEl  = document.getElementById('pc-ancho');
    var lEl  = document.getElementById('pc-largo');
    if (!aEl || !lEl) return;

    var errEl = document.getElementById('pc-error');
    var boxEl = document.getElementById('pc-box');
    var valEl = document.getElementById('pc-val');
    var hpEl  = document.getElementById('pc-hp');
    var hmEl  = document.getElementById('pc-hm');

    var form = document.getElementById('product-form-' + sectionId)
             || document.querySelector('[data-type="add-to-cart-form"]');
    var btn  = form && (form.querySelector('[name=add]') || form.querySelector('button[type=submit]'));

    if (btn) btn.disabled = true;

    function update() {
      var a   = aEl.value ? parseFloat(aEl.value) : null;
      var l   = lEl.value ? parseFloat(lEl.value) : null;
      var qEl = form && form.querySelector('[name=quantity]');
      var q   = qEl ? (parseInt(qEl.value) || 1) : 1;

      var aInv = a !== null && (a < MIN || a > MAX);
      var lInv = l !== null && (l < MIN || l > MAX);

      aEl.style.borderColor = aInv ? 'rgb(192,57,43)' : '';
      lEl.style.borderColor = lInv ? 'rgb(192,57,43)' : '';

      if (aInv || lInv) {
        errEl.style.display = 'block';
        boxEl.style.background = 'rgb(248,224,221)';
        valEl.style.cssText = 'display:block;font-size:.875rem;color:rgb(192,57,43);margin-top:4px';
        valEl.textContent = 'No hacemos ese tama\xF1o';
        if (btn) btn.disabled = true;
        hpEl.value = ''; hmEl.value = '';
        return;
      }

      errEl.style.display = 'none';

      if (a === null || l === null) {
        boxEl.style.background = 'rgb(236,229,219)';
        valEl.style.cssText = 'display:block;font-size:.875rem;color:#aaa;margin-top:4px';
        valEl.textContent = 'Introduce tus medidas';
        if (btn) btn.disabled = true;
        hpEl.value = ''; hmEl.value = '';
        return;
      }

      var m2 = a * l / 10000;
      var r  = rate(m2);
      var u  = Math.ceil(m2 * r * 100) / 100;
      var t  = Math.ceil(u * q * 100) / 100;

      boxEl.style.background = 'rgb(232,151,122)';
      valEl.style.cssText = 'display:block;font-size:1.75rem;font-weight:700;color:#fff;margin-top:4px';
      valEl.textContent = '€ ' + t.toFixed(2).replace('.', ',');
      if (btn) btn.disabled = false;
      hpEl.value = u.toFixed(2);
      hmEl.value = m2.toFixed(4);
    }

    aEl.addEventListener('input', update);
    lEl.addEventListener('input', update);
    var qEl = form && form.querySelector('[name=quantity]');
    if (qEl) qEl.addEventListener('change', update);

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ancho    = parseFloat(aEl.value);
      var largo    = parseFloat(lEl.value);
      var precio   = parseFloat(hpEl.value);
      var qEl2     = form.querySelector('[name=quantity]');
      var cantidad = qEl2 ? (parseInt(qEl2.value) || 1) : 1;

      if (!ancho || !largo || !precio) return;

      var spanEl = btn && btn.querySelector('span');
      var spinEl = btn && btn.querySelector('.loading-overlay__spinner');

      if (btn)    { btn.disabled = true; btn.classList.add('loading'); }
      if (spanEl) spanEl.textContent = 'A\xF1adiendo…';
      if (spinEl) spinEl.classList.remove('hidden');

      var draftId = sessionStorage.getItem(DRAFT_KEY) || null;

      fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ancho:          ancho,
          largo:          largo,
          precio:         precio.toFixed(2),
          cantidad:       cantidad,
          titulo:         productTitle,
          draft_order_id: draftId
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.checkout_url) throw new Error('sin checkout_url');

          sessionStorage.setItem(DRAFT_KEY, String(data.draft_order_id));

          document.dispatchEvent(new CustomEvent('persiana:added', {
            detail: { checkoutUrl: data.checkout_url, draftOrderId: data.draft_order_id }
          }));

          if (btn)    { btn.disabled = false; btn.classList.remove('loading'); }
          if (spanEl) spanEl.textContent = '✓ A\xF1adida';
          if (spinEl) spinEl.classList.add('hidden');

          aEl.value = ''; lEl.value = '';
          if (qEl2) qEl2.value = '1';
          hpEl.value = ''; hmEl.value = '';
          update();

          setTimeout(function () {
            if (spanEl) spanEl.textContent = 'A\xF1adir al carrito';
          }, 3000);
        })
        .catch(function () {
          if (btn)    { btn.disabled = false; btn.classList.remove('loading'); }
          if (spanEl) spanEl.textContent = 'A\xF1adir al carrito';
          if (spinEl) spinEl.classList.add('hidden');
          alert('Error al procesar el pedido. Por favor, int\xE9ntalo de nuevo.');
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
