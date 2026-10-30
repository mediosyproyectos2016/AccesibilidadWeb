# Botones

**Criterios**: 4.1.2 Nombre, función, valor (EN 9.4.1.2), 2.1.1 Teclado (EN 9.2.1.1), 2.5.3 Etiqueta en el nombre (EN 9.2.5.3), 2.5.8 Tamaño del objetivo (WCAG 2.2, sin cláusula EN aún), 2.5.2 Cancelación del puntero (EN 9.2.5.2), 2.5.7 Movimientos de arrastre (WCAG 2.2). Reglas axe: `button-name`, `input-button-name`, `aria-command-name`, `nested-interactive`, `label-content-name-mismatch`, `target-size`, `summary-name`.

## Problema

Botones sin nombre (solo icono), `div` clicables, estados que no se anuncian, nombres que no coinciden con el texto visible y objetivos táctiles diminutos.

## Incorrecto → correcto

```html
<!-- Mal -->
<div class="cerrar" onclick="cerrar()">✕</div>
<button><i class="icon-heart"></i></button>
<a href="#" onclick="abrirFiltros()">Filtros</a>

<!-- Bien -->
<button type="button" class="cerrar" onclick="cerrar()" aria-label="Cerrar">
  <span aria-hidden="true">✕</span>
</button>
<button type="button" aria-pressed="false">
  <svg aria-hidden="true" focusable="false">…</svg>
  <span class="visualmente-oculto">Favorito</span>
</button>
<button type="button" aria-expanded="false" aria-controls="panel-filtros">Filtros</button>
```

- Pon siempre `type="button"` a los botones que no envían un formulario (por defecto dentro de un `<form>` son `submit`).
- Estados: `aria-pressed` (conmutador), `aria-expanded` (abre/cierra algo). No cambies además el texto del botón para expresar el mismo estado.
- Un botón deshabilitado con `disabled` no recibe foco ni se anuncia en la tabulación; si el usuario necesita saber por qué no puede continuar, usa `aria-disabled="true"` y explica el motivo.

## Etiqueta en el nombre (2.5.3)

El nombre accesible debe **contener** el texto visible, idealmente al principio, para que el control por voz funcione («pulsa Comprar»).

```html
<!-- Mal -->
<button aria-label="Añadir al carrito">Comprar</button>

<!-- Bien -->
<button>Comprar<span class="visualmente-oculto"> Cafetera Express X200</span></button>
```

## Tamaño del objetivo (2.5.8)

Mínimo **24×24 px CSS**, o separación suficiente para que un círculo de 24 px centrado en cada objetivo no toque a otro. Excepciones: enlaces dentro de un texto, controles nativos sin estilo, y cuando el tamaño es esencial. Recomendación práctica: 44×44 px en móvil.

```css
.boton-icono {
  min-width: 44px;
  min-height: 44px;
  display: inline-grid;
  place-items: center;
}
/* Ampliar el área sin cambiar el diseño visual */
.boton-icono-pequeno { position: relative; }
.boton-icono-pequeno::before { content: ""; position: absolute; inset: -10px; }
```

## Punteros y arrastre (2.5.2, 2.5.7)

- Dispara acciones en `click` (que se produce al soltar), no en `mousedown`/`pointerdown`/`touchstart`.
- Todo lo que se hace arrastrando necesita alternativa de un solo puntero: un slider de precio con dos campos numéricos o botones +/−; reordenar con botones «Subir/Bajar»; mapas con botones de zoom y desplazamiento.

## Notas por stack

**React**

```jsx
function BotonFavorito({ activo, onToggle, nombre }) {
  return (
    <button type="button" aria-pressed={activo} onClick={onToggle} className="boton-icono">
      <HeartIcon aria-hidden="true" focusable="false" />
      <span className="visualmente-oculto">Favorito: {nombre}</span>
    </button>
  );
}
```

No uses `<div onClick>`; `eslint-plugin-jsx-a11y` (`click-events-have-key-events`, `no-static-element-interactions`) lo señala.

**Vue**: `<button type="button" :aria-pressed="String(activo)" @click="toggle">`.

**WordPress / Shopify**: los textos de los botones de icono, en ficheros de traducción (`__( 'Cerrar', 'mi-tema' )`, `{{ 'general.accessibility.close' | t }}`).

## Verificar

1. `auditar.mjs` sin `button-name`, `nested-interactive`, `target-size`.
2. Tabula hasta cada botón: se enfoca, se ve el foco, `Intro` y `Espacio` lo activan.
3. Con lector: anuncia nombre, «botón» y su estado («pulsado», «contraído»).
4. En móvil (390 px) los botones de icono se pulsan sin fallar.
