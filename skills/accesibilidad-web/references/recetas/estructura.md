# Estructura de la página

**Criterios**: 3.1.1 Idioma de la página, 3.1.2 Idioma de las partes, 2.4.2 Titulado de páginas, 2.4.1 Evitar bloques, 1.3.1 Información y relaciones, 1.3.2 Secuencia significativa, 1.3.3 Características sensoriales, 2.4.6 Encabezados y etiquetas, 1.4.4 Cambio de tamaño del texto, 1.4.10 Reajuste, 1.4.12 Espaciado del texto, 1.3.4 Orientación, 3.2.6 Ayuda coherente, 4.1.1 Procesamiento (EN). Reglas axe: `html-has-lang`, `html-lang-valid`, `valid-lang`, `document-title`, `bypass`, `skip-link`, `region`, `landmark-*`, `page-has-heading-one`, `heading-order`, `empty-heading`, `list`, `listitem`, `duplicate-id*`, `meta-viewport`, `meta-refresh`, `css-orientation-lock`, `p-as-heading`. Comprobaciones propias: `reflow-320`, `sin-enlace-saltar`.

## Esqueleto recomendado

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cafetera Express X200 – Mi Tienda</title>
</head>
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>
  <header>
    <a href="/"><img src="/logo.svg" alt="Mi Tienda, inicio"></a>
    <nav aria-label="Principal">…</nav>
  </header>
  <main id="contenido" tabindex="-1">
    <h1>Cafetera Express X200</h1>
    <section aria-labelledby="t-specs">
      <h2 id="t-specs">Especificaciones</h2>
      …
    </section>
  </main>
  <footer>
    <nav aria-label="Pie">…</nav>
  </footer>
