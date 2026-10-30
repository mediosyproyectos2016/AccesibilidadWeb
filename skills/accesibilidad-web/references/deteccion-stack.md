# Detectar el stack y dónde arreglar

Antes de tocar nada, averigua con qué está hecha la web: el mismo fallo se arregla en sitios distintos según el stack. Arreglar el HTML generado (lo que ves en el navegador) no sirve si se regenera en el siguiente despliegue.

## 1. Señales para detectarlo

Busca en este orden en el repositorio (o, si solo tienes la URL, en el HTML servido):

| Stack | Señales en el repositorio | Señales en el HTML servido |
|---|---|---|
| **Next.js** | `package.json` con `next`; `next.config.*`; carpetas `app/` o `pages/` | `<script id="__NEXT_DATA__">`, rutas `/_next/static/` |
| **React (Vite, CRA…)** | `package.json` con `react` y `vite` o `react-scripts`; ficheros `.jsx`/`.tsx` | `<div id="root">` vacío en el HTML inicial |
| **Remix / React Router 7** | `@remix-run/*` o `react-router` con `app/routes/` | `window.__remixContext` |
| **Vue** | `package.json` con `vue`; ficheros `.vue` | `data-v-xxxx` en atributos |
| **Nuxt** | `nuxt` en `package.json`; `nuxt.config.*` | `/_nuxt/`, `window.__NUXT__` |
| **Svelte / SvelteKit** | `svelte`, `@sveltejs/kit`; ficheros `.svelte` | clases `svelte-xxxx` |
| **Astro** | `astro` en `package.json`; ficheros `.astro` | `astro-island` |
| **Angular** | `@angular/core`; `angular.json` | atributos `_ngcontent-`, `ng-version` |
| **WordPress** | `wp-content/`, `wp-config.php`, `functions.php`, `style.css` con cabecera `Theme Name:` | `/wp-content/`, `/wp-includes/`, `<meta name="generator" content="WordPress">` |
| **WooCommerce** | plugin `woocommerce` en `wp-content/plugins/` | clases `woocommerce`, `wc-block-` |
| **Shopify** | ficheros `*.liquid`; `config/settings_schema.json`; carpetas `sections/`, `snippets/`, `templates/` | `cdn.shopify.com`, `Shopify.theme` |
| **PrestaShop** | `themes/<tema>/templates/*.tpl`; `modules/` | `prestashop` en variables JS |
| **Drupal** | `*.info.yml`, plantillas `*.html.twig`, `core/` | `data-drupal-*`, `/sites/default/files/` |
| **Django / Flask (Jinja)** | `manage.py`, `templates/*.html` con `{% block %}` | — |
| **Symfony (Twig)** | `templates/*.html.twig`, `composer.json` con `symfony/*` | — |
| **Laravel (Blade)** | `resources/views/*.blade.php`, `artisan` | — |
| **Rails (ERB)** | `app/views/**/*.html.erb`, `Gemfile` con `rails` | `csrf-token`, `data-turbo` |
| **HTML estático / generador** | `*.html` sueltos; o Hugo (`config.toml`, `layouts/`), Jekyll (`_config.yml`, `_layouts/`), Eleventy (`.eleventy.js`) | — |

Si conviven varios (p. ej. WordPress «headless» con un frontal Next.js), lo que ve el usuario se arregla en el **frontal**; el contenido (textos `alt`, títulos) puede estar en el **CMS**.

## 2. Dónde se arregla cada tipo de fallo

| Tipo de fallo | Dónde suele estar |
|---|---|
| Plantilla común: `lang`, `<title>`, enlace «Saltar al contenido», regiones, viewport | Layout raíz: `app/layout.tsx` (Next App Router), `pages/_document.tsx` (Pages Router), `index.html` (Vite), `app.vue`/`nuxt.config` (`app.head`), `header.php` (WP), `layout/theme.liquid` (Shopify), plantilla base (`base.html`, `layouts/app.blade.php`, `application.html.erb`) |
| Componentes repetidos (botones de icono, tarjetas, menú, carrusel, modal) | El componente compartido (`components/…`), el *snippet* o la *section* de Shopify, la *template part* del tema de WP. Arregla una vez, se corrige en todas las páginas. |
| Colores y foco | Tokens o variables CSS (`:root { --color-… }`), `tailwind.config`, `theme.json` (WP de bloques), ajustes del tema de Shopify (`settings_schema.json` / `settings_data.json`) |
| Textos alternativos y contenido | En el CMS (biblioteca de medios de WP, ficha de producto de Shopify) o en los datos; el código solo debe **pasar** el `alt`, no inventarlo. |
| Formularios | Componente de formulario, plugin de formularios de WP (Contact Form 7, Gravity Forms…) o la plantilla `customers/*.liquid` de Shopify |
| Código de terceros (chat, cookies, pagos, reseñas) | Configuración del proveedor; si no es accesible y no se puede corregir, documéntalo en la declaración como contenido de terceros y busca alternativa. |

