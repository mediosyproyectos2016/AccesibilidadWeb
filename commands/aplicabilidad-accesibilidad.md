---
description: Responde si la normativa de accesibilidad obliga a una web, con veredicto, artículos, autoridad y qué texto usar en la declaración
argument-hint: "[qué ofrece la web, a quién, quién es el titular y su tamaño]"
---

Usa la skill `accesibilidad-web`, paso 0, para responder si la normativa de accesibilidad le aplica a esta web: $ARGUMENTS

Los scripts están en `${CLAUDE_PLUGIN_ROOT}/skills/accesibilidad-web/scripts`. No hace falta instalar nada para este script.

1. Lista las preguntas con `node aplicabilidad.mjs --preguntas`. Deduce lo que puedas del proyecto o del sitio y pregunta solo lo que falte y cambie el resultado.
2. Ejecuta `node aplicabilidad.mjs` con las respuestas y `--salida a11y`. Lo que no se sepa, omítelo.
3. Lee `references/aplicabilidad.md` si hace falta razonar más.

Entrega veredicto y certeza primero, con la base, los dos argumentos si es dudoso, obligaciones, autoridad, qué cambia en la declaración y la fecha de revisión. Separa norma, criterio oficial, terceros y razonamiento propio. Si no está zanjado, di «dudoso»: tu mejor respuesta razonada no es una certeza. No es asesoramiento jurídico.
