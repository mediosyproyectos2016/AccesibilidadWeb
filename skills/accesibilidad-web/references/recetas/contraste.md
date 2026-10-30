# Contraste y color

**Criterios**: 1.4.3 Contraste (mínimo) (EN 9.1.4.3), 1.4.11 Contraste no textual (EN 9.1.4.11), 1.4.1 Uso del color (EN 9.1.4.1). Reglas axe: `color-contrast`, `link-in-text-block` (`color-contrast-enhanced` es AAA, no obligatorio).

## Ratios mínimas (AA)

| Elemento | Ratio |
|---|---|
| Texto normal | **4,5:1** |
| Texto grande: ≥ 24 px (18 pt), o ≥ 18,66 px (14 pt) en negrita | **3:1** |
| Componentes de interfaz (bordes de campos, botones sin texto, casillas, interruptores), estados (seleccionado, foco) e iconos/gráficos necesarios | **3:1** con lo adyacente |
| Logotipos, texto decorativo, controles deshabilitados | Exentos |

La ratio se calcula con la luminancia relativa: `(L1 + 0,05) / (L2 + 0,05)`, con L1 la más clara. No redondees hacia arriba: 4,47:1 **no** cumple 4,5:1.

## Herramientas

- Inspector del navegador (Chrome/Edge/Firefox): al inspeccionar un texto muestra la ratio y propone colores.
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) (escritorio, cuentagotas sobre imágenes y degradados).
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- `auditar.mjs` (axe) detecta texto sobre fondos planos; marca como «necesita revisión» el texto sobre imágenes, degradados o con transparencias.

## Arreglo recomendado: tokens

Corrige en las variables de diseño, no elemento a elemento:

```css
:root {
  --texto: #1f2328;          /* 15,8:1 sobre blanco */
  --texto-secundario: #57606a; /* 6,4:1 sobre blanco */
  --enlace: #0b57d0;          /* ≈ 6,4:1 sobre blanco */
  --borde-campo: #8c959f;     /* ≈ 3,0:1 sobre blanco: en el límite; usa uno más oscuro si dudas */
  --foco: #0b57d0;
  --fondo: #ffffff;
}
```

Las ratios de los comentarios son orientativas: **verifícalas siempre** con una herramienta tras cualquier cambio de color.

Fallos típicos y arreglo:

| Fallo | Arreglo |
|---|---|
| Gris claro para textos secundarios (`#999` sobre blanco ≈ 2,8:1) | Oscurecer hasta ≥ 4,5:1 (p. ej. `#595959` ≈ 7:1) |
| Texto blanco sobre color de marca claro (naranja, amarillo, verde) | Texto oscuro sobre ese color, u oscurecer el color de fondo de los botones |
| `placeholder` muy claro que contiene información | Subir contraste o pasar la información a la etiqueta/ayuda |
| Precio tachado o «oferta» en rojo claro | Rojo más oscuro (`#b3261e` ≈ 6,5:1 sobre blanco) |
| Texto sobre foto | Capa oscura semitransparente detrás del texto, o caja de fondo sólido |
| Bordes de campos casi invisibles | Borde ≥ 3:1 con el fondo |
| Indicador de foco del mismo color que el fondo | Contorno de 2–3 px con 3:1 respecto a ambos colores adyacentes (o doble contorno claro/oscuro) |

Texto sobre imagen:

```css
.hero { position: relative; }
.hero__texto {
  background: rgb(0 0 0 / 0.65);
  color: #fff;
  padding: 1rem;
}
```

## Modo oscuro

Si la web cambia con `prefers-color-scheme: dark` o con un conmutador, **audita los dos modos** (`auditar.mjs` lo hace si detecta que el modo oscuro cambia la página). Errores típicos: textos que heredan colores fijos de la versión clara, iconos SVG con `fill` negro, sombras usadas como único borde.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --texto: #e6edf3;
    --texto-secundario: #9da7b3;
    --enlace: #79b8ff;
    --fondo: #0d1117;
  }
}
```

## Uso del color (1.4.1)

El color no puede ser el **único** medio de transmitir información:

- Errores: texto + icono, no solo borde rojo.
- Enlaces en párrafos: subrayado.
- Gráficos: etiquetas directas, patrones o formas además de colores.
- Disponibilidad («en stock» verde / «agotado» rojo): con texto.

## Notas por stack

- **Tailwind**: ajusta la paleta en `tailwind.config` o en `@theme` (v4); evita `text-gray-400` sobre blanco para texto (≈ 2,5–3:1 según versión); usa como mínimo `text-gray-600`. Comprueba siempre con la herramienta.
- **WordPress (bloques)**: define la paleta en `theme.json` (`settings.color.palette`) solo con combinaciones válidas; desactiva colores personalizados (`"custom": false`) para que los editores no elijan combinaciones sin contraste. El editor avisa de contraste bajo en algunos bloques.
- **Shopify**: los esquemas de color del tema (Dawn y derivados: «Esquemas de color» en el editor) se aplican a secciones enteras; corrige el esquema, no cada sección.

## Verificar

1. `auditar.mjs` sin `color-contrast` en claro y oscuro.
2. Revisión manual de texto sobre imágenes, estados (hover, foco, seleccionado) e iconos sin texto.
3. Escala de grises: la información sigue distinguiéndose.
