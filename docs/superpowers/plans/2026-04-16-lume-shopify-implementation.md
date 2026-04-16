# Lume Shopify Store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Savor demo theme into the Lume brand — a premium warm-minimal desk lamp store with a 7-block product page, custom sections, and Lume's full visual system applied throughout.

**Architecture:** Update the global visual system (colors + typography) in `settings_data.json`, create three new Liquid sections (`product-specs`, `brand-pillars`, `product-cta-close`), restructure `templates/product.json` to include all 7 brand blocks, and update `templates/index.json` with Lume homepage content. No app dependencies except Judge.me (noted where needed but not blocking).

**Tech Stack:** Shopify Liquid · JSON templates · Savor theme v3.5.1 · Shopify CLI (`shopify theme dev`) for local preview

> **Note on testing:** Shopify Liquid sections have no unit test framework. Each task's verification step uses `shopify theme dev` to preview locally. If Shopify CLI is not installed: `npm install -g @shopify/cli` then `shopify auth login`.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `config/settings_data.json` | Modify | Lume color schemes + typography (fonts, case) |
| `sections/product-specs.liquid` | Create | 3-metric specs block for product page |
| `sections/brand-pillars.liquid` | Create | 3 value pillars block for product page |
| `sections/product-cta-close.liquid` | Create | Dark closing CTA section for product page |
| `templates/product.json` | Modify | 7-block product page structure |
| `templates/index.json` | Modify | Lume homepage with hero + brand story |

---

## Task 1: Apply Lume visual system to theme settings

**Files:**
- Modify: `config/settings_data.json`

> This file is minified JSON on a single line. The Edit tool must match exact substrings. Make changes one field group at a time.

- [ ] **Step 1: Update typography — heading font and case**

In `config/settings_data.json`, replace:
```
"type_body_font":"inter_n4","type_subheading_font":"barlow_condensed_n6","type_heading_font":"barlow_condensed_n6","type_accent_font":"barlow_condensed_n6","type_size_paragraph":"14","type_line_height_paragraph":"body-normal","type_case_h1":"uppercase","type_size_h2":"48","type_line_height_h2":"display-tight","type_case_h2":"uppercase","type_case_h3":"uppercase","type_case_h4":"uppercase","type_case_h5":"uppercase","type_case_h6":"uppercase"
```
with:
```
"type_body_font":"inter_n4","type_subheading_font":"inter_n4","type_heading_font":"cormorant_garamond_n4","type_accent_font":"space_mono_n4","type_size_paragraph":"14","type_line_height_paragraph":"body-normal","type_case_h1":"none","type_size_h2":"48","type_line_height_h2":"display-tight","type_case_h2":"none","type_case_h3":"none","type_case_h4":"none","type_case_h5":"none","type_case_h6":"none"
```

- [ ] **Step 2: Update color scheme-1 (main — light crema)**

In `config/settings_data.json`, inside `"current"`, find the scheme-1 settings block (starts with `"scheme-1":{"settings":{"background":"#ffffff"`) and replace the entire settings object value (from `{"background":"#ffffff"` to the matching `}`) with:

```json
{"background":"#faf7f2","foreground_heading":"#2c2420","foreground":"#2c2420","primary":"#a89070","primary_hover":"#2c2420","border":"#e8e3dc","shadow":"#2c2420","primary_button_background":"#2c2420","primary_button_text":"#faf7f2","primary_button_border":"#2c2420","primary_button_hover_background":"#4a3a35","primary_button_hover_text":"#faf7f2","primary_button_hover_border":"#4a3a35","secondary_button_background":"transparent","secondary_button_text":"#2c2420","secondary_button_border":"#2c2420","secondary_button_hover_background":"#e8e3dc","secondary_button_hover_text":"#2c2420","secondary_button_hover_border":"#2c2420","input_background":"#faf7f2","input_text_color":"#2c2420","input_border_color":"#e8e3dc","input_hover_background":"#f0ece4","variant_background_color":"#faf7f2","variant_text_color":"#2c2420","variant_border_color":"#e8e3dc","variant_hover_background_color":"#f0ece4","variant_hover_text_color":"#2c2420","variant_hover_border_color":"#a89070","selected_variant_background_color":"#2c2420","selected_variant_text_color":"#faf7f2","selected_variant_border_color":"#2c2420","selected_variant_hover_background_color":"#4a3a35","selected_variant_hover_text_color":"#faf7f2","selected_variant_hover_border_color":"#4a3a35"}
```

- [ ] **Step 3: Update color scheme-2 (secondary — beige)**

