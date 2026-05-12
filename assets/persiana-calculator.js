class PersianaCalculator {
  static RATE(m2) {
    if (m2 < 1) return 150;
    if (m2 <= 3) return 105;
    return 95;
  }

  static calcTotal(anchoCm, largoCm, qty) {
    const m2 = (anchoCm * largoCm) / 10000;
    const rate = PersianaCalculator.RATE(m2);
    const unit = Math.ceil(m2 * rate * 100) / 100;
    return { m2, rate, unit, total: Math.ceil(unit * qty * 100) / 100 };
  }

  constructor(section) {
    this.MIN = 30;
    this.MAX = 700;
    this.section = section;

    this.anchoInput  = section.querySelector('[data-calc="ancho"]');
    this.largoInput  = section.querySelector('[data-calc="largo"]');
    this.qtyInput    = section.querySelector('[data-calc="qty"]');
    this.priceBox    = section.querySelector('[data-calc="price-box"]');
    this.priceValue  = section.querySelector('[data-calc="price-value"]');
    this.errorMsg    = section.querySelector('[data-calc="error"]');
    this.submitBtn   = section.querySelector('[data-calc="submit"]');
    this.hiddenPrice = section.querySelector('[data-calc="hidden-price"]');
    this.hiddenM2    = section.querySelector('[data-calc="hidden-m2"]');

    this._bindEvents();
    this._bindGallery();
    this._bindQtyButtons();
  }

  _bindEvents() {
    [this.anchoInput, this.largoInput, this.qtyInput].forEach(el => {
      if (el) el.addEventListener('input', () => this._update());
    });
  }

  _bindGallery() {
    this.section.querySelectorAll('[data-gallery-thumb]').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this.section.querySelectorAll('[data-gallery-thumb]').forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        const main = this.section.querySelector('[data-gallery-main]');
        if (main) {
          main.src    = thumb.dataset.imageSrc;
          main.alt    = thumb.dataset.imageAlt || '';
          main.srcset = '';
        }
      });
    });
  }

  _bindQtyButtons() {
    this.section.querySelectorAll('[data-qty-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = parseInt(this.qtyInput.value, 10) || 1;
        const next = btn.dataset.qtyAction === 'inc'
          ? current + 1
          : Math.max(1, current - 1);
        this.qtyInput.value = next;
        this._update();
      });
    });
  }

  _validate(inputEl) {
    const val = inputEl.value;
    if (!val) { inputEl.classList.remove('is-error'); return null; }
    const n = parseFloat(val);
    if (isNaN(n) || n < this.MIN || n > this.MAX) {
      inputEl.classList.add('is-error');
      return false;
    }
    inputEl.classList.remove('is-error');
    return n;
  }

  _reset() {
    this.priceValue.textContent = 'Introduce tus medidas';
    this.priceBox.dataset.state = 'empty';
    this.submitBtn.disabled = true;
    this.errorMsg.hidden = true;
    this.hiddenPrice.value = '';
    this.hiddenM2.value    = '';
  }

  _update() {
    const ancho = this._validate(this.anchoInput);
    const largo = this._validate(this.largoInput);
    const qty   = Math.max(1, parseInt(this.qtyInput.value, 10) || 1);

    if (ancho === false || largo === false) {
      this.errorMsg.hidden = false;
      this.priceValue.textContent = 'No hacemos ese tamaño';
      this.priceBox.dataset.state = 'error';
      this.submitBtn.disabled = true;
      this.hiddenPrice.value = '';
      this.hiddenM2.value    = '';
      return;
    }

    this.errorMsg.hidden = true;

    if (ancho === null || largo === null) { this._reset(); return; }

    const result    = PersianaCalculator.calcTotal(ancho, largo, qty);
    const formatted = result.total.toFixed(2).replace('.', ',');

    this.priceValue.textContent = `€ ${formatted}`;
    this.priceBox.dataset.state = 'active';
    this.submitBtn.disabled     = false;
    this.hiddenPrice.value      = result.total.toFixed(2);
    this.hiddenM2.value         = result.m2.toFixed(4);
  }
}

document.querySelectorAll('[data-persiana-calculator]').forEach(section => {
  new PersianaCalculator(section);
});
