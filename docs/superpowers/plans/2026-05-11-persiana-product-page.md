# Persiana Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full product page for "Persiana de esparto a medida" following the client wireframe, including a real-time price calculator with tiered pricing.

**Architecture:** A dedicated Shopify template `product.persiana.json` references a series of custom sections. The main section `persiana-calculator.liquid` contains the split gallery+form layout; a JS asset handles all calculator logic and gallery interactivity. Remaining sections (antes-despues, medidas, instalar, fabricamos) are lightweight Liquid sections with configurable content.

**Tech Stack:** Shopify Liquid, vanilla JavaScript (ES6 class), CSS custom properties, Shopify Cart API (`/cart/add`), `line_item_properties` for passing dimensions to checkout.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `assets/persiana-calculator.js` | Create | Price logic, gallery switching, qty controls, form submit |
| `sections/persiana-calculator.liquid` | Create | Split layout: gallery left, calculator form right |
| `sections/antes-despues.liquid` | Create | 4-image "Antes y Después" grid |
| `sections/como-tomar-medidas.liquid` | Create | 3-column video grid for measuring guide |
| `sections/como-instalar.liquid` | Create | Split: installation video + text |
| `sections/como-fabricamos.liquid` | Create | Centered fabrication video |
| `templates/product.persiana.json` | Create | Wires all sections in correct order |

---

## Pricing Logic Reference

```
m² = (ancho_cm × largo_cm) / 10000
rate = m² < 1 ? 150 : m² <= 3 ? 105 : 95   (€/m²)
unit_price = ceil(m² × rate × 100) / 100
total = ceil(unit_price × qty × 100) / 100
```

Constraints: min 30 cm, max 700 cm (both dimensions). Outside range → "No hacemos ese tamaño".

---

## Task 1: Calculator JS asset

**Files:**
- Create: `assets/persiana-calculator.js`

- [ ] **Step 1.1 — Create the file with the PersianaCalculator class**

```js
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
    this.id = section.dataset.sectionId;

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
      el.addEventListener('input', () => this._update());
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
        const next = btn.dataset.qtyAction === 'inc' ? current + 1 : Math.max(1, current - 1);
        this.qtyInput.value = next;
        this._update();
      });
    });
  }

  _validate(val, name) {
    const n = parseFloat(val);
    const el = name === 'ancho' ? this.anchoInput : this.largoInput;
    if (!val) { el.classList.remove('is-error'); return null; }
    if (isNaN(n) || n < this.MIN || n > this.MAX) {
      el.classList.add('is-error');
      return false;
    }
    el.classList.remove('is-error');
    return n;
  }

  _reset() {
    this.priceValue.textContent = 'Introduce tus medidas';
    this.priceBox.dataset.state = 'empty';
    this.submitBtn.disabled = true;
    this.errorMsg.hidden = true;
    this.hiddenPrice.value = '';
    this.hiddenM2.value   = '';
  }

  _update() {
    const ancho = this._validate(this.anchoInput.value, 'ancho');
    const largo = this._validate(this.largoInput.value, 'largo');
    const qty   = Math.max(1, parseInt(this.qtyInput.value, 10) || 1);

    // At least one field has an out-of-range value
    if (ancho === false || largo === false) {
      this.errorMsg.hidden = false;
      this.priceValue.textContent = 'No hacemos ese tamaño';
      this.priceBox.dataset.state = 'error';
      this.submitBtn.disabled = true;
      this.hiddenPrice.value = '';
      return;
    }

    this.errorMsg.hidden = true;

    // Waiting for both fields
    if (ancho === null || largo === null) { this._reset(); return; }

    const result = PersianaCalculator.calcTotal(ancho, largo, qty);
    const formatted = result.total.toFixed(2).replace('.', ',');
    this.priceValue.textContent = `€ ${formatted}`;
    this.priceBox.dataset.state = 'active';
    this.submitBtn.disabled = false;
    this.hiddenPrice.value = result.total.toFixed(2);
    this.hiddenM2.value    = result.m2.toFixed(4);
  }
}

document.querySelectorAll('[data-persiana-calculator]').forEach(section => {
  new PersianaCalculator(section);
});
```

- [ ] **Step 1.2 — Commit**

```bash
git add assets/persiana-calculator.js
git commit -m "feat(persiana): add price calculator JS with tiered pricing logic"
```

---

## Task 2: Main section — persiana-calculator.liquid

