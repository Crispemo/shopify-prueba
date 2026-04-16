# Lume — Diseño de marca y tienda Shopify

**Fecha:** 2026-04-16
**Producto:** Lámparas de escritorio minimalistas
**Plataforma:** Shopify (tema Savor v3.5.1)
**Idioma del store:** Español
**Precio:** €80–€150 (un solo producto con variantes)

---

## 1. Nombre e identidad

**Nombre:** Lume
**Origen:** Luz en italiano y latín. Corto, universal, pronunciable en español.

**Tagline principal:**
> "El espacio donde trabajas dice quién eres."

**Taglines alternativos:**
- "Luz para los que trabajan en serio."
- "Diseñada para quedarse."

---

## 2. Propuesta de valor

Una lámpara de escritorio diseñada para profesionales que trabajan desde casa y no hacen concesiones en su entorno. No es decoración. Es infraestructura. Luz precisa, materiales que envejecen bien, un diseño que no distrae. Para el tipo de persona que elige bien cada elemento de su espacio de trabajo.

**Posicionamiento:** The Space — la lámpara como pieza central del workspace ideal. El cliente no compra luz, compra el espacio donde quiere trabajar.

---

## 3. Cliente ideal (ICP)

**Perfil primario:**
- 25–40 años
- Trabaja desde casa o tiene un home office propio
- Founder, diseñador, consultor, programador senior
- Gasta sin problema en su setup (silla, monitor, micrófono)
- Está construyendo un espacio de trabajo que le represente

**Comportamiento de compra:**
- Investiga antes de comprar; no decide por precio sino por confianza y criterio
- Le importa cómo se ve su espacio en fotos; comparte su setup en redes
- Evita lo genérico activamente
- Una vez que confía en una marca, vuelve y recomienda

---

## 4. Tono de marca

**Lume habla así:**
- Directo, sin adornos innecesarios
- Confiado pero no arrogante
- Habla de trabajo real, no de sueños
- Usa datos y especificaciones con orgullo
- Respeta la inteligencia del cliente

**Lume nunca dice:**
- "¡Transforma tu hogar!"
- "La mejor lámpara del mercado"
- "Perfecta para toda la familia"
- "¡Oferta limitada!"
- Emojis en copy de producto

**Ejemplo de voz:**
> "Diseñada para las 6 horas que realmente importan. Luz ajustable en temperatura e intensidad, brazo articulado de aluminio, cable trenzado. Sin plástico visible. Sin compromiso."

---

## 5. Ángulos de venta

### 01 — Setup upgrade
"Ya tienes buena silla, buen monitor. La luz es lo último que actualizas y lo primero que se nota."
Funciona con comunidades de setup (Twitter/X, Reddit, YouTube setups).

### 02 — Anti-genérico
"No es la lámpara de IKEA. No es la de Amazon. Es la que elegiste."
Apela al orgullo del cliente que no quiere lo mismo que todos. Muy efectivo en diseñadores y founders.

### 03 — Inversión, no gasto
"€120 que usas 8 horas al día durante 10 años. Son céntimos por hora."
Justifica el precio sin descuentos. Habla el idioma del cliente que calcula ROI en todo.

### 04 — El espacio como identidad
"Tu espacio de trabajo dice algo de ti antes de que abras la boca."
Conecta con la identidad del cliente. Potente para personas que comparten su workspace online.

---

## 6. Dirección visual

**Estética:** Warm Minimal — blancos cálidos, tierra, madera, latón. Minimalista pero acogedor. Sensación de objeto artesanal premium.

### Paleta de color

| Rol | Nombre | Hex |
|-----|--------|-----|
| Fondo | Crema cálido | `#faf7f2` |
| Texto principal | Casi negro cálido | `#2c2420` |
| Acento | Arena dorada | `#a89070` |
| Secundario | Beige suave | `#d4bfa0` |
| Borde | Gris cálido | `#e8e3dc` |

### Tipografía

