(function () {
  'use strict';

  var MIN = 30, MAX = 700;

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

    function proceedWithOrder(ancho, largo, precio, cantidad) {
      var spanEl = btn && btn.querySelector('span');
      var spinEl = btn && btn.querySelector('.loading-overlay__spinner');

      if (btn)    { btn.disabled = true; btn.classList.add('loading'); }
      if (spanEl) spanEl.textContent = 'A\xF1adiendo…';
      if (spinEl) spinEl.classList.remove('hidden');

      sessionStorage.removeItem('jarapa_checkout_url');
      sessionStorage.removeItem('jarapa_draft_id');
      sessionStorage.removeItem('jarapa_worker_url');

      fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ancho:    ancho,
          largo:    largo,
          precio:   precio.toFixed(2),
          cantidad: cantidad,
          titulo:   productTitle
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.checkout_url) throw new Error('sin checkout_url');

          if (btn)    { btn.disabled = false; btn.classList.remove('loading'); }
          if (spanEl) spanEl.textContent = '✓ Persiana a\xF1adida — preparando tu pedido…';
          if (spinEl) spinEl.classList.add('hidden');

          // Mostrar toast de confirmación
          var toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#3a2a1a;color:#fff;padding:14px 24px;border-radius:8px;font-size:1rem;font-weight:600;z-index:99998;box-shadow:0 4px 16px rgba(0,0,0,0.3);text-align:center;';
          toast.textContent = '📦 Tu persiana est\xE1 lista — redirigiendo al pago…';
          document.body.appendChild(toast);

          fetch('/cart/clear.js', { method: 'POST' })
            .finally(function () {
              setTimeout(function () {
                window.location.href = data.checkout_url;
              }, 1500);
            });
        })
        .catch(function () {
          var spanEl2 = btn && btn.querySelector('span');
          var spinEl2 = btn && btn.querySelector('.loading-overlay__spinner');
          if (btn)     { btn.disabled = false; btn.classList.remove('loading'); }
          if (spanEl2) spanEl2.textContent = 'A\xF1adir al carrito';
          if (spinEl2) spinEl2.classList.add('hidden');
          alert('Error al procesar el pedido. Por favor, int\xE9ntalo de nuevo.');
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ancho    = parseFloat(aEl.value);
      var largo    = parseFloat(lEl.value);
      var precio   = parseFloat(hpEl.value);
      var qEl2     = form.querySelector('[name=quantity]');
      var cantidad = qEl2 ? (parseInt(qEl2.value) || 1) : 1;

      if (!ancho || !largo || !precio) return;

      // Comprobar si el carrito tiene otros artículos
      fetch('/cart.js')
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          if (cart.item_count > 0) {
            // Mostrar aviso modal antes de continuar
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;';
            var box = document.createElement('div');
            box.style.cssText = 'background:#fff;border-radius:12px;padding:28px 32px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:inherit;';
            var n = cart.item_count;
            var label = n === 1 ? '1 art\xEDculo' : n + ' art\xEDculos';
            box.innerHTML =
              '<p style="font-size:1.1rem;font-weight:700;margin:0 0 12px;color:#3a2a1a;">Tienes ' + label + ' en el carrito</p>' +
              '<p style="font-size:.95rem;color:#555;margin:0 0 24px;line-height:1.5;">La persiana personalizada se gestiona por separado. Al continuar, tu carrito actual se vaciará y te redirigiremos al pago de la persiana.<br><br>Puedes volver después para añadir el resto de productos.</p>' +
              '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
                '<button id="jarapa-cancel" style="padding:10px 18px;border:1px solid #ccc;background:#fff;border-radius:6px;cursor:pointer;font-size:.9rem;">Cancelar</button>' +
                '<button id="jarapa-confirm" style="padding:10px 18px;background:#3a2a1a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.9rem;font-weight:600;">Continuar con la persiana</button>' +
              '</div>';
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            document.getElementById('jarapa-cancel').addEventListener('click', function () {
              document.body.removeChild(overlay);
            });
            document.getElementById('jarapa-confirm').addEventListener('click', function () {
              document.body.removeChild(overlay);
              proceedWithOrder(ancho, largo, precio, cantidad);
            });
          } else {
            proceedWithOrder(ancho, largo, precio, cantidad);
          }
        })
        .catch(function () {
          // Si falla la comprobación del carrito, proceder igualmente
          proceedWithOrder(ancho, largo, precio, cantidad);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