**Files:**
- Create: `sections/persiana-calculator.liquid`

- [ ] **Step 2.1 — Create the section file**

```liquid
{%- liquid
  assign current_variant = product.selected_or_first_available_variant
-%}

<section
  class="persiana-calc color-{{ section.settings.color_scheme }}"
  data-persiana-calculator
  data-section-id="{{ section.id }}"
  id="persiana-calc-{{ section.id }}"
>
  <div class="persiana-calc__inner">

    {%- comment -%} ── LEFT: Gallery ── {%- endcomment -%}
    <div class="persiana-calc__gallery">
      <div class="persiana-calc__main-wrap">
        {%- if product.featured_image -%}
          <img
            data-gallery-main
            src="{{ product.featured_image | image_url: width: 900 }}"
            alt="{{ product.featured_image.alt | escape }}"
            width="900"
            height="{{ 900 | divided_by: product.featured_image.aspect_ratio | round }}"
            loading="eager"
            class="persiana-calc__main-img"
          >
        {%- endif -%}
      </div>

      {%- if product.images.size > 1 -%}
        <div class="persiana-calc__thumbs">
          {%- for image in product.images limit: 4 -%}
            <button
              type="button"
              class="persiana-calc__thumb{% if forloop.first %} is-active{% endif %}"
              data-gallery-thumb
              data-image-src="{{ image | image_url: width: 900 }}"
              data-image-alt="{{ image.alt | escape }}"
              aria-label="{{ image.alt | default: product.title | escape }}"
            >
              <img
                src="{{ image | image_url: width: 120 }}"
                alt="{{ image.alt | escape }}"
                width="120"
                height="120"
                loading="lazy"
              >
            </button>
          {%- endfor -%}
        </div>
      {%- endif -%}
    </div>

    {%- comment -%} ── RIGHT: Details + Calculator ── {%- endcomment -%}
    <div class="persiana-calc__details">

      <h1 class="persiana-calc__title">{{ product.title }}</h1>

      {%- if section.settings.sistema_url != blank -%}
        <a href="{{ section.settings.sistema_url }}" class="persiana-calc__sistema-link">
          + Incluimos Sistema para Colocarlas
        </a>
      {%- endif -%}

      <form
        class="persiana-calc__form"
        action="/cart/add"
        method="post"
        enctype="multipart/form-data"
      >
        <input type="hidden" name="id" value="{{ current_variant.id }}">
        <input type="hidden" name="properties[_precio_calculado]" data-calc="hidden-price" value="">
        <input type="hidden" name="properties[_m2]"              data-calc="hidden-m2"    value="">

        {%- comment -%} Dimension fields {%- endcomment -%}
        <div class="persiana-calc__field">
          <label class="persiana-calc__label" for="Ancho-{{ section.id }}">
            Ancho de la persiana en centímetros
            <span class="persiana-calc__info-icon" title="Mide el hueco donde colocarás la persiana, de izquierda a derecha.">&#9432;</span>
          </label>
          <input
            type="number"
            id="Ancho-{{ section.id }}"
            name="properties[Ancho (cm)]"
            class="persiana-calc__input"
            data-calc="ancho"
            min="30" max="700" step="1"
            placeholder="100"
            autocomplete="off"
          >
        </div>

        <div class="persiana-calc__field">
          <label class="persiana-calc__label" for="Largo-{{ section.id }}">
            Largo de la persiana en centímetros
            <span class="persiana-calc__info-icon" title="Mide el hueco donde colocarás la persiana, de arriba a abajo.">&#9432;</span>
          </label>
          <input
            type="number"
            id="Largo-{{ section.id }}"
            name="properties[Largo (cm)]"
            class="persiana-calc__input"
            data-calc="largo"
            min="30" max="700" step="1"
            placeholder="100"
            autocomplete="off"
          >
        </div>

        <a href="{{ section.settings.envio_url | default: '#' }}" class="persiana-calc__envio-link">
          Envío Gratis en toda la Península
        </a>

        {%- comment -%} Quantity {%- endcomment -%}
        <div class="persiana-calc__qty-wrap">
          <span class="persiana-calc__qty-label">Cantidad</span>
          <div class="persiana-calc__qty-row">
            <button type="button" class="persiana-calc__qty-btn" data-qty-action="dec" aria-label="Reducir">−</button>
            <input
              type="number"
              name="quantity"
              data-calc="qty"
              class="persiana-calc__qty-input"
              value="1"
              min="1"
              aria-label="Cantidad"
            >
            <button type="button" class="persiana-calc__qty-btn" data-qty-action="inc" aria-label="Aumentar">+</button>
          </div>
        </div>

        {%- comment -%} Price box {%- endcomment -%}
        <div class="persiana-calc__price-box" data-calc="price-box" data-state="empty">
          <span class="persiana-calc__price-label">Precio total</span>
          <span class="persiana-calc__price-value" data-calc="price-value">Introduce tus medidas</span>
        </div>

        <p class="persiana-calc__error" data-calc="error" hidden>
          No hacemos ese tamaño (mín. 30 cm · máx. 700 cm)
        </p>

        <button
          type="submit"
          class="persiana-calc__submit"
          data-calc="submit"
          disabled
        >
          Agregar al carrito
        </button>
      </form>

      {%- comment -%} Accordions {%- endcomment -%}
      {%- if section.settings.caracteristicas != blank -%}
        <details class="persiana-calc__accordion">
          <summary class="persiana-calc__accordion-hd">
            Características del producto
            <span class="persiana-calc__accordion-chevron" aria-hidden="true"></span>
          </summary>
          <div class="persiana-calc__accordion-body">
            {{ section.settings.caracteristicas }}
          </div>
        </details>
      {%- endif -%}

      {%- if section.settings.faq != blank -%}
        <details class="persiana-calc__accordion">
          <summary class="persiana-calc__accordion-hd">
            Preguntas frecuentes
            <span class="persiana-calc__accordion-chevron" aria-hidden="true"></span>
          </summary>
          <div class="persiana-calc__accordion-body">
            {{ section.settings.faq }}
          </div>
        </details>
      {%- endif -%}

    </div>
  </div>
</section>

<style>
  .persiana-calc { background: var(--color-background); }

  .persiana-calc__inner {
    display: grid;
    grid-template-columns: 55% 45%;
    min-height: 560px;
  }

  /* ── Gallery ── */
  .persiana-calc__gallery {
    position: relative;
    background: #f0e8de;
  }
  .persiana-calc__main-wrap {
    width: 100%;
    height: calc(100% - 72px);
    min-height: 420px;
  }
  .persiana-calc__main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .persiana-calc__thumbs {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    background: #fff;
    border-top: 1px solid #ece5db;
  }
  .persiana-calc__thumb {
    width: 56px;
    height: 56px;
    border: 2px solid transparent;
    overflow: hidden;
    cursor: pointer;
    background: none;
    padding: 0;
    flex-shrink: 0;
  }
  .persiana-calc__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .persiana-calc__thumb.is-active { border-color: #3a2a1a; }

  /* ── Details ── */
  .persiana-calc__details {
    padding: 36px 36px 40px;
    display: flex;
    flex-direction: column;
    gap: 0;
    background: #fff;
    overflow-y: auto;
  }
  .persiana-calc__title {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.2;
    color: #1a1a1a;
    margin-bottom: 10px;
  }
  .persiana-calc__sistema-link {
    display: inline-block;
    font-size: 0.875rem;
    color: #c8824a;
    text-decoration: underline;
    margin-bottom: 20px;
  }

  /* ── Fields ── */
  .persiana-calc__field { margin-bottom: 14px; }
  .persiana-calc__label {
    display: block;
    font-size: 0.8125rem;
    font-family: var(--font-body--family);
    color: #3a2a1a;
    margin-bottom: 6px;
  }
  .persiana-calc__info-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid #aaa;
    border-radius: 50%;
    font-size: 10px;
    text-align: center;
    line-height: 14px;
    cursor: help;
    color: #888;
    margin-left: 4px;
    vertical-align: middle;
  }
  .persiana-calc__input {
    display: block;
    width: 100%;
    height: 44px;
    border: 1px solid #ddd0c0;
    background: #fff;
    padding: 0 14px;
    font-size: 1rem;
    font-family: var(--font-body--family);
    color: #1a1a1a;
    outline: none;
    -moz-appearance: textfield;
  }
  .persiana-calc__input::-webkit-inner-spin-button,
  .persiana-calc__input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .persiana-calc__input:focus { border-color: #8b6f47; }
  .persiana-calc__input.is-error { border-color: #c0392b; }

  .persiana-calc__envio-link {
    display: block;
    font-size: 0.875rem;
    color: #c8824a;
    text-decoration: underline;
    margin-bottom: 18px;
    margin-top: 4px;
  }

  /* ── Quantity ── */
  .persiana-calc__qty-wrap { margin-bottom: 16px; }
  .persiana-calc__qty-label {
    display: block;
    font-size: 0.9375rem;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  .persiana-calc__qty-row {
    display: flex;
    border: 1px solid #ddd0c0;
    width: fit-content;
    min-width: 140px;
  }
  .persiana-calc__qty-btn {
    width: 40px;
    height: 44px;
    background: #fff;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #3a2a1a;
    flex-shrink: 0;
  }
  .persiana-calc__qty-btn:hover { background: #f5ede3; }
  .persiana-calc__qty-input {
    flex: 1;
    height: 44px;
    border: none;
    border-left: 1px solid #ddd0c0;
    border-right: 1px solid #ddd0c0;
    text-align: center;
    font-size: 1rem;
    font-family: var(--font-body--family);
    color: #1a1a1a;
    -moz-appearance: textfield;
  }
  .persiana-calc__qty-input::-webkit-inner-spin-button,
  .persiana-calc__qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }

  /* ── Price box ── */
  .persiana-calc__price-box {
    padding: 12px 16px;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: background 0.2s;
  }
  .persiana-calc__price-box[data-state="empty"]  { background: #ece5db; }
  .persiana-calc__price-box[data-state="active"]  { background: #e8977a; }
  .persiana-calc__price-box[data-state="error"]   { background: #f8e0dd; }
  .persiana-calc__price-label {
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: var(--font-accent--family);
    color: #fff;
  }
  .persiana-calc__price-box[data-state="empty"]  .persiana-calc__price-label { color: #7a5c3e; }
  .persiana-calc__price-box[data-state="error"]  .persiana-calc__price-label { color: #c0392b; }
  .persiana-calc__price-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    font-family: var(--font-body--family);
  }
  .persiana-calc__price-box[data-state="empty"]  .persiana-calc__price-value { color: #aaa; font-size: 0.875rem; font-weight: 400; }
  .persiana-calc__price-box[data-state="error"]  .persiana-calc__price-value { color: #c0392b; font-size: 0.875rem; font-weight: 400; }

  .persiana-calc__error {
    font-size: 0.8125rem;
    color: #c0392b;
    margin-bottom: 10px;
    margin-top: -8px;
  }

  /* ── Submit ── */
  .persiana-calc__submit {
    display: block;
    width: 100%;
    padding: 16px;
    background: #3a2a1a;
    color: #fff;
    border: none;
    font-size: 0.875rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: var(--font-accent--family);
    cursor: pointer;
    margin-bottom: 20px;
    transition: background 0.2s;
  }
  .persiana-calc__submit:hover:not(:disabled) { background: #5a3e28; }
  .persiana-calc__submit:disabled { background: #ccc; cursor: not-allowed; }

  /* ── Accordions ── */
  .persiana-calc__accordion {
    border-top: 1px solid #ece5db;
  }
  .persiana-calc__accordion:last-child { border-bottom: 1px solid #ece5db; }
  .persiana-calc__accordion-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    cursor: pointer;
    list-style: none;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: var(--font-accent--family);
    color: #3a2a1a;
  }
  .persiana-calc__accordion-hd::-webkit-details-marker { display: none; }
  .persiana-calc__accordion-chevron {
    width: 10px;
    height: 10px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  details[open] .persiana-calc__accordion-chevron { transform: rotate(-135deg); }
  .persiana-calc__accordion-body {
    padding-bottom: 16px;
    font-size: 0.875rem;
    color: #7a5c3e;
    line-height: 1.75;
  }

  @media (max-width: 768px) {
    .persiana-calc__inner {
      grid-template-columns: 1fr;
    }
    .persiana-calc__title { font-size: 1.5rem; }
  }
</style>

<script src="{{ 'persiana-calculator.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": "Calculador Persiana",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "url",
      "id": "sistema_url",
      "label": "Enlace '+ Incluimos Sistema para Colocarlas'"
    },
    {
      "type": "url",
      "id": "envio_url",
      "label": "Enlace 'Envío Gratis en toda la Península'"
    },
    {
      "type": "richtext",
      "id": "caracteristicas",
      "label": "Características del producto",
      "info": "Contenido del acordeón de características"
    },
    {
      "type": "richtext",
      "id": "faq",
      "label": "Preguntas frecuentes",
      "info": "Contenido del acordeón de FAQ"
    }
  ],
  "presets": [
    {
      "name": "Calculador Persiana"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2.2 — Commit**

```bash
git add sections/persiana-calculator.liquid
git commit -m "feat(persiana): add persiana-calculator section with split layout and form"
```

---

## Task 3: Antes y Después section

**Files:**
- Create: `sections/antes-despues.liquid`

- [ ] **Step 3.1 — Create the section file**

```liquid
<section class="antes-despues color-{{ section.settings.color_scheme }}">
  <div class="antes-despues__inner page-width">
    <h2 class="antes-despues__heading">{{ section.settings.heading | default: 'Antes y Después (de clientes)' }}</h2>
    <div class="antes-despues__grid">
      {%- for i in (1..4) -%}
        {%- assign img_key = 'image_' | append: i -%}
        {%- assign img = section.settings[img_key] -%}
        <div class="antes-despues__item">
          {%- if img != blank -%}
            <img
              src="{{ img | image_url: width: 600 }}"
              alt="{{ img.alt | escape }}"
              width="600"
              height="{{ 600 | divided_by: img.aspect_ratio | round }}"
              loading="lazy"
            >
          {%- else -%}
            {{ 'product-1' | placeholder_svg_tag: 'antes-despues__placeholder' }}
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

