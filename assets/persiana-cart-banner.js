(function () {
  'use strict';

  var CHECKOUT_KEY  = 'jarapa_checkout_url';
  var DRAFT_KEY     = 'jarapa_draft_id';
  var WORKER_KEY    = 'jarapa_worker_url';

  function getCheckoutUrl() { return sessionStorage.getItem(CHECKOUT_KEY); }
  function getDraftId()     { return sessionStorage.getItem(DRAFT_KEY); }
  function getWorkerUrl()   { return sessionStorage.getItem(WORKER_KEY); }

  function clear() {
    sessionStorage.removeItem(CHECKOUT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    sessionStorage.removeItem(WORKER_KEY);
  }

  function injectStyles() {
    if (document.getElementById('pc-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'pc-banner-styles';
    style.textContent = [
      '#pc-banner {',
      '  position: fixed;',
      '  bottom: 0; left: 0; right: 0;',
      '  z-index: 99999;',
      '  background: #3a2a1a;',
      '  color: #fff;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  padding: 14px 20px;',
      '  box-shadow: 0 -2px 12px rgba(0,0,0,0.25);',
      '  transform: translateY(100%);',
      '  transition: transform 0.3s ease;',
      '}',
      '#pc-banner.is-visible { transform: translateY(0); }',
      '#pc-banner__text { font-size: 0.9375rem; flex: 1; min-width: 0; }',
      '#pc-banner__text strong { color: #e8977a; }',
      '#pc-banner__cta {',
      '  display: inline-block;',
      '  background: #c8824a;',
      '  color: #fff;',
      '  border: none;',
      '  cursor: pointer;',
      '  padding: 10px 20px;',
      '  font-size: 0.8125rem;',
      '  font-family: inherit;',
      '  letter-spacing: 0.1em;',
      '  text-transform: uppercase;',
      '  white-space: nowrap;',
      '  flex-shrink: 0;',
      '  transition: background 0.15s;',
      '}',
      '#pc-banner__cta:hover:not(:disabled) { background: #b06e38; }',
      '#pc-banner__cta:disabled { background: #8a6040; cursor: not-allowed; }',
      '#pc-banner__close {',
      '  background: none; border: none;',
      '  color: rgba(255,255,255,0.6);',
      '  font-size: 1.25rem; cursor: pointer;',
      '  padding: 0 0 0 8px; line-height: 1; flex-shrink: 0;',
      '}',
      '#pc-banner__close:hover { color: #fff; }',
      '@media (max-width: 600px) {',
      '  #pc-banner { flex-wrap: wrap; }',
      '  #pc-banner__cta { width: 100%; text-align: center; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function showBanner(checkoutUrl) {
    injectStyles();
    var existing = document.getElementById('pc-banner');
    if (existing) {
      existing.classList.add('is-visible');
      return;
    }

    var banner = document.createElement('div');
    banner.id = 'pc-banner';
    banner.innerHTML =
      '<span id="pc-banner__text">' +
        '<strong>Tienes una persiana personalizada pendiente.</strong> ' +
        'Finaliza tu pedido antes de cerrar el navegador.' +
      '</span>' +
      '<button id="pc-banner__cta">Finalizar pedido →</button>' +
      '<button id="pc-banner__close" aria-label="Cerrar">\xD7</button>';

    document.body.appendChild(banner);

    banner.querySelector('#pc-banner__cta').addEventListener('click', function () {
      handleCheckout(checkoutUrl);
    });

    banner.querySelector('#pc-banner__close').addEventListener('click', function () {
      banner.classList.remove('is-visible');
      clear();
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    });
  }

  function setCta(text, disabled) {
    var cta = document.getElementById('pc-banner__cta');
    if (!cta) return;
    cta.textContent = text;
    cta.disabled = !!disabled;
  }

  function handleCheckout(checkoutUrl) {
    var workerUrl = getWorkerUrl();
    var draftId   = getDraftId();

    if (!workerUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    setCta('Preparando…', true);

    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        if (!cart.items || cart.items.length === 0) {
          window.location.href = checkoutUrl;
          return;
        }

        // Add cart items to draft order sequentially
        var items = cart.items.slice();
        var currentDraftId = draftId;
        var currentCheckoutUrl = checkoutUrl;

        function addNext() {
          if (items.length === 0) {
            // All added — clear cart and go to checkout
            return fetch('/cart/clear.js', { method: 'POST' })
              .then(function () { window.location.href = currentCheckoutUrl; });
          }

          var item = items.shift();
          return fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variant_id:     item.variant_id,
              cantidad:       item.quantity,
              draft_order_id: currentDraftId
            })
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data.draft_order_id) currentDraftId   = String(data.draft_order_id);
              if (data.checkout_url)   currentCheckoutUrl = data.checkout_url;
              return addNext();
            });
        }

        return addNext();
      })
      .catch(function () {
        setCta('Finalizar pedido →', false);
        alert('Error al preparar el pedido. Int\xE9ntalo de nuevo.');
      });
  }

  function init() {
    var url = getCheckoutUrl();
    if (url) showBanner(url);
  }

  document.addEventListener('persiana:added', function (e) {
    if (!e.detail) return;
    if (e.detail.checkoutUrl)  sessionStorage.setItem(CHECKOUT_KEY, e.detail.checkoutUrl);
    if (e.detail.draftOrderId) sessionStorage.setItem(DRAFT_KEY,    String(e.detail.draftOrderId));
    if (e.detail.workerUrl)    sessionStorage.setItem(WORKER_KEY,   e.detail.workerUrl);
    showBanner(e.detail.checkoutUrl);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