In `config/settings_data.json`, inside `"current"`, find scheme-2's settings block (starts with `"scheme-2":{"settings":{"background":"#f1f1f1"`) and replace the entire settings object value with:

```json
{"background":"#f0ece4","foreground_heading":"#2c2420","foreground":"#2c2420","primary":"#a89070","primary_hover":"#2c2420","border":"#e8e3dc","shadow":"#2c2420","primary_button_background":"#2c2420","primary_button_text":"#faf7f2","primary_button_border":"#2c2420","primary_button_hover_background":"#4a3a35","primary_button_hover_text":"#faf7f2","primary_button_hover_border":"#4a3a35","secondary_button_background":"transparent","secondary_button_text":"#2c2420","secondary_button_border":"#2c2420","secondary_button_hover_background":"#e8e3dc","secondary_button_hover_text":"#2c2420","secondary_button_hover_border":"#2c2420","input_background":"#f0ece4","input_text_color":"#2c2420","input_border_color":"#e8e3dc","input_hover_background":"#e8e3dc","variant_background_color":"#f0ece4","variant_text_color":"#2c2420","variant_border_color":"#e8e3dc","variant_hover_background_color":"#e8e3dc","variant_hover_text_color":"#2c2420","variant_hover_border_color":"#a89070","selected_variant_background_color":"#2c2420","selected_variant_text_color":"#faf7f2","selected_variant_border_color":"#2c2420","selected_variant_hover_background_color":"#4a3a35","selected_variant_hover_text_color":"#faf7f2","selected_variant_hover_border_color":"#4a3a35"}
```

- [ ] **Step 4: Update color scheme-5 (dark — used for CTA close section)**

In `config/settings_data.json`, inside `"current"`, find scheme-5's settings block (starts with `"scheme-5":{"settings":{"background":"#000000"`) and replace the entire settings object value with:

```json
{"background":"#2c2420","foreground_heading":"#faf7f2","foreground":"#d4bfa0","primary":"#faf7f2","primary_hover":"#faf7f2","border":"#4a3a35","shadow":"#000000","primary_button_background":"#faf7f2","primary_button_text":"#2c2420","primary_button_border":"#faf7f2","primary_button_hover_background":"#d4bfa0","primary_button_hover_text":"#2c2420","primary_button_hover_border":"#d4bfa0","secondary_button_background":"transparent","secondary_button_text":"#faf7f2","secondary_button_border":"#faf7f2","secondary_button_hover_background":"#4a3a35","secondary_button_hover_text":"#faf7f2","secondary_button_hover_border":"#faf7f2","input_background":"#2c2420","input_text_color":"#faf7f2","input_border_color":"#4a3a35","input_hover_background":"#4a3a35","variant_background_color":"#2c2420","variant_text_color":"#faf7f2","variant_border_color":"#4a3a35","variant_hover_background_color":"#4a3a35","variant_hover_text_color":"#faf7f2","variant_hover_border_color":"#a89070","selected_variant_background_color":"#faf7f2","selected_variant_text_color":"#2c2420","selected_variant_border_color":"#faf7f2","selected_variant_hover_background_color":"#d4bfa0","selected_variant_hover_text_color":"#2c2420","selected_variant_hover_border_color":"#d4bfa0"}
```

- [ ] **Step 5: Verify — start theme dev server**

```bash
shopify theme dev --store YOUR_STORE.myshopify.com
```

Open the URL it prints. Verify:
- Background is `#faf7f2` (crema warm, not white)
- Headings use a serif font (Cormorant Garamond)
- Text is `#2c2420` (dark warm brown, not black)
- Buttons are dark `#2c2420` with cream text
- No red or uppercase headings visible

- [ ] **Step 6: Commit**

```bash
git add config/settings_data.json
git commit -m "feat(lume): apply warm minimal visual system — palette and typography"
```

---

## Task 2: Create product specs section

**Files:**
- Create: `sections/product-specs.liquid`

- [ ] **Step 1: Create the section file**

Create `sections/product-specs.liquid` with this content:

