# HTML y plantillas de servidor

Vale para HTML estático, generadores (Hugo, Jekyll, Eleventy), plantillas de servidor (Twig, Blade, Jinja, ERB, Smarty) y, como referencia de la salida correcta, para cualquier framework. Si el HTML se genera, no edites la salida: arregla la plantilla.

## Plantilla base

Estos fallos se arreglan una vez, en la plantilla común (`base.html`, `layouts/app.blade.php`, `application.html.erb`, `_layouts/default.html`…):

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ofertas – Mi Tienda</title>
</head>
<body>
  <a class="saltar" href="#principal">Saltar al contenido</a>
  <header><nav aria-label="Principal">…</nav></header>
  <main id="principal" tabindex="-1">…</main>
  <footer>
    <a href="/accesibilidad">Accesibilidad</a>
  </footer>
</body>
</html>
```

```css
.saltar { position: absolute; left: -999px; }
.saltar:focus { left: 8px; top: 8px; padding: 8px; background: #fff; color: #1a1a1a; z-index: 1000; }
:focus-visible { outline: 3px solid #1a4fd6; outline-offset: 2px; }
html { scroll-padding-top: 5rem; } /* si hay cabecera fija: el foco no queda debajo (2.4.11) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
}
```

Reglas que se resuelven aquí: `html-has-lang`, `document-title`, `meta-viewport`, `bypass`, `sin-enlace-saltar`, `landmark-one-main`, `region`, `foco-no-visible`, `movimiento-reducido-ignorado`.

## Plantillas de servidor

- Escapa los textos que van a atributos: `{{ titulo|e('html_attr') }}` en Twig, `{{ $titulo }}` en Blade, `{{ titulo }}` en Jinja con autoescape.
- El `<title>` debe venir de cada vista (`{% block title %}`, `@yield('title')`, `content_for :title`), no ser fijo en la plantilla base.
- El idioma debe salir de la configuración regional si la web tiene varios idiomas (`<html lang="{{ app.request.locale }}">`).
- Mete los componentes repetidos (tarjeta, paginador, migas) en un *include* o *partial* y arréglalos ahí.

## Formularios de servidor

Cuando el servidor rechaza un envío: repite el título con «Error:», añade un resumen de errores con enlaces a los campos, y en cada campo `aria-invalid="true"` más `aria-describedby` con el mensaje. Ver [recetas/formularios.md](../recetas/formularios.md).

## Comprobar

`node auditar.mjs <url>` y, si hay muchas plantillas, `--sitemap`. En CI: la línea base de `auditar.mjs --linea-base`, y un validador de HTML si lo usas.

## Otros

- **Svelte / SvelteKit:** el compilador ya avisa de muchos fallos (`a11y-*`). `src/app.html` es la plantilla raíz; `<svelte:head>` da el título. Comprueba el foco al navegar.
- **Angular:** `src/index.html`; usa `Title` para el título y `LiveAnnouncer` y `FocusTrap` de `@angular/cdk/a11y`. `@angular-eslint/template` tiene reglas de accesibilidad.
- **PrestaShop y Drupal:** arregla en el tema hijo o propio, nunca en el núcleo.