<style>
  .antes-despues { padding: 56px 0; background: var(--color-background); }
  .antes-despues__heading {
    text-align: center;
    font-size: 1.625rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--color-foreground);
  }
  .antes-despues__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .antes-despues__item { overflow: hidden; }
  .antes-despues__item img,
  .antes-despues__placeholder {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
  }
  @media (max-width: 600px) {
    .antes-despues__grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>

{% schema %}
{
  "name": "Antes y Después",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Título",
      "default": "Antes y Después (de clientes)"
    },
    { "type": "image_picker", "id": "image_1", "label": "Imagen 1" },
    { "type": "image_picker", "id": "image_2", "label": "Imagen 2" },
    { "type": "image_picker", "id": "image_3", "label": "Imagen 3" },
    { "type": "image_picker", "id": "image_4", "label": "Imagen 4" }
  ],
  "presets": [{ "name": "Antes y Después" }]
}
{% endschema %}
```

- [ ] **Step 3.2 — Commit**

```bash
git add sections/antes-despues.liquid
git commit -m "feat(persiana): add antes-despues section with 4-image grid"
```

---

## Task 4: Cómo tomar las medidas section

**Files:**
- Create: `sections/como-tomar-medidas.liquid`

- [ ] **Step 4.1 — Create the section file**

```liquid
{%- liquid
  assign videos = 'video_porche,video_ventana_interna,video_ventana_exterior' | split: ','
  assign labels = section.settings.label_porche | append: '|||' | append: section.settings.label_interna | append: '|||' | append: section.settings.label_exterior | split: '|||'
  assign video_urls = section.settings.video_porche | append: '|||' | append: section.settings.video_interna | append: '|||' | append: section.settings.video_exterior | split: '|||'
-%}

