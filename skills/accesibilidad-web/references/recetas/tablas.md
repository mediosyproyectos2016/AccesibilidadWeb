# Tablas

**Criterios**: 1.3.1 Información y relaciones (EN 9.1.3.1), 1.3.2 Secuencia significativa, 1.4.10 Reajuste. Reglas axe: `td-headers-attr`, `th-has-data-cells`, `td-has-header`, `scope-attr-valid`, `empty-table-header`, `table-duplicate-name`, `table-fake-caption`.

## Principios

- `<table>` **solo para datos tabulares** (comparativas, especificaciones, precios por tienda). Nunca para maquetar.
- Encabezados con `<th>` y `scope`; título con `<caption>`.
- Si una tabla de maquetación es inevitable (correos HTML), `role="presentation"`.

## Ejemplo

```html
<table>
  <caption>Precio de la Cafetera Express X200 por tienda</caption>
  <thead>
    <tr>
      <th scope="col">Tienda</th>
      <th scope="col">Precio</th>
      <th scope="col">Envío</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Tienda A</th>
      <td>379 €</td>
      <td>Gratis</td>
    </tr>
    <tr>
      <th scope="row">Tienda B</th>
      <td>389 €</td>
      <td>4,95 €</td>
    </tr>
  </tbody>
</table>
```

- Celdas vacías de encabezado: pon texto (puede ser oculto visualmente) en lugar de `<th></th>`.
- Tablas con encabezados en varios niveles: `headers`/`id`, o mejor, simplificarlas o dividirlas.
- Ordenación: botón dentro del `<th>` y `aria-sort="ascending|descending"` en el `<th>` ordenado.

```html
<th scope="col" aria-sort="ascending">
  <button type="button">Precio</button>
</th>
```

## Tablas en móvil (1.4.10)

Las tablas de datos están exentas de reflow si requieren dos dimensiones, pero el resto de la página no debe desplazarse horizontalmente. Envuélvelas en un contenedor desplazable y enfocable:

```html
<div class="tabla-desplazable" role="region" aria-labelledby="cap-precios" tabindex="0">
  <table>
    <caption id="cap-precios">Precio por tienda</caption>
    …
  </table>
</div>
```

```css
.tabla-desplazable { overflow-x: auto; max-width: 100%; }
```

Alternativa: en móvil, mostrar cada fila como una tarjeta con `<dl>`, **sin** cambiar la semántica de la tabla con `display:block` en `table`/`tr`/`td` (en algunos navegadores eso elimina la semántica de tabla; si lo haces, restáurala con `role="table"`, `role="row"`, `role="cell"`).

## Listas de pares clave–valor

Especificaciones de producto suelen ser mejor una lista de definiciones que una tabla de dos columnas:

```html
<dl class="especificaciones">
  <dt>Capacidad</dt><dd>9 kg</dd>
  <dt>Clase energética</dt><dd>A</dd>
</dl>
```

## Notas por stack

- **React/Vue**: en componentes de tabla genéricos (TanStack Table, etc.) asegúrate de renderizar `<th scope>` y `<caption>`; muchos *data grids* complejos (`role="grid"`) tienen su propio patrón ([APG Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)): úsalo solo si de verdad hace falta interacción de celda.
- **WordPress**: el bloque «Tabla» permite fila de encabezado y leyenda (caption): actívalas.
- **Shopify**: tablas en descripciones de producto vienen del editor de texto enriquecido; revisa que la primera fila sean `<th>`.

## Verificar

1. `auditar.mjs` sin reglas de tablas.
2. Con lector, navega por la tabla (NVDA: `T`, luego `Ctrl+Alt+flechas`): al moverte por una celda se anuncian sus encabezados.
3. A 320 px la tabla se desplaza dentro de su contenedor, no la página entera.
