# Enlaces

**Criterios**: 2.4.4 Propósito de los enlaces (EN 9.2.4.4), 4.1.2 Nombre, función, valor (EN 9.4.1.2), 1.4.1 Uso del color (EN 9.1.4.1), 3.2.4 Identificación coherente. Reglas axe: `link-name`, `link-in-text-block`, `identical-links-same-purpose`.

## Problema

Enlaces sin nombre (solo un icono), con nombres genéricos («Ver más» ×20), indistinguibles del texto que los rodea o que en realidad son botones.

## ¿Enlace o botón?

- **Enlace** (`<a href>`): lleva a otra URL o a otra parte de la página.
- **Botón** (`<button>`): ejecuta una acción en la página (abrir menú, añadir al carrito, enviar).

Un `<a href="#" onclick>` para abrir un modal es un botón mal hecho: ver [botones.md](botones.md).

## Incorrecto → correcto

```html
<!-- Mal: sin nombre -->
<a href="/carrito"><svg>…</svg></a>

<!-- Bien -->
<a href="/carrito">
  <svg aria-hidden="true" focusable="false">…</svg>
  <span class="visualmente-oculto">Carrito</span>
</a>
<!-- o -->
<a href="/carrito" aria-label="Carrito, 3 productos"><svg aria-hidden="true" focusable="false">…</svg></a>
```

```html
<!-- Mal: genérico -->
<h3>Cafetera Express X200</h3>
<p>…</p>
<a href="/p/x200">Ver más</a>

<!-- Bien: texto completo oculto -->
<a href="/p/x200">Ver más<span class="visualmente-oculto"> sobre la Cafetera Express X200</span></a>

<!-- Mejor aún: toda la tarjeta enlazada desde el título -->
<article class="tarjeta">
  <h3><a href="/p/x200">Cafetera Express X200</a></h3>
  <p>…</p>
</article>
```

Para tarjetas enteras clicables, extiende el área del enlace del título con CSS en vez de envolver toda la tarjeta en `<a>` (que convierte todo su contenido en un nombre larguísimo):

```css
.tarjeta { position: relative; }
.tarjeta h3 a::after { content: ""; position: absolute; inset: 0; }
```

### Enlaces dentro de un párrafo

Deben distinguirse sin depender solo del color (1.4.1): subrayado, o contraste de 3:1 con el texto circundante **más** un indicador al pasar y al enfocar. Lo más sencillo:

```css
p a, li a { text-decoration: underline; text-underline-offset: 0.15em; }
```

### Avisar de cambios de contexto

```html
<a href="/catalogo.pdf">Catálogo 2026 (PDF, 2,3 MB)</a>
<a href="https://ejemplo.org" target="_blank" rel="noopener">
  Bases legales<span class="visualmente-oculto"> (se abre en una ventana nueva)</span>
</a>
```

### Enlace de la página actual

```html
<a href="/ofertas" aria-current="page">Ofertas</a>
```

## Notas por stack

- **Next.js**: `<Link href="/p/x200">` genera el `<a>`; no anides otro `<a>` ni `<button>`.
- **Vue / Nuxt**: `<NuxtLink>`/`<RouterLink>` aplican `aria-current="page"` en el enlace exacto activo (configurable con `ariaCurrentValue`).
- **WordPress**: el enlace «Leer más» del extracto se filtra con `excerpt_more`; incluye `get_the_title()` en un `span` oculto.
- **Shopify**: en las tarjetas de producto (`snippets/card-product.liquid` en Dawn y derivados) asegúrate de que el enlace tiene el título del producto como texto.

## Verificar

1. `auditar.mjs` sin `link-name` ni `link-in-text-block`.
2. Lista de enlaces del lector (NVDA `Insert+F7`, VoiceOver rotor): cada enlace se entiende solo.
3. Visualmente, los enlaces de texto se ven como enlaces sin depender del color.