<section class="como-medidas color-{{ section.settings.color_scheme }}">
  <div class="como-medidas__inner page-width">
    <h2 class="como-medidas__heading">{{ section.settings.heading | default: 'Cómo tomar las medidas' }}</h2>
    <div class="como-medidas__grid">
      {%- for i in (0..2) -%}
        {%- assign label     = labels[i] -%}
        {%- assign video_url = video_urls[i] -%}
        <div class="como-medidas__col">
          <p class="como-medidas__label">{{ label }}</p>
          {%- if video_url != blank -%}
            {%- assign video_id = video_url | split: 'v=' | last | split: '&' | first -%}
            {%- if video_url contains 'youtu' -%}
              <div class="como-medidas__video-wrap">
                <iframe
                  src="https://www.youtube.com/embed/{{ video_id }}"
                  title="{{ label }}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            {%- else -%}
              <div class="como-medidas__video-wrap">
                <iframe
                  src="{{ video_url }}"
                  title="{{ label }}"
                  frameborder="0"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
            {%- endif -%}
          {%- else -%}
            <div class="como-medidas__video-placeholder">Vídeo próximamente</div>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

<style>
  .como-medidas { padding: 56px 0; background: var(--color-background); }
  .como-medidas__heading {
    text-align: center;
    font-size: 1.625rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--color-foreground);
  }
  .como-medidas__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .como-medidas__col { display: flex; flex-direction: column; gap: 12px; }
  .como-medidas__label {
    text-align: center;
    font-size: 0.9375rem;
    color: var(--color-foreground);
  }
  .como-medidas__video-wrap {
    position: relative;
    padding-bottom: 75%;
    height: 0;
    overflow: hidden;
    background: #c4d8d0;
  }
  .como-medidas__video-wrap iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .como-medidas__video-placeholder {
    aspect-ratio: 4/3;
    background: #c4d8d0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.875rem;
  }
  @media (max-width: 640px) {
    .como-medidas__grid { grid-template-columns: 1fr; }
  }
