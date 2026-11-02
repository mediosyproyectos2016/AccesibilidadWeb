# Teclado y foco

**Criterios**: 2.1.1 Teclado (EN 9.2.1.1), 2.1.2 Sin trampas (EN 9.2.1.2), 2.1.4 Atajos de un carácter (EN 9.2.1.4), 2.4.3 Orden del foco (EN 9.2.4.3), 2.4.7 Foco visible (EN 9.2.4.7), 2.4.11 Foco no oculto (WCAG 2.2), 3.2.1 Al recibir el foco (EN 9.3.2.1), 1.4.11 Contraste no textual (indicador). Reglas axe: `tabindex`, `scrollable-region-focusable`, `accesskeys`, `focus-order-semantics`, `aria-hidden-focus`. Comprobaciones propias de `auditar.mjs`: `foco-no-visible`, `foco-oculto`, `trampa-foco`.

## Foco visible (2.4.7)

```css
/* Indicador claro solo cuando hace falta (teclado), sin molestar al ratón */
:focus-visible {
  outline: 3px solid var(--foco, #0b57d0);
  outline-offset: 2px;
}

/* Si un componente quita el outline por diseño, sustitúyelo, nunca lo dejes sin nada */
.tarjeta a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px var(--foco, #0b57d0); /* doble anillo: visible sobre claro y oscuro */
}
```

- Busca y elimina `outline: none` / `outline: 0` sin sustituto (`grep -rn "outline: *\(none\|0\)"`).
- Si el anillo se pinta en `::before`/`::after` (botones con pseudo-elemento), `auditar.mjs` lo da por bueno cuando el pseudo-elemento cambia al enfocar y nada lo recorta. Si lo recorta un antepasado con `overflow: hidden` (anillo con `inset` negativo en una tarjeta que recorta), es un fallo real aunque haya CSS de foco: dibuja el anillo hacia dentro (`inset: 0` o `outline-offset` negativo) o quita el recorte.
- El indicador debe contrastar **3:1** con los colores adyacentes (1.4.11). El doble anillo blanco + color funciona sobre cualquier fondo.
- `box-shadow` desaparece en el modo de alto contraste de Windows (*forced colors*); `outline` no. Si usas sombra, añade `outline: 2px solid transparent` (se vuelve visible en ese modo).

## Foco no oculto (2.4.11)

El elemento enfocado no puede quedar **totalmente** tapado por contenido del autor: cabeceras fijas, barras inferiores, banners de cookies, chats.

```css
/* Reserva el espacio de la cabecera fija (ajusta a su altura real) */
html { scroll-padding-top: 5rem; }
/* Si hay barra inferior fija o banner de cookies */
html { scroll-padding-bottom: 6rem; }
```

## Orden del foco (2.4.3) y secuencia (1.3.2)

- El orden de tabulación sigue el **DOM**: ordena el HTML en el orden de lectura; no reordenes visualmente con `order`, `flex-direction: row-reverse` o `grid-area` de forma que el foco salte.
- `tabindex`: solo `0` (hacer enfocable un elemento personalizado con rol) o `-1` (enfocable por script: títulos de diálogos, `<main>` como destino de salto). **Nunca positivo.**
- Contenido oculto (menús cerrados, diapositivas, pestañas inactivas, paneles fuera de pantalla) no debe ser enfocable: `hidden`, `display:none` o `inert`.
- Al abrir un diálogo o un panel, mueve el foco dentro; al cerrarlo, devuélvelo al control que lo abrió.
- Tras acciones que eliminan el elemento enfocado (borrar un producto del carrito), mueve el foco a un sitio lógico (siguiente producto o encabezado del carrito).

## Todo con teclado (2.1.1)

- Usa elementos nativos (`<a href>`, `<button>`, `<input>`, `<select>`, `<details>`): ya responden al teclado.
- Si un elemento personalizado es interactivo: `tabindex="0"`, rol adecuado y manejo de `Intro`/`Espacio` (y flechas según el patrón de [patrones-aria.md](../patrones-aria.md)).
- Funcionalidad solo con hover (vista previa, menú) → también con foco y botón.
- Zonas con scroll propio (listas, tablas) deben poder desplazarse con teclado: que contengan enfocables o `tabindex="0"` con nombre.
- Arrastrar y soltar → alternativa con botones (2.5.7).

## Sin trampas (2.1.2)

- Desde cualquier componente se sale con `Tab`/`Mayús+Tab` o, si el componente lo exige, con `Esc` y se informa de cómo.
- Cuidado con: reproductores incrustados, editores de texto enriquecido (que capturan `Tab`), mapas, iframes de pago, modales caseros que atrapan el foco y no se cierran.

## Al recibir el foco (3.2.1)

Enfocar no debe abrir ventanas, enviar formularios, cambiar de página ni mover el foco a otro sitio. Los menús que se abren al recibir foco son aceptables si no cambian de contexto, aunque es mejor abrirlos con el botón.

## Atajos de una sola tecla (2.1.4)

Si la web usa atajos de un carácter (p. ej. `/` para buscar, `j`/`k` para navegar), debe permitirse desactivarlos o reasignarlos, o que solo actúen cuando el componente tiene el foco. No interceptes teclas sin modificador a nivel de `document` mientras el usuario escribe en un campo:

```js
document.addEventListener('keydown', (e) => {
  const enCampo = e.target.closest('input, textarea, select, [contenteditable]');
  if (enCampo || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === '/' && ajustes.atajosActivos) { e.preventDefault(); buscador.focus(); }
});
```

## Notas por stack

- **React / Vue**: tras cambios de ruta en cliente, mueve el foco al `h1` o a `<main>` (o usa el anunciador de rutas del framework y verifícalo). Los componentes de librerías (Radix, React Aria, Headless UI, Reka UI) gestionan el foco; los hechos a mano, no.
- **Tailwind**: `focus:outline-none` es habitual en plantillas; sustitúyelo por `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700` o un anillo `focus-visible:ring-*`.
- **WordPress**: muchos temas eliminan el outline en `style.css`; corrígelo en el tema hijo. Los temas de bloques permiten estilos de foco en `theme.json` (`styles.elements.link[":focus"]`, según la versión).
- **Shopify**: Dawn y derivados definen `:focus-visible` con variables del tema; si el esquema de color lo vuelve invisible, ajusta el esquema.

## Verificar

1. Sección «Teclado» del informe de `auditar.mjs`: sin `foco-no-visible`, `foco-oculto` ni `trampa-foco`.
2. Recorrido manual completo con teclado (ver [revision-manual.md](../revision-manual.md#1-teclado-y-foco-211-212-243-247-2411-321)).
3. Con cabecera fija y banner de cookies visibles, el foco nunca queda tapado.
