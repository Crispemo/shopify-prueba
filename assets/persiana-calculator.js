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

    function sendOrder(ancho, largo, precio, cantidad, cartItems) {
      var spanEl = btn && btn.querySelector('span');
      var spinEl = btn && btn.querySelector('.loading-overlay__spinner');

      if (btn)    { btn.disabled = true; btn.classList.add('loading'); }
      if (spanEl) spanEl.textContent = 'A\xF1adiendo…';
      if (spinEl) spinEl.classList.remove('hidden');

      sessionStorage.removeItem('jarapa_checkout_url');
      sessionStorage.removeItem('jarapa_draft_id');
      sessionStorage.removeItem('jarapa_worker_url');

      var payload = {
        ancho:    ancho,
        largo:    largo,
        precio:   precio.toFixed(2),
        cantidad: cantidad,
        titulo:   productTitle,
      };
      if (cartItems && cartItems.length > 0) {
        payload.cart_items = cartItems.map(function (i) {
          return { variant_id: i.variant_id, quantity: i.quantity };
        });
      }

      fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.checkout_url) throw new Error('sin checkout_url');

          if (btn)    { btn.disabled = false; btn.classList.remove('loading'); }
          if (spanEl) spanEl.textContent = '✓ Persiana a\xF1adida — preparando tu pedido…';
          if (spinEl) spinEl.classList.add('hidden');

          var extra = cartItems && cartItems.length > 0
            ? ' y ' + cartItems.length + ' art\xEDculo' + (cartItems.length > 1 ? 's m\xE1s' : ' m\xE1s')
            : '';

          var toast = document.createElement('div');
          toast.style.cssText = [
            'position:fixed',
            'top:24px',
            'left:50%',
            'transform:translateX(-50%)',
            'background:#3a2a1a',
            'color:#fff',
            'padding:20px 36px',
            'border-radius:10px',
            'font-size:1.35rem',
            'font-weight:700',
            'z-index:99998',
            'box-shadow:0 4px 20px rgba(0,0,0,0.35)',
            'text-align:center',
            'line-height:1.4',
            'max-width:90vw',
          ].join(';');
          toast.textContent = '📦 Tu persiana' + extra + ' lista — redirigiendo al pago…';
          document.body.appendChild(toast);

          fetch('/cart/clear.js', { method: 'POST' })
            .finally(function () {
              setTimeout(function () {
                window.location.href = data.checkout_url;
              }, 1800);
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

      // Obtener items del carrito antes de proceder
      fetch('/cart.js')
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          var cartItems = (cart.items || []).filter(function (i) { return i.variant_id; });

          if (cartItems.length > 0) {
            // Mostrar aviso: los artículos del carrito se incluirán en el pedido
            var n     = cartItems.length;
            var label = n === 1 ? '1 art\xEDculo' : n + ' art\xEDculos';

            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;';

            var box = document.createElement('div');
            box.style.cssText = 'background:#fff;border-radius:14px;padding:32px 36px;max-width:440px;width:92%;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:inherit;';
            box.innerHTML =
              '<p style="font-size:1.3rem;font-weight:700;margin:0 0 14px;color:#3a2a1a;">Tienes ' + label + ' en el carrito</p>' +
              '<p style="font-size:1.1rem;color:#444;margin:0 0 28px;line-height:1.6;">Tus art\xEDculos se incluir\xE1n junto con la persiana en el mismo pago. Solo tendr\xE1s que completar una \xFAnica compra.</p>' +
              '<div style="display:flex;gap:14px;justify-content:flex-end;">' +
                '<button id="jarapa-cancel" style="padding:12px 20px;border:1px solid #ccc;background:#fff;border-radius:8px;cursor:pointer;font-size:1rem;">Cancelar</button>' +
                '<button id="jarapa-confirm" style="padding:12px 20px;background:#3a2a1a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1rem;font-weight:700;">Ir al pago</button>' +
              '</div>';

            overlay.appendChild(box);
            document.body.appendChild(overlay);

            document.getElementById('jarapa-cancel').addEventListener('click', function () {
              document.body.removeChild(overlay);
            });
            document.getElementById('jarapa-confirm').addEventListener('click', function () {
              document.body.removeChild(overlay);
              sendOrder(ancho, largo, precio, cantidad, cartItems);
            });
          } else {
            sendOrder(ancho, largo, precio, cantidad, []);
          }
        })
        .catch(function () {
          sendOrder(ancho, largo, precio, cantidad, []);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