</style>

{% schema %}
{
  "name": "Cómo tomar medidas",
  "tag": "section",
  "class": "section",
  "settings": [
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "text", "id": "heading", "label": "Título", "default": "Cómo tomar las medidas" },
    { "type": "text",  "id": "label_porche",   "label": "Etiqueta vídeo 1", "default": "Porche" },
    { "type": "url",   "id": "video_porche",   "label": "URL vídeo 1 (YouTube)" },
    { "type": "text",  "id": "label_interna",  "label": "Etiqueta vídeo 2", "default": "Ventana (parte interna)" },
    { "type": "url",   "id": "video_interna",  "label": "URL vídeo 2 (YouTube)" },
    { "type": "text",  "id": "label_exterior", "label": "Etiqueta vídeo 3", "default": "Ventana (exterior)" },
    { "type": "url",   "id": "video_exterior", "label": "URL vídeo 3 (YouTube)" }
  ],
  "presets": [{ "name": "Cómo tomar medidas" }]
}
{% endschema %}
```

- [ ] **Step 4.2 — Commit**

```bash
git add sections/como-tomar-medidas.liquid
git commit -m "feat(persiana): add como-tomar-medidas section with 3-column video grid"
```

---

## Task 5: Cómo instalar section

**Files:**
- Create: `sections/como-instalar.liquid`

- [ ] **Step 5.1 — Create the section file**

```liquid
<section class="como-instalar color-{{ section.settings.color_scheme }}">
  <div class="como-instalar__inner page-width">
    <h2 class="como-instalar__heading">{{ section.settings.heading | default: 'Cómo instalar las persianas de esparto' }}</h2>
    <div class="como-instalar__split">
      <div class="como-instalar__video-col">
        {%- if section.settings.video_url != blank -%}
          {%- assign video_id = section.settings.video_url | split: 'v=' | last | split: '&' | first -%}
          <div class="como-instalar__video-wrap">
            <iframe
              src="https://www.youtube.com/embed/{{ video_id }}"
              title="{{ section.settings.heading }}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        {%- else -%}
          <div class="como-instalar__video-placeholder">Vídeo próximamente</div>
        {%- endif -%}
      </div>
      <div class="como-instalar__text-col">
        {%- if section.settings.instrucciones != blank -%}
          <div class="como-instalar__rte">{{ section.settings.instrucciones }}</div>
        {%- else -%}
          <p class="como-instalar__rte">Añade las instrucciones de instalación desde el personalizador.</p>
        {%- endif -%}
      </div>
    </div>
  </div>