## 3. Notas por stack

### React / Next.js

- Activa `eslint-plugin-jsx-a11y` (Next lo incluye parcialmente en `eslint-config-next`): detecta `alt` ausente, `onClick` en `div`, etc. mientras se escribe.
- `next/image` exige `alt`; pasa `alt=""` explícito para decorativas.
- `next/link` renderiza un `<a>` real: no anides otro `<a>` ni un `<button>` dentro.
- En cambios de ruta en cliente, el foco y el anuncio de la nueva página no son automáticos en todas las versiones: mueve el foco al `h1` o a `<main>` y verifica que el lector anuncia el cambio. Next.js App Router incluye un anunciador de rutas; compruébalo con lector de pantalla.
- Usa `useId()` para relacionar `label`/`aria-describedby` sin `id` duplicados.
- Para tests: `@axe-core/react` en desarrollo o `jest-axe`/`vitest-axe` en tests de componentes.

### Vue / Nuxt

- `eslint-plugin-vuejs-accessibility` para el editor.
- En Nuxt, `useHead({ htmlAttrs: { lang: 'es' }, title })` o `app.head` en `nuxt.config`.
- Nuxt ofrece anunciador de rutas (`<NuxtRouteAnnouncer>`) en versiones recientes; compruébalo.
- Cuidado con `v-html`: el contenido insertado también debe ser accesible.

### WordPress

- **No edites el tema padre**: se pierde en la siguiente actualización. Crea un **tema hijo** (`style.css` con `Template: <padre>`) o usa un plugin propio pequeño (`mu-plugins/`) para filtros PHP y CSS.
- `lang` sale de `language_attributes()` en `header.php` y del idioma del sitio (Ajustes › Generales).
- El enlace para saltar: muchos temas lo traen (`skip-link`); si no, añádelo tras `wp_body_open()`.
- En temas de bloques, colores y tipografías se ajustan en `theme.json` y el editor de sitio; añade estilos `:focus-visible` globales.
- Textos alternativos: campo «Texto alternativo» de la biblioteca de medios; `wp_get_attachment_image()` lo usa automáticamente.
- Plugins útiles (que **corrigen** código): comprobadores como *Accessibility Checker* o *Editoria11y* para editores. **Evita plugins tipo overlay** (barras de accesibilidad que «arreglan» con JavaScript): ver [anti-patrones.md](anti-patrones.md#overlays).

### Shopify

- Edita el tema desde una **copia** (Tienda online › Temas › Duplicar) o con Shopify CLI (`shopify theme dev`), nunca directamente el tema publicado.
- Cambios de estructura en `layout/theme.liquid`; componentes en `sections/` y `snippets/`; textos de la interfaz en `locales/es.json` (útil para nombres accesibles traducibles: `{{ 'accessibility.close' | t }}`).
- Imágenes: `{{ image | image_url: width: 800 | image_tag: alt: image.alt }}`; el `alt` se rellena en la ficha del producto o en «Archivos».
- Apps de terceros (reseñas, chat, cookies) inyectan su propio código: revisa su accesibilidad y su configuración.
- Los temas oficiales recientes (p. ej. Dawn y derivados) parten de una base razonable; personalizaciones y apps suelen ser el origen de los fallos.

### PrestaShop, Drupal, Twig, Blade, Jinja, ERB

- Arregla en la plantilla del **tema hijo** o del tema propio (`.tpl`, `.html.twig`, `.blade.php`, `.html.erb`), nunca en el núcleo ni en el *vendor*.
- Usa *includes*/*partials* para componentes repetidos y arréglalos ahí.
- Escapa siempre los textos que van a atributos (`alt`, `aria-label`) con el filtro del motor (`|e('html_attr')` en Twig, `{{ }}` en Blade/Jinja).

### HTML estático

- Arregla los ficheros directamente; si hay muchas páginas con la misma cabecera, extrae una plantilla o *include* (o usa un generador estático) para no repetir el arreglo.

## 4. Antes de cambiar código

1. Localiza el **origen** del elemento señalado por el selector del informe (busca clases o textos en el repo).
2. Comprueba si es un **componente compartido**: el arreglo afecta a todas sus instancias (bien) y puede romper estilos (revisa).
3. Si el fallo está en código de **terceros** que no controlas, no lo parchees con JavaScript posterior: documéntalo y propón alternativa.