| Uso | Fuente | Características |
|-----|--------|-----------------|
| Headlines | Cormorant Garamond / Libre Baskerville | Serif, editorial, peso premium |
| Body | Inter / DM Sans | Sans-serif, limpio, legible |
| Labels técnicos | JetBrains Mono / Space Mono | Monoespaciado, specs, etiquetas |

### Principios visuales
- Mucho espacio en blanco (padding generoso)
- Sin bordes redondeados — esquinas a 90°
- Imágenes de producto sobre fondo `#faf7f2` o `#e8e3dc`
- Fotografía lifestyle: escritorio ordenado, luz natural, sin personas
- Sin iconos decorativos — solo líneas y geometría simple

---

## 7. Estructura de la Product Page

Orden de bloques de arriba a abajo:

### Bloque 1 — Hero (galería + panel de compra)
- Galería izquierda: imagen principal grande + 4 thumbnails lifestyle
- Panel derecho sticky: nombre técnico en monoespaciado, título en serif, materiales en una línea, precio, selector de variantes (color como swatches), botón "Añadir al carrito" + pago en cuotas
- **Mapeo Savor:** `product-information` con `_product-media-gallery` + `_product-details`

### Bloque 2 — Especificaciones técnicas
- 3 métricas clave en formato numérico grande: temperatura de color, alcance del brazo, consumo
- Fondo blanco puro para contraste
- **Mapeo Savor:** `custom-liquid` o metafields como specs destacadas

### Bloque 3 — Tres pilares de valor
- "Sin plástico visible", "Ajuste preciso", "Diseñada para durar"
- Cada pilar: línea de acento + título corto + 2 líneas de cuerpo
- **Mapeo Savor:** `media-with-content` con layout de 3 columnas

### Bloque 4 — Imagen lifestyle full-width
- Escritorio completo con la lámpara en contexto
- Sin texto superpuesto — la imagen habla sola
- **Mapeo Savor:** sección `hero.liquid` o imagen dentro de la product page

### Bloque 5 — Descripción editorial
- 3–4 párrafos cortos sobre el diseño y las decisiones de materiales
- Tono de manifiesto, no de ficha técnica
- **Mapeo Savor:** campo descripción rica del producto o bloque `text`

### Bloque 6 — Social proof
- 2 reviews en formato cita: texto en cursiva + nombre + rol
- Sin estrellas visibles — el texto vale más que el número
- **Mapeo Savor:** app de reviews (Judge.me / Okendo) o `custom-liquid`

### Bloque 7 — CTA de cierre
- Fondo `#2c2420` (oscuro)
- Frase corta en serif + garantías en una línea (envío 48h, devolución 30d, garantía 5a)
- Botón con precio incluido: "Añadir al carrito — €129"
- **Mapeo Savor:** `featured-product.liquid` adaptado o sección custom

---

## 8. Notas técnicas para Shopify

- **Tema base:** Savor v3.5.1 — soporta layouts de columnas, sticky panels, custom liquid
- **Colores:** configurar en `settings_data.json` como scheme-1 (fondo crema, texto oscuro)
- **Tipografía:** Cormorant Garamond + Inter disponibles en Google Fonts / Shopify Font Picker
- **Variantes:** implementar como swatches de color (ya soportado en el tema)
- **Metafields sugeridos:** `product.metafields.specs.temperature`, `product.metafields.specs.reach`, `product.metafields.specs.power` para los bloques técnicos
- **Reviews:** integrar Judge.me (gratuito) o Okendo para el bloque de social proof
- **Pagos a plazos:** activar Shopify Pay Installments o Sequra si el mercado es España

---

## 9. Decisiones tomadas y razones

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Nombre: Lume | Stillroom | Más corto, directo, universal |
| Estética: Warm Minimal | Cold Precision / Dark Editorial | Más acogedor para €80–150; no tan frío ni exclusivo |
| Enfoque: The Space | The Tool / The Object | Mejor para el perfil de cliente que comparte su setup online |
| Un solo producto | Catálogo | Permite concentrar toda la marca en un objeto |
| Copy en español | Bilingüe | El cliente objetivo es hispanohablante; más conexión |
