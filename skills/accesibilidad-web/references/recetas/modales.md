# Modales, diálogos y banners de cookies

**Criterios**: 2.1.1 Teclado, 2.1.2 Sin trampas, 2.4.3 Orden del foco, 2.4.11 Foco no oculto (2.2), 4.1.2 Nombre, función, valor, 1.4.10 Reajuste (el modal debe caber a 320 px). Reglas axe: `aria-dialog-name`, `aria-hidden-focus`, `aria-hidden-body`.

## Requisitos de un diálogo modal

1. Al abrirse, el foco **entra** (en el primer elemento útil o en el título).
2. Mientras está abierto, `Tab` **no sale** a la página de detrás, y lo de detrás no se lee.
3. `Esc` lo cierra (salvo que cerrar sin elegir no tenga sentido).
4. Al cerrarse, el foco **vuelve** al control que lo abrió.
5. Tiene **nombre** (su título) y un botón de cerrar con nombre.
6. Cabe y se puede desplazar a 320 px de ancho y con zoom.

## Solución recomendada: `<dialog>` nativo

```html
<button type="button" id="btn-talla">Guía de tallas</button>

<dialog id="dlg-talla" aria-labelledby="dlg-talla-titulo">
  <div class="dialogo-cabecera">
    <h2 id="dlg-talla-titulo">Guía de tallas</h2>
    <button type="button" class="cerrar" aria-label="Cerrar">
      <span aria-hidden="true">✕</span>
    </button>
  </div>
  <div class="dialogo-cuerpo">…</div>
</dialog>

<script>
  const btn = document.getElementById('btn-talla');
  const dlg = document.getElementById('dlg-talla');
  btn.addEventListener('click', () => dlg.showModal());
  dlg.querySelector('.cerrar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => btn.focus());
  // Cerrar al pulsar el fondo (opcional)
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
</script>

<style>
  dialog { max-width: min(40rem, 100vw - 2rem); max-height: calc(100dvh - 2rem); overflow: auto; }
  dialog::backdrop { background: rgb(0 0 0 / 0.5); }
</style>
```

`showModal()` hace inerte el resto del documento, gestiona `Esc` y coloca el foco. Para elegir dónde cae el foco inicial, pon `autofocus` en ese elemento dentro del diálogo.

## Si no puedes usar `<dialog>`

```html
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" hidden>
  <h2 id="modal-titulo" tabindex="-1">Guía de tallas</h2>
  …
</div>
```

- Al abrir: `hidden = false`, pon `inert` en los hermanos del modal (`document.querySelector('main').inert = true`, cabecera y pie también), mueve el foco al título.
- Al cerrar: quita `inert`, oculta y devuelve el foco.
- Gestiona `Esc`.

`inert` está soportado en todos los navegadores actuales y es más fiable que atrapar el foco a mano o `aria-hidden` en el resto.

## Un diálogo que se abre solo

Si el diálogo aparece sin que nadie pulse nada (aviso de temporada, boletín, cookies al cargar), no hay control que lo abriera y `close` dejaría el foco en `<body>`: quien usa teclado vuelve al principio del documento. Decide a dónde va el foco **antes** de abrirlo:

```js
const previo = document.activeElement;            // puede ser <body> si nadie ha enfocado nada
dlg.addEventListener('close', () => {
  const destino = previo && previo !== document.body && previo.isConnected
    ? previo
    : document.querySelector('main');             // <main tabindex="-1"> o el h1 con tabindex="-1"
  destino.focus({ preventScroll: true });
}, { once: true });
dlg.showModal();
```

`<main tabindex="-1">` deja el foco al comienzo del contenido sin añadirlo a la tabulación. Mejor aún, no lo abras solo: un aviso que roba el foco al cargar rompe la lectura de quien llega con lector de pantalla. `auditar.mjs` cierra con Esc un diálogo abierto al cargar antes de recorrer la página y lo anota en el informe.

## Anti-patrones

- `aria-hidden="true"` en un contenedor que tiene elementos enfocables (`aria-hidden-focus`).
- Modales que se abren solos al cargar (newsletter, descuentos) y roban el foco o tapan contenido sin forma clara de cerrarlos.
- Botón de cerrar solo con «×» sin nombre.
- Cerrar solo con un clic fuera (no hay equivalente de teclado).

## Banners de cookies

Son diálogos (modales o no) y deben cumplir lo mismo; además, suelen ser lo **primero** que encuentra el usuario:

- Accesibles con teclado; botones «Aceptar», «Rechazar» y «Configurar» con texto (no solo iconos) y con contraste suficiente.
- Si es modal (bloquea la página hasta decidir), el foco debe entrar en él; si no es modal, debe estar al **principio** del orden de tabulación o ser fácil de alcanzar, y **no tapar** el elemento enfocado (2.4.11): reserva espacio con `scroll-padding-bottom` o un `padding-bottom` en `body` mientras esté visible.
- A 320 px y con zoom 200 %, el banner no debe ocupar toda la pantalla sin desplazamiento.
- Si lo da un proveedor (CMP), revisa su configuración de accesibilidad; si no cumple, documéntalo y valora cambiar de proveedor.

## Notas por stack

- **React**: Radix UI Dialog, React Aria `Modal`/`Dialog`, Headless UI `Dialog` implementan el patrón; el `<dialog>` nativo también funciona (con `ref.current.showModal()` en un efecto).
- **Vue**: `<dialog>` nativo con `ref`, o Headless UI/Reka UI. Con `<Teleport to="body">` recuerda devolver el foco al cerrar.
- **WordPress**: plugins de popup (Popup Maker y similares): comprueba que gestionan foco y `Esc` y tienen ajustes de accesibilidad.
- **Shopify**: Dawn y derivados usan un elemento propio `modal-dialog` con gestión de foco; las apps de popup no siempre: revisa cada una.

## Verificar

1. Abre con teclado: el foco entra; `Tab` repetido no sale; `Esc` cierra; el foco vuelve al botón.
2. Con lector: anuncia «diálogo» y el título.
3. A 390 y 320 px cabe y se cierra.
