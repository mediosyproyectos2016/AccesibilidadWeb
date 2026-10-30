# Carruseles

**Criterios**: 2.2.2 Poner en pausa, detener, ocultar (EN 9.2.2.2), 2.1.1 Teclado, 2.4.3 Orden del foco, 2.4.7 Foco visible, 2.5.1 Gestos del puntero, 4.1.2 Nombre, función, valor, 1.1.1 (imágenes de cada diapositiva).

## Problema

Carruseles que avanzan solos sin pausa, sin botones accesibles, que solo se mueven deslizando el dedo, o cuyas diapositivas ocultas siguen recibiendo foco.

Antes de arreglarlo, plantéate si hace falta: una rejilla o lista estática suele ser más accesible y más eficaz.

## Requisitos

1. **Sin avance automático**, o con botón **Pausar/Reanudar** visible y accesible (2.2.2); el avance automático se detiene también al recibir foco o hover, y no arranca si el usuario tiene `prefers-reduced-motion: reduce`.
2. Botones **Anterior/Siguiente** reales (`<button>`) con nombre (2.5.1: alternativa a deslizar).
3. Las diapositivas **no visibles** no son enfocables ni se leen (`inert` o `hidden`), salvo que todas estén visibles a la vez (desplazamiento horizontal).
4. Se comunica qué diapositiva se ve («2 de 5»).
5. Imágenes con `alt` adecuado.

## Ejemplo

```html
<section class="carrusel" aria-roledescription="carrusel" aria-label="Ofertas destacadas">
  <div class="carrusel-controles">
    <button type="button" class="pausa" aria-pressed="false">Pausar</button>
    <button type="button" class="anterior" aria-controls="diapos">Anterior</button>
    <button type="button" class="siguiente" aria-controls="diapos">Siguiente</button>
  </div>
  <div id="diapos" aria-live="off">
    <div role="group" aria-roledescription="diapositiva" aria-label="1 de 3">…</div>
    <div role="group" aria-roledescription="diapositiva" aria-label="2 de 3" inert hidden>…</div>
    <div role="group" aria-roledescription="diapositiva" aria-label="3 de 3" inert hidden>…</div>
  </div>
</section>
```

```js
const raiz = document.querySelector('.carrusel');
const diapos = [...raiz.querySelectorAll('[aria-roledescription="diapositiva"]')];
const region = raiz.querySelector('#diapos');
const btnPausa = raiz.querySelector('.pausa');
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let actual = 0, temporizador = null;

function mostrar(i) {
  diapos.forEach((d, n) => { d.hidden = n !== i; d.inert = n !== i; });
  actual = i;
}
function siguiente() { mostrar((actual + 1) % diapos.length); }
function iniciar() {
  if (reducir) return;
  temporizador = setInterval(siguiente, 6000);
  region.setAttribute('aria-live', 'off');      // no anunciar cada cambio automático
  btnPausa.textContent = 'Pausar';
  btnPausa.setAttribute('aria-pressed', 'false');
}
function parar() {
  clearInterval(temporizador); temporizador = null;
  region.setAttribute('aria-live', 'polite');   // anunciar cambios manuales
  btnPausa.textContent = 'Reanudar';
  btnPausa.setAttribute('aria-pressed', 'true');
}

btnPausa.addEventListener('click', () => (temporizador ? parar() : iniciar()));
raiz.querySelector('.siguiente').addEventListener('click', () => { parar(); siguiente(); });
raiz.querySelector('.anterior').addEventListener('click', () => { parar(); mostrar((actual - 1 + diapos.length) % diapos.length); });
raiz.addEventListener('focusin', parar);
iniciar();
```

Notas:

- Este ejemplo cambia el texto del botón de pausa y también `aria-pressed`. Elige **una** de las dos técnicas si tu lector lo anuncia de forma confusa: lo más claro es cambiar solo el texto («Pausar»/«Reanudar») y quitar `aria-pressed`.
- `aria-roledescription` es opcional y debe estar en el idioma de la página. Ref.: [APG Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).

## Carrusel de desplazamiento horizontal (sin JS de diapositivas)

Para listas de productos desplazables (`overflow-x: auto` con `scroll-snap`):

```html
<section aria-labelledby="t-novedades">
  <h2 id="t-novedades">Novedades</h2>
  <ul class="fila-desplazable">
    <li>…tarjeta con enlace…</li>
  </ul>
</section>
```

Todas las tarjetas son alcanzables con `Tab` (el navegador desplaza al foco), así que no hace falta `inert`. Si la fila no contiene elementos enfocables, añade `tabindex="0"` y nombre a la zona desplazable (regla axe `scrollable-region-focusable`). Añade botones Anterior/Siguiente para quien usa ratón sin rueda horizontal (2.5.1).

## Notas por stack

- **Librerías** (Swiper, Splide, Slick, Embla, Keen): activa sus opciones de accesibilidad (Swiper `a11y`, Splide trae ARIA y pausa) y **revísalas igualmente**; Slick tiene problemas conocidos de accesibilidad.
- **WordPress**: los sliders de constructores (Elementor, Slider Revolution) suelen traer autoplay; desactívalo o añade pausa.
- **Shopify**: en Dawn y derivados, la sección «Pase de diapositivas» tiene opción de rotación automática con botón de pausa: revísalo; desactiva la rotación si no hace falta.

## Verificar

1. Con teclado: pausar, anterior, siguiente; el foco no cae en diapositivas ocultas.
2. Con `prefers-reduced-motion: reduce` no avanza solo.
3. Con lector: anuncia el carrusel, los botones y la diapositiva actual al cambiar manualmente.