```liquid
<div class="section-background color-{{ section.settings.color_scheme }}"></div>
<div class="section section--{{ section.settings.section_width }} color-{{ section.settings.color_scheme }}"
  style="padding-block-start: {{ section.settings.padding_top }}px; padding-block-end: {{ section.settings.padding_bottom }}px;">
  <div class="product-specs">
    {%- for block in section.blocks -%}
      <div class="product-specs__item" {{ block.shopify_attributes }}>
        <span class="product-specs__value">{{ block.settings.value }}</span>
        <span class="product-specs__label">{{ block.settings.label }}</span>
      </div>
    {%- endfor -%}
  </div>
</div>

{% stylesheet %}
  .product-specs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background-color: var(--color-border);
  }

  .product-specs__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 16px;
    background-color: var(--color-background);
    text-align: center;
  }

  .product-specs__value {
    font-size: 2rem;
    font-weight: 500;
    color: var(--color-foreground);
    line-height: 1;
  }

  .product-specs__label {
    font-size: 0.75rem;
    color: var(--color-foreground);
    opacity: 0.6;
    letter-spacing: 0.05em;
  }

  @media screen and (max-width: 749px) {
    .product-specs {
      grid-template-columns: repeat(3, 1fr);
    }

    .product-specs__value {
      font-size: 1.5rem;
    }
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Especificaciones",
  "settings": [
    {
      "type": "select",
      "id": "color_scheme",
      "label": "Color scheme",
      "options": [
        { "value": "scheme-1", "label": "Principal" },
        { "value": "scheme-2", "label": "Secundario" }
      ],
      "default": "scheme-1"
    },
    {
      "type": "select",
      "id": "section_width",
      "label": "Ancho",
      "options": [
        { "value": "page-width", "label": "Página" },
        { "value": "full-width", "label": "Completo" }
      ],
      "default": "full-width"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Padding superior",
      "min": 0,
      "max": 80,
      "step": 4,
      "default": 32
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Padding inferior",
      "min": 0,
      "max": 80,
      "step": 4,
      "default": 32
    }
  ],
  "blocks": [
    {
      "type": "spec",
      "name": "Especificación",
      "settings": [
        {
          "type": "text",
          "id": "value",
          "label": "Valor",
          "default": "2700–4000K"
        },
        {
          "type": "text",
          "id": "label",
          "label": "Etiqueta",
          "default": "Temperatura de color"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Especificaciones",
      "blocks": [
        { "type": "spec", "settings": { "value": "2700–4000K", "label": "Temperatura de color" } },
        { "type": "spec", "settings": { "value": "500mm", "label": "Alcance del brazo" } },
        { "type": "spec", "settings": { "value": "5W LED", "label": "Consumo eficiente" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify section renders**

With `shopify theme dev` running, open any product page. The specs section isn't wired up yet (that's Task 5), but you can verify the section file has no Liquid syntax errors by checking the terminal output — it should show no errors for `product-specs.liquid`.

- [ ] **Step 3: Commit**

```bash
git add sections/product-specs.liquid
git commit -m "feat(lume): add product specs section with 3-metric grid"
```

---

## Task 3: Create brand pillars section

**Files:**
- Create: `sections/brand-pillars.liquid`

- [ ] **Step 1: Create the section file**

Create `sections/brand-pillars.liquid` with this content:

```liquid
<div class="section-background color-{{ section.settings.color_scheme }}"></div>
<div class="section section--{{ section.settings.section_width }} color-{{ section.settings.color_scheme }}"
  style="padding-block-start: {{ section.settings.padding_top }}px; padding-block-end: {{ section.settings.padding_bottom }}px;">
  {%- if section.settings.heading != blank -%}
    <p class="brand-pillars__eyebrow">{{ section.settings.heading }}</p>
  {%- endif -%}
  <div class="brand-pillars">
    {%- for block in section.blocks -%}
      <div class="brand-pillars__item" {{ block.shopify_attributes }}>
        <span class="brand-pillars__accent-line"></span>
        <strong class="brand-pillars__title">{{ block.settings.title }}</strong>
        <p class="brand-pillars__body">{{ block.settings.body }}</p>
      </div>
    {%- endfor -%}
  </div>
</div>