</section>

<style>
  .como-instalar { padding: 56px 0; background: var(--color-background); }
  .como-instalar__heading {
    text-align: center;
    font-size: 1.625rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--color-foreground);
  }
  .como-instalar__split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: center;
  }
  .como-instalar__video-wrap {
    position: relative;
    padding-bottom: 100%;
    height: 0;
    overflow: hidden;
    background: #c4d8d0;
  }
  .como-instalar__video-wrap iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .como-instalar__video-placeholder {
    aspect-ratio: 1;
    background: #c4d8d0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.875rem;
  }
  .como-instalar__rte { font-size: 0.9375rem; color: var(--color-foreground); line-height: 1.75; }
  .como-instalar__rte h3 { font-size: 1.125rem; margin-bottom: 12px; }
  .como-instalar__rte ol, .como-instalar__rte ul { padding-left: 20px; }
  .como-instalar__rte li { margin-bottom: 8px; }
  @media (max-width: 640px) {
    .como-instalar__split { grid-template-columns: 1fr; }
  }
</style>

{% schema %}
{
  "name": "Cómo instalar",
  "tag": "section",
  "class": "section",
  "settings": [
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "text",     "id": "heading",       "label": "Título", "default": "Cómo instalar las persianas de esparto" },
    { "type": "url",      "id": "video_url",     "label": "URL del vídeo (YouTube)" },
    { "type": "richtext", "id": "instrucciones", "label": "Instrucciones de instalación (texto)" }
  ],
  "presets": [{ "name": "Cómo instalar" }]
}
{% endschema %}
```

- [ ] **Step 5.2 — Commit**

```bash
git add sections/como-instalar.liquid
git commit -m "feat(persiana): add como-instalar section with split video+text layout"
```

---

## Task 6: Cómo fabricamos section

**Files:**
- Create: `sections/como-fabricamos.liquid`

- [ ] **Step 6.1 — Create the section file**

```liquid
<section class="como-fabricamos color-{{ section.settings.color_scheme }}">
  <div class="como-fabricamos__inner page-width">
    <h2 class="como-fabricamos__heading">{{ section.settings.heading | default: 'Cómo fabricamos las persianas de esparto' }}</h2>
    <div class="como-fabricamos__video-wrap">
      {%- if section.settings.video_url != blank -%}
        {%- assign video_id = section.settings.video_url | split: 'v=' | last | split: '&' | first -%}
        <iframe
          src="https://www.youtube.com/embed/{{ video_id }}"
          title="{{ section.settings.heading }}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      {%- else -%}
        <div class="como-fabricamos__placeholder">Vídeo próximamente</div>
      {%- endif -%}
    </div>
  </div>
