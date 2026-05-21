(function () {
  'use strict';

  var MIN = 30, MAX = 700;
  var STORAGE_KEY    = 'jarapa_draft_id';
  var CHECKOUT_KEY   = 'jarapa_checkout_url';

  function rate(m2) {
    return m2 < 1 ? 150 : m2 <= 3 ? 105 : 95;
  }

  function init() {
    var root = document.getElementById('pc-root');
    if (!root) return;

    var workerUrl    = root.dataset.workerUrl;
    var productTitle = root.dataset.productTitle || 'Persiana a medida';
    var sectionId    = root.dataset.sectionId;

    var aEl   = document.getElementById('pc-ancho');
    var lEl   = document.getElementById('pc-largo');
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

    // Botón "Ir al pago" persistente
    var checkoutBtn = document.getElementById('pc-checkout-btn');
    if (!checkoutBtn && btn) {
      checkoutBtn = document.createElement('a');
      checkoutBtn.id = 'pc-checkout-btn';
      checkoutBtn.style.cssText = 'display:none;margin-top:8px;width:100%;text-align:center;padding:14px;background:#c8824a;color:#fff;font-weight:700;font-size:1rem;border-radius:4px;text-decoration:none;box-sizing:border-box;';
      btn.parentNode.insertBefore(checkoutBtn, btn.nextSibling);
    }

    // Mostrar botón "Ir al pago" si ya hay items en el carrito
    var savedCheckout = localStorage.getItem(CHECKOUT_KEY);
    var savedCount    = parseInt(localStorage.getItem(STORAGE_KEY + '_count') || '0');
    if (checkoutBtn && savedCheckout && savedCount > 0) {
      checkoutBtn.href        = savedCheckout;
      checkoutBtn.textContent = 'Ir al pago (' + savedCount + ' ' + (savedCount === 1 ? 'persiana' : 'persianas') + ')';
      checkoutBtn.style.display = 'block';
    }

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
      hpEl.value = u.toFixed(2);   // precio por unidad
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

      var draftId = localStorage.getItem(STORAGE_KEY);

      fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ancho:          ancho,
          largo:          largo,
          precio:         precio.toFixed(2),
          cantidad:       cantidad,
          titulo:         productTitle,
          draft_order_id: draftId || null
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.checkout_url) throw new Error('sin checkout_url');

          // Guardar estado del carrito
          localStorage.setItem(STORAGE_KEY, data.draft_order_id);
          localStorage.setItem(CHECKOUT_KEY, data.checkout_url);
          var prev = parseInt(localStorage.getItem(STORAGE_KEY + '_count') || '0');
          var next = prev + cantidad;
          localStorage.setItem(STORAGE_KEY + '_count', next);

          // Mostrar confirmación en el botón
          if (btn)    { btn.classList.remove('loading'); }
          if (spanEl) spanEl.textContent = '✓ A\xF1adida al carrito';
          if (spinEl) spinEl.classList.add('hidden');
          btn.disabled = false;

          // Mostrar / actualizar botón "Ir al pago"
          if (checkoutBtn) {
            checkoutBtn.href        = data.checkout_url;
            checkoutBtn.textContent = 'Ir al pago (' + next + ' ' + (next === 1 ? 'persiana' : 'persianas') + ')';
            checkoutBtn.style.display = 'block';
          }

          // Resetear medidas después de 2 s
          setTimeout(function () {
            aEl.value = '';
            lEl.value = '';
            if (qEl2) qEl2.value = '1';
            update();
            if (spanEl) spanEl.textContent = 'A\xF1adir al carrito';
          }, 2000);
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
