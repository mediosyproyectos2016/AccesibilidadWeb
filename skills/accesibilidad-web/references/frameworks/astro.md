# Astro

Astro genera HTML en el servidor y envía poco JavaScript: buena base. Los fallos suelen estar en el layout y en las islas interactivas.

## Plantilla raíz

```astro
---
// src/layouts/Layout.astro
const { titulo } = Astro.props;
---
<!doctype html>
<html lang={Astro.currentLocale ?? 'es'}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{titulo} – Mi Tienda</title>
  </head>
  <body>
    <a class="saltar" href="#principal">Saltar al contenido</a>
    <slot name="cabecera" />
    <main id="principal" tabindex="-1"><slot /></main>
    <slot name="pie" />
  </body>
</html>
```

## Fallos típicos

- **Imágenes:** `<Image src={foto} alt="…" />` de `astro:assets` exige `alt`; usa `alt=""` si es decorativa. En colecciones de contenido, guarda el `alt` en el frontmatter.
- **Markdown:** los encabezados del contenido se suman a los de la plantilla; si el título sale como `<h1>` en el layout, el Markdown debe empezar en `##`.
- **Islas:** una isla `client:*` no es interactiva hasta hidratarse. Lo esencial debe funcionar antes: mejor un `<a href>` real o un formulario que un botón vacío a la espera de JavaScript. Dentro de cada isla, aplica la guía de su framework: [React](react-next.md), [Vue](vue-nuxt.md).
- **Scripts propios:** `<script>` en un componente Astro funciona sin framework; es la forma natural de hacer `<dialog>` o un desplegable.

```astro
<button type="button" aria-expanded="false" aria-controls="menu" data-desplegar>Menú</button>
<ul id="menu" hidden>…</ul>
<script>
  for (const b of document.querySelectorAll('[data-desplegar]')) {
    b.addEventListener('click', () => {
      const abierto = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!abierto));
      document.getElementById(b.getAttribute('aria-controls')).hidden = abierto;
    });
  }
</script>
```

## Transiciones de vista

Con `<ClientRouter />` (antes `<ViewTransitions />`) la navegación se hace en cliente. Astro anuncia el título de la página nueva, pero compruébalo con un lector, y repite la inicialización de tus scripts con el evento `astro:page-load`. Las animaciones de transición deben respetar `prefers-reduced-motion`: compruébalo también con la tuya propia.

## Proteger lo arreglado

La barra de desarrollo de Astro incluye una auditoría básica de accesibilidad. Úsala mientras escribes, con `eslint-plugin-jsx-a11y` si tienes islas de React, y `auditar.mjs --linea-base` en la CI.
