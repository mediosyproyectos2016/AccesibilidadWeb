# Imágenes

**Criterios**: 1.1.1 Contenido no textual (EN 9.1.1.1), 1.4.5 Imágenes de texto (EN 9.1.4.5). Reglas axe: `image-alt`, `input-image-alt`, `role-img-alt`, `image-redundant-alt`, `object-alt`, `area-alt`, `server-side-image-map`.

## Problema

Sin texto alternativo, el lector de pantalla lee el nombre del fichero o nada. Con un `alt` malo («imagen», «foto1.jpg»), lee ruido.

## Decide qué tipo de imagen es

| Tipo | `alt` |
|---|---|
| **Informativa** (foto de producto, gráfico, diagrama) | Lo que aporta en ese contexto: `alt="Lavadora Serie 6 de 9 kg, blanca, carga frontal"` |
| **Decorativa** (fondos, adornos, foto ambiental que no añade nada) | `alt=""` (vacío, no ausente) |
| **Funcional** (imagen dentro de un enlace o botón, sin texto) | La acción o destino: `alt="Inicio"`, `alt="Buscar"` |
| **Con texto** (banner con la oferta escrita) | El texto completo de la imagen. Mejor: texto HTML real (1.4.5). |
| **Compleja** (gráfico, infografía, mapa) | `alt` breve + descripción larga en el texto cercano o enlazada |
| **Redundante** (imagen junto a su propio texto en la misma tarjeta) | `alt=""` para no repetirlo |

Pista de la [W3C](https://www.w3.org/WAI/tutorials/images/decision-tree/): «si la imagen desapareciera, ¿qué texto la sustituiría?».

## Incorrecto → correcto

```html
<!-- Mal -->
<img src="lavadora.jpg">
<img src="lavadora.jpg" alt="imagen">
<a href="/"><img src="logo.svg"></a>
<a href="/producto/123">
  <img src="lavadora.jpg" alt="Lavadora Serie 6">
  Lavadora Serie 6
</a>

<!-- Bien -->
<img src="lavadora.jpg" alt="Lavadora Serie 6 de 9 kg, blanca, carga frontal">
<a href="/"><img src="logo.svg" alt="Mi Tienda, inicio"></a>
<a href="/producto/123">
  <img src="lavadora.jpg" alt="">
  Lavadora Serie 6
</a>
<img src="separador-ondas.svg" alt="">
```

Imágenes CSS (`background-image`) no tienen alternativa: no las uses para contenido informativo.

### Gráficos y figuras

```html
<figure>
  <img src="evolucion-precio.png" alt="Evolución del precio: bajó de 499 € a 379 € entre marzo y octubre">
  <figcaption>Precio de la Serie 6 en los últimos 8 meses. <a href="#tabla-precios">Ver datos en tabla</a>.</figcaption>
</figure>
```

### Imágenes en botones de formulario y mapas

```html
<input type="image" src="lupa.png" alt="Buscar">

<img src="plano.png" alt="Plano de la tienda" usemap="#plano">
<map name="plano">
  <area shape="rect" coords="0,0,100,100" href="/seccion/hogar" alt="Hogar">
</map>
```

## Notas por stack

**React / Next.js**

```jsx
import Image from 'next/image';

// alt viene de los datos; decorativa → alt="" explícito
<Image src={p.imagen} alt={p.alt ?? ''} width={400} height={400} />
```

No generes el `alt` a partir del nombre del fichero. Si el dato no tiene `alt`, usa el nombre del producto solo si la imagen no va junto a ese mismo texto.

**Vue**: `<img :src="p.imagen" :alt="p.alt || ''">`.

**WordPress**: rellena «Texto alternativo» en la biblioteca de medios; en plantillas usa `wp_get_attachment_image( $id, 'large' )`, que incluye el `alt`. Para forzar decorativa: `wp_get_attachment_image( $id, 'large', false, [ 'alt' => '' ] )`.

**Shopify (Liquid)**:

```liquid
{{ product.featured_image | image_url: width: 800 | image_tag: alt: product.featured_image.alt | escape }}
{%- comment -%} decorativa {%- endcomment -%}
{{ section.settings.fondo | image_url: width: 1600 | image_tag: alt: '' }}
```

El `alt` de cada imagen se edita en la ficha del producto (clic en la imagen › «Añadir texto alternativo»).

## Verificar

1. `auditar.mjs` sin `image-alt` ni `role-img-alt`.
2. Con el lector de pantalla, recorre las imágenes (NVDA: `G`): cada una dice algo útil o no se anuncia si es decorativa.
3. Revisa a mano la **calidad** del `alt`: ninguna herramienta lo hace.
