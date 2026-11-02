# Shopify

Trabaja sobre una **copia** del tema (Tienda online › Temas › Duplicar) o con Shopify CLI (`shopify theme pull`, `shopify theme dev`). Nunca directamente en el tema publicado. `arreglar.mjs --proyecto <tema>` funciona sobre los `.liquid` y el CSS de la copia local.

## Dónde está cada cosa

| Fallo | Dónde |
|---|---|
| `lang`, título, viewport, enlace de salto | `layout/theme.liquid` |
| Componentes | `sections/` y `snippets/` |
| Textos de interfaz y nombres accesibles | `locales/es.json` |
| Colores | `config/settings_schema.json` y el editor de temas |
| Textos alternativos | Ficha del producto o Contenido › Archivos: es contenido |
| Pago | Lo controla Shopify; solo se personaliza en parte |

```liquid
{%- comment -%} layout/theme.liquid {%- endcomment -%}
<html lang="{{ request.locale.iso_code }}">
  …
  <a class="saltar" href="#MainContent">{{ 'accessibility.skip_to_text' | t }}</a>
  …
  <main id="MainContent" tabindex="-1">{{ content_for_layout }}</main>
```

```liquid
{%- comment -%} Imagen con su texto alternativo; sin él, decorativa {%- endcomment -%}
{{ image | image_url: width: 800 | image_tag: alt: image.alt, loading: 'lazy' }}

{%- comment -%} Botón con el nombre del producto, para que se distinga fuera de contexto {%- endcomment -%}
<button type="submit" name="add">
  {{ 'products.product.add_to_cart' | t }}
  <span class="visually-hidden">: {{ product.title | escape }}</span>
</button>
```

Escapa con `| escape` todo lo que vaya a un atributo.

## Fallos típicos en tiendas

- **Selector de variantes:** usa `<fieldset>` con `<legend>` y radios o un `<select>` con etiqueta, y anuncia el cambio de precio con una región `aria-live`.
- **Carrito lateral:** es un diálogo: debe recibir el foco, retenerlo, cerrarse con `Esc` y devolverlo. Comprobable con `--estados`.
- **Carruseles de portada:** sin avance automático, o con pausa. `auditar.mjs` los detecta si cambian solos.
- **Apps:** reseñas, chat, cookies e inyectan su código. Si una falla, pide el arreglo al proveedor y refléjalo en la declaración. No se tapa con `--excluir`.

## Comprobar

Audita la vista previa del tema copiado. Si Shopify pide contraseña o la vista previa necesita sesión, usa `--sesion`. No rodees ninguna protección: si una página bloquea el acceso, se documenta.

Los temas oficiales recientes parten de una base razonable; las personalizaciones y las apps suelen ser el origen de los fallos.
