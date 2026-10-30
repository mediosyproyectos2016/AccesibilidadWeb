# Iconos

**Criterios**: 1.1.1 Contenido no textual, 4.1.2 Nombre, función, valor, 1.4.11 Contraste no textual (3:1), 3.2.4 Identificación coherente, 2.5.8 Tamaño del objetivo. Reglas axe: `svg-img-alt`, `role-img-alt`, `button-name`, `link-name`.

## Decide qué papel cumple

| Caso | Tratamiento |
|---|---|
| **Decorativo** junto a un texto que ya dice lo mismo («🛒 Carrito») | Ocultar: `aria-hidden="true"` (y `focusable="false"` en SVG por compatibilidad) |
| **Único contenido** de un botón o enlace | Ocultar el icono y dar nombre al control (texto oculto o `aria-label`) |
| **Informativo** suelto (icono de «agotado», «envío gratis» sin texto) | `role="img"` + nombre, o mejor: añadir texto visible |

## SVG

```html
<!-- Decorativo -->
<button type="button">
  <svg aria-hidden="true" focusable="false" width="20" height="20">…</svg>
  Añadir al carrito
</button>

<!-- Botón solo icono -->
<button type="button" aria-label="Buscar">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>

<!-- Informativo suelto -->
<svg role="img" aria-labelledby="ico-envio-t" width="20" height="20">
  <title id="ico-envio-t">Envío gratis</title>
  …
</svg>
```

Para `<img src="icono.svg">`, aplica las reglas de [imagenes.md](imagenes.md) (`alt=""` o `alt="Envío gratis"`).

## Fuentes de iconos (Font Awesome, icomoon…)

Los glifos se insertan con caracteres del área privada de Unicode que el lector puede leer como símbolos extraños. Ocúltalos siempre:

```html
<!-- Mal -->
<a href="/favoritos"><i class="fa fa-heart"></i></a>

<!-- Bien -->
<a href="/favoritos">
  <i class="fa fa-heart" aria-hidden="true"></i>
  <span class="visualmente-oculto">Favoritos</span>
</a>
```

Emojis como iconos: el lector los lee por su nombre («carrito de la compra»); si duplican el texto, envuélvelos en `<span aria-hidden="true">`.

## Contraste y tamaño

- Los iconos **necesarios para entender o usar** algo (sin texto al lado) deben contrastar al menos **3:1** con el fondo (1.4.11).
- Los iconos táctiles: área de 24×24 px mínimo (2.5.8; ver [botones.md](botones.md)).

## Coherencia (3.2.4)

El mismo icono significa lo mismo y se llama igual en todo el sitio: si el corazón es «Favoritos» en la cabecera, no lo llames «Guardar» en la ficha.

## Notas por stack

**React**: muchos paquetes de iconos (lucide-react, heroicons, react-icons) aceptan props; pasa `aria-hidden="true"` y `focusable="false"` por defecto en un componente envoltorio:

```jsx
export function Icono({ como: Comp, etiqueta, ...props }) {
  return etiqueta
    ? <Comp role="img" aria-label={etiqueta} {...props} />
    : <Comp aria-hidden="true" focusable="false" {...props} />;
}
```

**Vue**: lo mismo con un componente `<Icono :etiqueta="…">`.

**WordPress / Shopify**: los iconos del tema suelen estar en `snippets/icon-*.liquid` o `template-parts/`; añade `aria-hidden="true" focusable="false"` en el `<svg>` del snippet y da nombre al botón que lo contiene.

## Verificar

1. `auditar.mjs` sin `svg-img-alt`, `button-name`, `link-name`.
2. Con lector: los iconos decorativos no se anuncian; los botones de icono anuncian su función.
