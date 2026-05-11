# Jarapa Home — Ficha de Producto Persianas de Esparto

**Fecha:** 2026-05-11  
**Alcance:** Solo ficha de producto (`product.json` + secciones asociadas). Homepage y tema global en fase posterior.

---

## Contexto

Jarapa Home es una tienda artesanal de Pampaneira (Alpujarra, Granada) que vende persianas de esparto hechas a mano a medida. El producto estrella son las persianas, cuyo precio varía según dimensiones. El tema actual tiene referencias a "Lume" (un proyecto anterior) que deben eliminarse.

**Prioridad del cliente:** implementar un calculador de precios por tramos que garantice rentabilidad en pedidos pequeños con envío gratuito.

---

## Lógica del Calculador de Precio

| Superficie | Tarifa |
|---|---|
| < 1 m² | €150 / m² |
| 1 m² – 3 m² (inclusive) | €105 / m² |
| > 3 m² | €95 / m² |

**Restricciones:**
- Mínimo: 30 cm (ancho y alto)
- Máximo: 700 cm / 7 m (ancho y alto)
- Fuera de rango → mostrar "No hacemos ese tamaño"
- El precio se multiplica por la cantidad (mínimo 1)
- Precio se muestra en tiempo real al escribir las medidas

**Ejemplo de cálculo:**
- 30×30 cm = 0.09 m² → €150 × 0.09 = €13,50
- 100×100 cm = 1 m² → €105 × 1 = €105,00
- 200×200 cm = 4 m² → €95 × 4 = €380,00

---

## Estructura de la Ficha de Producto

### 1. Sección principal (split 55/45)

**Columna izquierda — Galería:**
- Imagen principal grande con object-fit cover
- 4 miniaturas clicables debajo (persiana.png, persiana2–4.png)
- Badge "Hecha a mano · Pampaneira" sobre la imagen

**Columna derecha — Detalles:**
- Brand eyebrow: "JARAPA HOME · ESPARTO"
- H1: "Persiana de esparto a medida"
- Link destacado: "+ Incluimos Sistema para Colocarlas"
- **Calculador:**
  - Campo: Ancho de la persiana en centímetros (con icono ℹ️ tooltip)
  - Campo: Largo de la persiana en centímetros (con icono ℹ️ tooltip)
  - Validación en tiempo real con mensaje "No hacemos ese tamaño" si fuera de rango
- Link: "Envío Gratis en toda la Península"
- Selector de cantidad (mínimo 1)
- **Bloque precio:** fondo salmón/terracota, texto "Precio total" + "€ XXX"
- Botón "Agregar al carrito" (deshabilitado hasta tener medidas válidas)
- Acordeón 1: "CARACTERÍSTICAS DEL PRODUCTO" (collapsible)
- Acordeón 2: "PREGUNTAS FRECUENTES" (collapsible)

### 2. Antes y Después (de clientes)
- Título centrado: "Antes y Después (de clientes)"
- Grid de 4 imágenes iguales
- Imágenes configurables por el merchant desde el customizer

### 3. Cómo tomar las medidas
- Título centrado: "Cómo tomar las medidas"
- Grid de 3 columnas con label + vídeo embebido:
  - Porche
  - Ventana (parte interna)
  - Ventana (exterior)
- URLs de vídeo configurables desde el customizer

### 4. Cómo instalar las persianas de esparto
- Título centrado
- Layout 50/50: vídeo grande izquierda + texto instrucciones derecha
- Vídeo y texto configurables desde el customizer

### 5. Cómo fabricamos las persianas de esparto
- Título centrado
- Vídeo centrado (ancho máximo ~700px)
- URL configurable desde el customizer

### 6. Texto SEO
- Bloque de texto enriquecido (RTE)
- Usa el contenido del campo `description` del producto en Shopify
- Se muestra completo (el contenido SEO ya existente en la tienda)

### 7. Reseñas de clientes
- Widget de reseñas existente (Judge.me o similar)
- Resumen de puntuación: 4.52/5, 25 reseñas, barras de distribución
- Listado de reseñas individuales con fecha, autor, verificado, texto
- Botón "Escribir una reseña"

### 8. Otros productos
- Título centrado: "Otros Productos"
- Grid de 4 product cards
- Usa la sección `product-recommendations.liquid` existente del tema

### 9. Comprometidos con el Medio Ambiente
- Fondo claro con 3 pilares:
  - Materiales Reciclados (icono)
  - Producción Artesanal (icono)
  - Sostenibilidad y Respeto (icono)
- Usa la sección `brand-pillars.liquid` existente del tema

---

## Implementación Técnica

### Paso 0 — Limpiar referencias a Lume
- `templates/index.json`: reemplazar contenido Lume por Jarapa Home
- `templates/product.json`: reemplazar estructura Lume por la nueva ficha
- Revisar todos los archivos de secciones/snippets por textos hardcodeados de Lume

### Paso 1 — Sección `persiana-calculator.liquid` (nueva)
Sección Shopify standalone que contiene:
- El bloque split (galería + detalles)
- El calculador con JS inline
- El bloque de precio y botón de carrito
- Los acordeones

El calculador se implementa como JavaScript vanilla que:
1. Lee ancho y alto de los inputs
2. Valida el rango (30–700 cm)
3. Calcula m² = (ancho × alto) / 10000
4. Aplica la tarifa correcta según tramo
5. Multiplica por cantidad
6. Actualiza precio en pantalla y texto del botón
7. Pasa el precio calculado al carrito mediante `line_item_properties`

**Integración con Shopify cart:**  
El precio real del producto en Shopify debe ser €1 (precio base). El precio calculado se envía como propiedad de línea (`_price_calculated`) y se aplica mediante un script de Shopify o una app de custom pricing. *Este punto se revisará con el cliente según la solución de carrito que use.*

### Paso 2 — Secciones de contenido (nuevas o reutilizadas)
- `antes-despues.liquid` — nueva, grid 4 imágenes configurable
- `como-tomar-medidas.liquid` — nueva, 3 columnas con vídeo
- `como-instalar.liquid` — nueva, split vídeo+texto  
- `como-fabricamos.liquid` — nueva, vídeo centrado
- `seo-text.liquid` — reutilizar `main-page.liquid` o bloque RTE simple

### Paso 3 — `product.json` actualizado
Definir el orden de secciones con los IDs correspondientes.

### Paso 4 — Homepage limpia (Lume → Jarapa)
Actualizar `index.json` con el contenido y estructura de Jarapa Home.

---

## Paleta de colores (Artesanía Cálida)

| Token | Valor | Uso |
|---|---|---|
| Fondo principal | `#fff` / `#faf7f3` | Páginas |
| Terracota | `#c8824a` | Precio, CTAs secundarios, labels |
| Marrón oscuro | `#3a2a1a` | Textos, botón principal |
| Beige cálido | `#f8f3ee` | Calculador, fondos suaves |
| Borde | `#ddd0c0` | Inputs, separadores |
| Error | `#c0392b` | Mensaje fuera de rango |

---

## Notas

- Las URLs de vídeo (YouTube/Vimeo) se configuran desde el Shopify customizer como settings de sección, no hardcodeadas.
- Las 4 imágenes de "Antes y Después" también se configuran desde el customizer.
- El texto SEO viene del `product.description` de Shopify — el cliente ya lo tiene en la tienda.
- La integración del precio calculado con el carrito real de Shopify requiere una solución adicional (discutir con cliente): puede ser una app como "Custom Pricing" o un workaround con variantes de producto.