</section>

<style>
  .como-fabricamos { padding: 56px 0; background: var(--color-background); }
  .como-fabricamos__heading {
    text-align: center;
    font-size: 1.625rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--color-foreground);
  }
  .como-fabricamos__inner { max-width: 720px; margin: 0 auto; padding: 0 24px; }
  .como-fabricamos__video-wrap {
    position: relative;
    padding-bottom: 75%;
    height: 0;
    overflow: hidden;
    background: #c4d8d0;
  }
  .como-fabricamos__video-wrap iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .como-fabricamos__placeholder {
    aspect-ratio: 4/3;
    background: #c4d8d0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.875rem;
  }
</style>

{% schema %}
{
  "name": "Cómo fabricamos",
  "tag": "section",
  "class": "section",
  "settings": [
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "text", "id": "heading", "label": "Título", "default": "Cómo fabricamos las persianas de esparto" },
    { "type": "url",  "id": "video_url", "label": "URL del vídeo (YouTube)" }
  ],
  "presets": [{ "name": "Cómo fabricamos" }]
}
{% endschema %}
```

- [ ] **Step 6.2 — Commit**

```bash
git add sections/como-fabricamos.liquid
git commit -m "feat(persiana): add como-fabricamos section with centered video"
```

---

## Task 7: product.persiana.json template

**Files:**
- Create: `templates/product.persiana.json`

This template is assigned to the persiana product in Shopify admin: **Products → Persiana → Template → persiana**.

- [ ] **Step 7.1 — Create the template**

```json
{
  "sections": {
    "persiana_main": {
      "type": "persiana-calculator",
      "settings": {
        "color_scheme": "scheme-1",
        "sistema_url": "",
        "envio_url": "/pages/envios-y-pagos",
        "caracteristicas": "<p>Persiana de esparto tejida artesanalmente en Pampaneira (Granada). Fabricada con fibra natural de esparto. Sistema de colocación incluido. Medidas mínimas: 30 × 30 cm. Medidas máximas: 700 × 700 cm.</p>",
        "faq": "<p><strong>¿Cuánto tarda en llegar?</strong><br>24-72 horas laborables tras confirmar el pedido.</p><p><strong>¿Cómo la instalo?</strong><br>Con los ganchos incluidos, en menos de 10 minutos.</p><p><strong>¿Qué pasa si no me gusta?</strong><br>30 días de devolución gratuita.</p>"
      }
    },
    "antes_despues": {
      "type": "antes-despues",
      "settings": {
        "color_scheme": "scheme-1",
        "heading": "Antes y Después (de clientes)"
      }
    },
    "como_medidas": {
      "type": "como-tomar-medidas",
      "settings": {
        "color_scheme": "scheme-1",
        "heading": "Cómo tomar las medidas",
        "label_porche": "Porche",
        "label_interna": "Ventana (parte interna)",
        "label_exterior": "Ventana (exterior)",
        "video_porche": "",
        "video_interna": "",
        "video_exterior": ""
      }
    },
    "como_instalar": {
      "type": "como-instalar",
      "settings": {
        "color_scheme": "scheme-1",
        "heading": "Cómo instalar las persianas de esparto",
        "video_url": "",
        "instrucciones": "<ol><li>Mide el hueco donde quieres colocar la persiana.</li><li>Coloca los ganchos incluidos en la parte superior del marco.</li><li>Cuelga la persiana de los ganchos. Listo.</li></ol>"
      }
    },
    "como_fabricamos": {
      "type": "como-fabricamos",
      "settings": {
        "color_scheme": "scheme-1",
        "heading": "Cómo fabricamos las persianas de esparto",
        "video_url": ""
      }
    },
    "seo_text": {
      "type": "main-page",
      "settings": {
        "color_scheme": "scheme-2",
        "section_width": "page-width",
        "padding_top": 56,
        "padding_bottom": 56
      }
    },
    "brand_pillars": {
      "type": "brand-pillars",
      "settings": {
        "heading": "Comprometidos con el medio ambiente",
        "color_scheme": "scheme-1",
        "section_width": "page-width",
        "padding_top": 56,
        "padding_bottom": 56
      },
      "blocks": {
        "pillar_1": {
          "type": "pillar",
          "settings": {
            "title": "Materiales reciclados",
            "body": "Se utilizan materiales reciclados para reducir el desperdicio y promover la reutilización."
          }
        },
        "pillar_2": {
          "type": "pillar",
          "settings": {
            "title": "Producción artesanal",
            "body": "Todos los productos están hechos a mano, garantizando la calidad de las piezas."
          }
        },
        "pillar_3": {
          "type": "pillar",
          "settings": {
            "title": "Sostenibilidad y Respeto",
            "body": "El uso de materiales naturales, como el esparto, evita el uso de plásticos y materiales sintéticos."
          }
        }
      },
      "block_order": ["pillar_1", "pillar_2", "pillar_3"]
    },
    "product_recommendations": {
      "type": "product-recommendations",
      "settings": {
        "heading": "Otros productos",
        "color_scheme": "scheme-1",
        "section_width": "page-width",
        "padding_top": 56,
        "padding_bottom": 56
      }
    }
  },
  "order": [
    "persiana_main",
    "antes_despues",
    "como_medidas",
    "como_instalar",
    "como_fabricamos",
    "seo_text",
    "brand_pillars",
    "product_recommendations"
  ]
}
```

> **Note:** The `seo_text` section uses `main-page` type which renders the product description from Shopify. The reviews widget (Judge.me or similar) renders automatically from the product page app — no manual section needed.

- [ ] **Step 7.2 — Commit**

```bash
git add templates/product.persiana.json
git commit -m "feat(persiana): add product.persiana.json template wiring all sections"
```

- [ ] **Step 7.3 — Assign template in Shopify admin**

In Shopify admin:
1. Go to **Products** → open "Persiana de esparto a medida"
2. In the right sidebar, under **Theme template**, select `persiana`
3. Save

---

## Self-Review Checklist

- [x] **Calculator logic** — tiered pricing (150/105/95), min 30, max 700, "No hacemos ese tamaño" → Task 1
- [x] **Gallery with thumbnails** — clicking thumb swaps main image → Task 1 + 2
- [x] **+ Incluimos Sistema link** — configurable URL in schema → Task 2
- [x] **Ancho/Largo fields with ℹ tooltip** → Task 2
- [x] **Envío Gratis link** → Task 2
- [x] **Quantity selector with +/− buttons** → Task 1 + 2
- [x] **Salmon price box with real-time update** → Task 1 + 2
- [x] **Agregar al carrito disabled until valid** → Task 1 + 2
- [x] **Accordion: Características** → Task 2
- [x] **Accordion: Preguntas frecuentes** → Task 2
- [x] **Antes y Después grid (4 imágenes)** → Task 3
- [x] **Cómo tomar medidas (3 vídeos)** → Task 4
- [x] **Cómo instalar (vídeo + texto)** → Task 5
- [x] **Cómo fabricamos (vídeo centrado)** → Task 6
- [x] **Texto SEO** → Task 7 (`main-page` section = product description)
- [x] **Reseñas** → rendered by app (Judge.me), no section needed
- [x] **Otros productos** → Task 7 (`product-recommendations`)
- [x] **Comprometidos con el medio ambiente** → Task 7 (`brand-pillars`)
- [x] **Template assigned to product** → Task 7 step 7.3