{% stylesheet %}
  .brand-pillars__eyebrow {
    font-size: 0.6875rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-primary);
    margin-bottom: 32px;
    padding-inline: var(--page-margin, 24px);
  }

  .brand-pillars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 48px;
    padding-inline: var(--page-margin, 24px);
  }

  .brand-pillars__item {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .brand-pillars__accent-line {
    display: block;
    width: 32px;
    height: 2px;
    background-color: var(--color-primary);
    margin-bottom: 4px;
  }

  .brand-pillars__title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-foreground);
    line-height: 1.4;
  }

  .brand-pillars__body {
    font-size: 0.8125rem;
    color: var(--color-foreground);
    opacity: 0.65;
    line-height: 1.65;
    margin: 0;
  }

  @media screen and (max-width: 749px) {
    .brand-pillars {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Pilares de marca",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Eyebrow",
      "default": "Por qué Lume"
    },
    {
      "type": "select",
      "id": "color_scheme",
      "label": "Color scheme",
      "options": [
        { "value": "scheme-1", "label": "Principal" },
        { "value": "scheme-2", "label": "Secundario" }
      ],
      "default": "scheme-1"
    },
    {
      "type": "select",
      "id": "section_width",
      "label": "Ancho",
      "options": [
        { "value": "page-width", "label": "Página" },
        { "value": "full-width", "label": "Completo" }
      ],
      "default": "page-width"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Padding superior",
      "min": 0,
      "max": 80,
      "step": 4,
      "default": 56
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Padding inferior",
      "min": 0,
      "max": 80,
      "step": 4,
      "default": 56
    }
  ],
  "blocks": [
    {
      "type": "pillar",
      "name": "Pilar",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Título",
          "default": "Sin plástico visible"
        },
        {
          "type": "textarea",
          "id": "body",
          "label": "Descripción",
          "default": "Aluminio anodizado y cable trenzado. Materiales que envejecen bien."
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Pilares de marca",
      "blocks": [
        {
          "type": "pillar",
          "settings": {
            "title": "Sin plástico visible",
            "body": "Aluminio anodizado y cable trenzado. Materiales que envejecen bien."
          }
        },
        {
          "type": "pillar",
          "settings": {
            "title": "Ajuste preciso",
            "body": "Temperatura e intensidad desde el propio brazo. Sin apps, sin Bluetooth."
          }
        },
        {
          "type": "pillar",
          "settings": {
            "title": "Diseñada para durar",
            "body": "Garantía de 5 años. Piezas de repuesto disponibles indefinidamente."
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify no syntax errors**

Check terminal from `shopify theme dev` — no errors for `brand-pillars.liquid`.

- [ ] **Step 3: Commit**

```bash
git add sections/brand-pillars.liquid
git commit -m "feat(lume): add brand pillars section with 3-column layout"
```

---

## Task 4: Create closing CTA section

**Files:**
- Create: `sections/product-cta-close.liquid`

- [ ] **Step 1: Create the section file**

Create `sections/product-cta-close.liquid` with this content:

```liquid
<div class="section-background color-scheme-5"></div>
<div class="section section--{{ section.settings.section_width }} color-scheme-5"
  style="padding-block-start: {{ section.settings.padding_top }}px; padding-block-end: {{ section.settings.padding_bottom }}px;">
  <div class="cta-close">
    {%- if section.settings.heading != blank -%}
      <p class="cta-close__heading">{{ section.settings.heading }}</p>
    {%- endif -%}
    {%- if section.settings.guarantees != blank -%}
      <p class="cta-close__guarantees">{{ section.settings.guarantees }}</p>
    {%- endif -%}
    {%- if section.settings.product != blank -%}
      {%- assign cta_product = all_products[section.settings.product] -%}
      {%- if cta_product.available -%}
        <a href="{{ cta_product.url }}" class="cta-close__button">
          {{ section.settings.button_label | default: 'Añadir al carrito' }}
          {%- if section.settings.show_price and cta_product.price_min > 0 %} — {{ cta_product.price_min | money }}{%- endif -%}
        </a>
      {%- endif -%}
    {%- elsif section.settings.button_url != blank -%}
      <a href="{{ section.settings.button_url }}" class="cta-close__button">
        {{ section.settings.button_label | default: 'Comprar ahora' }}
      </a>
    {%- endif -%}
  </div>
</div>

{% stylesheet %}
  .cta-close {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding-inline: var(--page-margin, 24px);
  }

  .cta-close__heading {
    font-family: var(--font-primary--family);
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    color: var(--color-foreground-heading);
    font-style: italic;
    margin: 0;
    font-weight: 400;
  }

  .cta-close__guarantees {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--color-foreground);
    opacity: 0.7;
    margin: 0;
  }

  .cta-close__button {
    display: inline-block;
    padding: 14px 40px;
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-size: 0.6875rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    border: none;
    transition: background-color 0.2s ease, color 0.2s ease;
    margin-top: 8px;
  }

  .cta-close__button:hover {
    background-color: var(--color-primary);
    color: var(--color-background);
  }
{% endstylesheet %}

{% schema %}
{
  "name": "CTA de cierre",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Titular",
      "default": "¿Listo para actualizar tu espacio?"
    },
    {
      "type": "text",
      "id": "guarantees",
      "label": "Línea de garantías",
      "default": "Envío en 48h · Devolución gratuita 30 días · Garantía 5 años"
    },
    {
      "type": "product",
      "id": "product",
      "label": "Producto (para precio dinámico)"
    },
    {
      "type": "text",
      "id": "button_label",
      "label": "Texto del botón",
      "default": "Añadir al carrito"
    },
    {
      "type": "checkbox",
      "id": "show_price",
      "label": "Mostrar precio en el botón",
      "default": true
    },
    {
      "type": "url",
      "id": "button_url",
      "label": "URL del botón (si no hay producto seleccionado)"
    },
    {
      "type": "select",
      "id": "section_width",
      "label": "Ancho",
      "options": [
        { "value": "page-width", "label": "Página" },
        { "value": "full-width", "label": "Completo" }
      ],
      "default": "full-width"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Padding superior",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 64
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Padding inferior",
      "min": 0,
      "max": 100,
      "step": 4,
      "default": 64
    }
  ],
  "presets": [
    {
      "name": "CTA de cierre"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify no syntax errors**

Check terminal from `shopify theme dev` — no errors for `product-cta-close.liquid`.

- [ ] **Step 3: Commit**

```bash
git add sections/product-cta-close.liquid
git commit -m "feat(lume): add closing CTA section with dark scheme-5 background"
```

---

## Task 5: Wire up full 7-block product page

**Files:**
- Modify: `templates/product.json`

> Replace the entire file. The current file has only the hero block + product recommendations. The new version adds specs, pillars, lifestyle hero, and closing CTA in the correct order.

- [ ] **Step 1: Replace `templates/product.json`**

Replace the entire contents of `templates/product.json` with:

```json
{
  "sections": {
    "main": {
      "type": "product-information",
      "blocks": {
        "media-gallery": {
          "type": "_product-media-gallery",
          "static": true,
          "settings": {
            "media_presentation": "grid",
            "media_columns": "two",
            "image_gap": 1,
            "large_first_image": true,
            "icons_style": "none",
            "slideshow_controls_style": "counter",
            "slideshow_mobile_controls_style": "dots",
            "thumbnail_position": "bottom",
            "thumbnail_width": 44,
            "aspect_ratio": "1",
            "constrain_to_viewport": false,
            "media_fit": "cover",
            "media_radius": 0,
            "extend_media": true,
            "zoom": true,
            "video_loop": false,
            "hide_variants": false,
            "padding-block-start": 0,
            "padding-block-end": 0,
            "padding-inline-start": 0,
            "padding-inline-end": 0
          },
          "blocks": {}
        },
        "product-details": {
          "type": "_product-details",
          "static": true,
          "settings": {
            "width": "custom",
            "custom_width": 90,
            "width_mobile": "fill",
            "custom_width_mobile": 100,
            "height": "fit",
            "details_position": "flex-start",
            "gap": 16,
            "sticky_details_desktop": true,
            "inherit_color_scheme": true,
            "color_scheme": "",
            "border": "none",
            "border_radius": 0,
            "padding-block-start": 24,
            "padding-block-end": 36,
            "padding-inline-start": 12,
            "padding-inline-end": 12
          },
          "blocks": {
            "eyebrow": {
              "type": "text",
              "name": "Eyebrow",
              "settings": {
                "text": "<p>LUME — MODEL 01</p>",
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "custom",
                "font": "var(--font-accent--family)",
                "font_size": "0.6875rem",
                "line_height": "normal",
                "letter_spacing": "0.2em",
                "case": "uppercase",
                "wrap": "pretty",
                "color": "var(--color-primary)",
                "padding-block-start": 0,
                "padding-block-end": 4,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "title": {
              "type": "text",
              "name": "Título",
              "settings": {
                "text": "<h1>{{ closest.product.title }}</h1>",
                "width": "fit-content",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "h2",
                "font": "var(--font-primary--family)",
                "font_size": "",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-foreground)",
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "materials": {
              "type": "text",
              "name": "Materiales",
              "settings": {
                "text": "<p>{{ closest.product.metafields.descriptors.subtitle.value }}</p>",
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "custom",
                "font": "var(--font-body--family)",
                "font_size": "0.8125rem",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-primary)",
                "padding-block-start": 4,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "price": {
              "type": "price",
              "settings": {
                "show_sale_price_first": true,
                "show_installments": true,
                "show_tax_info": true,
                "type_preset": "h4",
                "width": "100%",
                "alignment": "left",
                "font": "var(--font-body--family)",
                "font_size": "",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "color": "var(--color-foreground)",
                "padding-block-start": 16,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "variant_picker": {
              "type": "variant-picker",
              "settings": {
                "variant_style": "buttons",
                "show_swatches": true,
                "alignment": "left",
                "padding-block-start": 16,
                "padding-block-end": 24,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "buy_buttons": {
              "type": "buy-buttons",
              "settings": {
                "stacking": false,
                "show_pickup_availability": false,
                "gift_card_form": false,
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {
                "quantity": {
                  "type": "quantity",
                  "static": true,
                  "settings": {},
                  "blocks": {}
                },
                "add-to-cart": {
                  "type": "add-to-cart",
                  "static": true,
                  "settings": {
                    "style_class": "button"
                  },
                  "blocks": {}
                }
              },
              "block_order": ["quantity", "add-to-cart"]
            },
            "shipping_note": {
              "type": "text",
              "name": "Nota de envío",
              "settings": {
                "text": "<p>IVA incluido · Envío gratis en pedidos +€80</p>",
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "custom",
                "font": "var(--font-accent--family)",
                "font_size": "0.6875rem",
                "line_height": "normal",
                "letter_spacing": "0.08em",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-primary)",
                "padding-block-start": 8,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "description_divider": {
              "type": "text",
              "name": "Separador",
              "settings": {
                "text": "<p>—</p>",
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "custom",
                "font": "var(--font-body--family)",
                "font_size": "1rem",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-primary)",
                "padding-block-start": 16,
                "padding-block-end": 8,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "description": {
              "type": "text",
              "name": "Descripción",
              "settings": {
                "text": "{{ closest.product.description }}",
                "width": "100%",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "rte",
                "font": "var(--font-body--family)",
                "font_size": "",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "",
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            }
          },
          "block_order": [
            "eyebrow",
            "title",
            "materials",
            "price",
            "variant_picker",
            "buy_buttons",
            "shipping_note",
            "description_divider",
            "description"
          ]
        }
      },
      "settings": {
        "content_width": "content-center-aligned",
        "desktop_media_position": "left",
        "equal_columns": false,
        "limit_details_width": false,
        "gap": 8,
        "color_scheme": "scheme-1",
        "padding-block-start": 0,
        "padding-block-end": 0
      }
    },
    "specs": {
      "type": "product-specs",
      "settings": {
        "color_scheme": "scheme-1",
        "section_width": "full-width",
        "padding_top": 32,
        "padding_bottom": 32
      },
      "blocks": {
        "spec_1": {
          "type": "spec",
          "settings": {
            "value": "2700–4000K",
            "label": "Temperatura de color"
          }
        },
        "spec_2": {
          "type": "spec",
          "settings": {
            "value": "500mm",
            "label": "Alcance del brazo"
          }
        },
        "spec_3": {
          "type": "spec",
          "settings": {
            "value": "5W LED",
            "label": "Consumo eficiente"
          }
        }
      },
      "block_order": ["spec_1", "spec_2", "spec_3"]
    },
    "pillars": {
      "type": "brand-pillars",
      "settings": {
        "heading": "Por qué Lume",
        "color_scheme": "scheme-1",
        "section_width": "page-width",
        "padding_top": 56,
        "padding_bottom": 56
      },
      "blocks": {
        "pillar_1": {
          "type": "pillar",
          "settings": {
            "title": "Sin plástico visible",
            "body": "Aluminio anodizado y cable trenzado. Materiales que envejecen bien."
          }
        },
        "pillar_2": {
          "type": "pillar",
          "settings": {
            "title": "Ajuste preciso",
            "body": "Temperatura e intensidad desde el propio brazo. Sin apps, sin Bluetooth."
          }
        },
        "pillar_3": {
          "type": "pillar",
          "settings": {
            "title": "Diseñada para durar",
            "body": "Garantía de 5 años. Piezas de repuesto disponibles indefinidamente."
          }
        }
      },
      "block_order": ["pillar_1", "pillar_2", "pillar_3"]
    },
    "lifestyle_image": {
      "type": "hero",
      "blocks": {},
      "block_order": [],
      "settings": {
        "media_type_1": "image",
        "media_type_2": "none",
        "open_in_new_tab": false,
        "content_direction": "column",
        "vertical_on_mobile": true,
        "horizontal_alignment": "center",
        "vertical_alignment": "center",
        "gap": 0,
        "section_width": "full-width",
        "section_height": "large",
        "section_height_custom": 60,
        "color_scheme": "scheme-1",
        "toggle_overlay": false,
        "padding-block-start": 0,
        "padding-block-end": 0
      }
    },
    "editorial_story": {
      "type": "media-with-content",
      "blocks": {
        "eyebrow": {
          "type": "_inline-text",
          "settings": {
            "text": "El diseño",
            "type_preset": "custom",
            "font": "var(--font-accent--family)",
            "font_size": "0.6875rem",
            "letter_spacing": "0.2em",
            "case": "uppercase",
            "color": "var(--color-primary)"
          },
          "blocks": {}
        },
        "body": {
          "type": "_content",
          "settings": {
            "text": "<p>Cada curva de Lume Model 01 tiene una razón de ser. El brazo articulado de tres segmentos permite posicionar la luz exactamente donde la necesitas sin comprometer la estética del escritorio. No hay cables a la vista. No hay botones innecesarios.</p><p>Aluminio anodizado. Cable trenzado. Una sola junta de ajuste que aguanta décadas.</p>"
          },
          "blocks": {}
        }
      },
      "block_order": ["eyebrow", "body"],
      "settings": {
        "media_width": "wide",
        "media_position": "right",
        "section_width": "full-width",
        "color_scheme": "scheme-2",
        "padding-block-start": 0,
        "padding-block-end": 0
      }
    },
    "cta_close": {
      "type": "product-cta-close",
      "settings": {
        "heading": "¿Listo para actualizar tu espacio?",
        "guarantees": "Envío en 48h · Devolución gratuita 30 días · Garantía 5 años",
        "button_label": "Añadir al carrito",
        "show_price": true,
        "button_url": "/cart",
        "section_width": "full-width",
        "padding_top": 64,
        "padding_bottom": 64
      }
    }
  },
  "order": [
    "main",
    "specs",
    "pillars",
    "lifestyle_image",
    "editorial_story",
    "cta_close"
  ]
}
```

- [ ] **Step 2: Verify product page structure**

With `shopify theme dev` running, open a product page URL. Verify:
- Hero: galería izquierda, panel sticky derecho con eyebrow monoespaciado, título serif, precio, swatches, botón oscuro
- Specs: 3 métricas en grid con fondo crema y separadores
- Pillars: 3 columnas con línea de acento dorada
- Lifestyle image: espacio para imagen (aparece vacío hasta que se añada la imagen desde el admin)
- Editorial story: texto de diseño en layout media-with-content
- CTA close: fondo oscuro `#2c2420` con botón crema

- [ ] **Step 3: Commit**

```bash
git add templates/product.json
git commit -m "feat(lume): wire up 7-block product page with all sections"
```

---

## Task 6: Update homepage

**Files:**
- Modify: `templates/index.json`

- [ ] **Step 1: Replace `templates/index.json`**

Replace the entire contents of `templates/index.json` with:

```json
{
  "sections": {
    "hero": {
      "type": "hero",
      "blocks": {
        "content_group": {
          "type": "group",
          "settings": {
            "open_in_new_tab": false,
            "content_direction": "column",
            "vertical_on_mobile": true,
            "horizontal_alignment": "flex-start",
            "vertical_alignment": "center",
            "horizontal_alignment_flex_direction_column": "flex-start",
            "vertical_alignment_flex_direction_column": "center",
            "gap": 20,
            "width": "custom",
            "custom_width": 38,
            "width_mobile": "custom",
            "custom_width_mobile": 70,
            "height": "fit",
            "custom_height": 100,
            "inherit_color_scheme": true,
            "color_scheme": "",
            "border": "none",
            "border_radius": 0,
            "padding-block-start": 0,
            "padding-block-end": 0,
            "padding-inline-start": 0,
            "padding-inline-end": 0
          },
          "blocks": {
            "eyebrow": {
              "type": "text",
              "settings": {
                "text": "<p>Lume — Model 01</p>",
                "width": "fit-content",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "custom",
                "font": "var(--font-accent--family)",
                "font_size": "0.6875rem",
                "line_height": "normal",
                "letter_spacing": "0.2em",
                "case": "uppercase",
                "wrap": "pretty",
                "color": "var(--color-primary)",
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "headline": {
              "type": "text",
              "settings": {
                "text": "<h1>El espacio donde trabajas dice quién eres.</h1>",
                "width": "fit-content",
                "max_width": "normal",
                "alignment": "left",
                "type_preset": "h2",
                "font": "var(--font-primary--family)",
                "font_size": "",
                "line_height": "normal",
                "letter_spacing": "normal",
                "case": "none",
                "wrap": "pretty",
                "color": "var(--color-foreground-heading)",
                "padding-block-start": 0,
                "padding-block-end": 0,
                "padding-inline-start": 0,
                "padding-inline-end": 0
              },
              "blocks": {}
            },
            "cta": {
              "type": "button",
              "settings": {
                "label": "Ver la lámpara →",
                "link": "shopify://collections/all",
                "open_in_new_tab": false,
                "style_class": "button",
                "width": "fit-content",
                "custom_width": 100,
                "width_mobile": "fit-content",
                "custom_width_mobile": 100
              },
              "blocks": {}
            }
          },
          "block_order": ["eyebrow", "headline", "cta"]
        }
      },
      "block_order": ["content_group"],
      "settings": {
        "media_type_1": "image",
        "media_type_2": "none",
        "open_in_new_tab": false,
        "content_direction": "column",
        "vertical_on_mobile": true,
        "horizontal_alignment": "flex-start",
        "vertical_alignment": "center",
        "gap": 16,
        "section_width": "full-width",
        "section_height": "large",
        "section_height_custom": 80,
        "color_scheme": "scheme-1",
        "toggle_overlay": false,
        "padding-block-start": 0,
        "padding-block-end": 0
      }
    },
    "brand_statement": {
      "type": "media-with-content",
      "blocks": {
        "eyebrow": {
          "type": "_inline-text",
          "settings": {
            "text": "Infraestructura, no decoración",
            "type_preset": "custom",
            "font": "var(--font-accent--family)",
            "font_size": "0.6875rem",
            "letter_spacing": "0.2em",
            "case": "uppercase",
            "color": "var(--color-primary)"
          },
          "blocks": {}
        },
        "body": {
          "type": "_content",
          "settings": {
            "text": "<p>Una lámpara de escritorio para profesionales que trabajan desde casa y no hacen concesiones en su entorno. Luz precisa, materiales que envejecen bien, un diseño que no distrae.</p>"
          },
          "blocks": {}
        },
        "link": {
          "type": "_inline-text",
          "settings": {
            "text": "<a href='/collections/all'>Descubrir Lume →</a>",
            "type_preset": "custom",
            "font": "var(--font-body--family)",
            "font_size": "0.8125rem",
            "letter_spacing": "0.05em",
            "case": "none",
            "color": "var(--color-foreground)"
          },
          "blocks": {}
        }
      },
      "block_order": ["eyebrow", "body", "link"],
      "settings": {
        "media_width": "wide",
        "media_position": "left",
        "section_width": "full-width",
        "color_scheme": "scheme-2",
        "padding-block-start": 0,
        "padding-block-end": 0
      }
    }
  },
  "order": [
    "hero",
    "brand_statement"
  ]
}
```

- [ ] **Step 2: Verify homepage**

With `shopify theme dev` running, open the homepage (`/`). Verify:
- Hero: fondo crema, eyebrow monoespaciado, titular serif en serif grande, botón oscuro "Ver la lámpara →"
- Brand statement: sección en beige con eyebrow + texto de propuesta de valor
- No contenido de la demo anterior ("Savor every. last. bite.")

- [ ] **Step 3: Commit**

```bash
git add templates/index.json
git commit -m "feat(lume): update homepage with Lume hero and brand statement"
```

---

## Task 7: Add .gitignore entry for superpowers brainstorm files

**Files:**
- Modify: `.gitignore` (create if missing)

- [ ] **Step 1: Add .superpowers to .gitignore**

Check if `.gitignore` exists:

```bash
ls .gitignore 2>/dev/null && echo "exists" || echo "missing"
```

If it exists, append:
```
.superpowers/
```

If it doesn't exist, create it with:
```
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm session files"
```

---

## Self-Review

**Spec coverage check:**
- [x] Nombre: Lume → set as eyebrow text in hero and product page
- [x] Propuesta de valor → brand_statement section on homepage + description block
- [x] ICP / tono → copy hardcoded throughout templates (editable from admin)
- [x] Ángulos de venta → visible in product description (written by merchant in product admin)
- [x] Dirección visual — paleta → Task 1 (settings_data.json schemes)
- [x] Dirección visual — tipografía → Task 1 (font keys updated)
- [x] Product page — 7 bloques → Task 5 (product.json)
- [x] Homepage → Task 6 (index.json)
- [x] Notas técnicas Shopify → followed throughout (section types, block types, scheme names)

**Gaps noted:**
- Social proof (reviews): requires Judge.me or Okendo app. Not blocking — product page has the editorial_story section where review quotes can be added as custom HTML via the admin's Custom Liquid block once the app is installed.
- Lifestyle images: the `lifestyle_image` hero section and homepage hero both require an actual image to be set in the Shopify admin (Theme Editor → select image). Sections render correctly but appear with a blank placeholder until then.
- Product metafield `descriptors.subtitle`: used for the materials line. Merchant must create this metafield in the Shopify admin (Settings → Custom data → Products) and populate it per product.

**No placeholders, no TBDs, no circular references found.**