</body>
</html>
```

## Idioma (3.1.1, 3.1.2)

- `lang` en `<html>` con el idioma principal (`es`, `ca`, `eu`, `gl`, `en`…).
- Fragmentos en otro idioma: `<span lang="en">Black Friday</span>`, `<p lang="ca">…</p>`. Nombres propios y préstamos asentados no lo necesitan.
- Selector de idioma: cada opción en su idioma (`<a href="/ca/" lang="ca" hreflang="ca">Català</a>`).

## Título (2.4.2)

Único y descriptivo, de lo específico a lo general: «Resultados para "cafetera" (24) – Mi Tienda», «Error en el pago – Paso 3 de 4 – Mi Tienda». En aplicaciones de una sola página, actualízalo en cada cambio de vista.

## Enlace «Saltar al contenido» (2.4.1)

Primer elemento enfocable, visible al recibir foco:

```css
.saltar {
  position: absolute;
  left: 1rem;
  top: -100px;
}
.saltar:focus { top: 1rem; z-index: 1000; background: #fff; color: #000; padding: .5rem 1rem; outline: 3px solid #0b57d0; }
```

El destino debe existir (`id="contenido"`). `tabindex="-1"` en `<main>` garantiza que el foco se mueva allí en todos los navegadores.

## Regiones (1.3.1)

- Un único `<main>`; `<header>` y `<footer>` de primer nivel (banner y contentinfo); `<nav>` con nombre si hay varias; `<aside>` para contenido complementario.
- Todo el contenido visible debe estar dentro de alguna región (regla `region`), incluidos banners de cookies (que pueden ser `<section aria-label="Cookies">` o un diálogo).

## Encabezados (1.3.1, 2.4.6)

- Un `<h1>` por página que describa su contenido principal (el logo **no** suele ser el `h1`).
- Jerarquía sin saltos: h1 → h2 → h3. Elegir el nivel por la estructura, el tamaño por CSS.
- Encabezados descriptivos: «Opiniones de clientes» mejor que «Opiniones».
- Títulos de tarjetas de producto en un listado: normalmente `h2` o `h3` según su sección.

## Listas y estructura semántica

`<ul>`/`<ol>` para listas (menús, resultados, migas de pan), `<dl>` para pares clave–valor, `<blockquote>`, `<figure>/<figcaption>`, `<address>`. Nada de párrafos en negrita como títulos (`p-as-heading`).

## Ids únicos (4.1.1 en EN 301 549, y 4.1.2)

Un `id` repetido rompe `label for`, `aria-labelledby` y `aria-controls`. En componentes repetidos genera ids únicos (`useId()` en React, `useId()` en Vue 3.5+, sufijo con el id del producto en plantillas).

## Zoom y viewport (1.4.4)

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Nunca `user-scalable=no` ni `maximum-scale` menor que 2 (mejor no ponerlo). Tamaños de letra en `rem` para respetar la preferencia del usuario.

## Reflow a 320 px (1.4.10)

A 320 px CSS de ancho no debe haber scroll horizontal (salvo tablas de datos, mapas, gráficos, editores). Causas típicas y arreglo:

| Causa | Arreglo |
|---|---|
| Anchos fijos (`width: 1200px`, `min-width` grandes) | `max-width: 100%`, unidades relativas, `min-width: 0` en hijos de flex/grid |
| Filas flex que no envuelven | `flex-wrap: wrap` |
| Rejillas con columnas fijas | `grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` |
| Imágenes, vídeos, iframes | `max-width: 100%; height: auto;` |
| Palabras o URLs largas | `overflow-wrap: anywhere` |
| Tablas | contenedor con `overflow-x: auto` (ver [tablas.md](tablas.md)) |
| Elementos posicionados fuera (`left: 100vw`, menús ocultos con `transform`) | `overflow-x: clip` en el contenedor y ocultar con `hidden`/`display:none` cuando están cerrados |

Para localizar al culpable en DevTools a 320 px:

```js
[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
```

No lo «arregles» con `overflow-x: hidden` en `body`: oculta contenido en lugar de reorganizarlo.

## Espaciado del texto (1.4.12)

Evita alturas fijas en contenedores de texto (`height: 40px` en botones con texto, tarjetas de altura fija con `overflow: hidden`): usa `min-height` y `padding`. Prueba con el bookmarklet de [revision-manual.md](../revision-manual.md#5-espaciado-del-texto-1412).

## Orientación (1.3.4)

No bloquees la orientación con CSS (`@media (orientation: portrait) { body { transform: rotate(90deg) } }`) ni con la API de orientación, salvo que sea esencial.

## Instrucciones sensoriales (1.3.3)

«Pulsa el botón verde de la derecha» → «Pulsa **Continuar**».

## Ayuda coherente (3.2.6)

Si hay contacto, chat, teléfono o FAQ en varias páginas, mantenlos en el mismo orden relativo (p. ej. siempre en el pie, en el mismo orden).

## Refresco y redirecciones

Nada de `<meta http-equiv="refresh" content="5">` ni redirecciones temporizadas en cliente (2.2.1).

## Notas por stack

- **Next.js (App Router)**: `lang` en `<html lang="es">` de `app/layout.tsx`; título con `export const metadata = { title: { template: '%s – Mi Tienda', default: 'Mi Tienda' } }`; enlace de salto y `<main id="contenido">` en el layout raíz.
- **Nuxt**: `app.head.htmlAttrs.lang` en `nuxt.config`, `useHead({ title })` por página.
- **WordPress**: `language_attributes()` en `<html>`; `add_theme_support( 'title-tag' )`; enlace de salto tras `wp_body_open()`; regiones en `header.php`/`footer.php`.
- **Shopify**: `<html lang="{{ request.locale.iso_code }}">` en `layout/theme.liquid` (Dawn ya lo trae), enlace de salto `skip-to-content-link` en el mismo fichero; título en `<title>{{ page_title }}…</title>`.

## Verificar

1. `auditar.mjs` sin reglas de esta lista y sin `reflow-320`.
2. Lista de encabezados y regiones con el lector: estructura lógica.
3. Primer `Tab`: «Saltar al contenido», y funciona.
4. A 320 px y con zoom 200 % no hay scroll horizontal ni contenido cortado.
