# Ejemplos

## `shop-myp/`

Informe real generado el 30-10-2026 con `auditar.mjs` sobre cinco páginas de [shop.myp.com.es](https://shop.myp.com.es) (la tienda de Medios y Proyectos, titular de este repositorio): portada, cupones, ofertas, una ficha de producto y «Cómo calculamos».

```bash
node skills/accesibilidad-web/scripts/auditar.mjs \
  --urls ejemplos/urls-shop-myp.txt \
  --salida ejemplos/shop-myp \
  --recetas ../../skills/accesibilidad-web
```

Resultado: 0 problemas automáticos en los 20 contextos (5 páginas × 1280/390 px × claro/oscuro), recorrido de teclado sin incidencias y 16 elementos que axe marca como «necesita revisión» (contraste sobre fondos complejos y una etiqueta cuyo nombre accesible no coincide con el texto visible). Con `--buenas-practicas` aparecen 7 avisos de buenas prácticas (contenido fuera de regiones, regiones repetidas sin nombre y orden de encabezados).

Que la herramienta automática no encuentre fallos **no** significa que la web cumpla: falta la revisión manual (`skills/accesibilidad-web/references/revision-manual.md`).

Se publica un informe de una web propia para no exponer a terceros. Se generó con la versión 0.1.0: la 0.2.0 añade comprobaciones (movimiento, diálogos, zoom, espaciado, texto sobre imagen) y puede dar otros resultados.
