---
description: Arregla la accesibilidad de la web de este proyecto en bucle (auditar, priorizar, arreglar, reauditar) y deja lo que exige criterio humano
argument-hint: "<url local o de pruebas> [más urls]"
---

Usa la skill `accesibilidad-web` para arreglar la accesibilidad en el código de este proyecto: $ARGUMENTS

Lee antes `references/flujo-arreglo.md`. Los scripts están en `${CLAUDE_PLUGIN_ROOT}/skills/accesibilidad-web/scripts` (la primera vez: `npm install --omit=dev --no-audit --no-fund && npx playwright install chromium`).

1. Si no hay URL, detecta o pregunta por un servidor local. No uses producción para reauditar cada cambio.
2. Audita a `a11y/antes` con `auditar.mjs --umbral ninguno`, y genera el plan con `priorizar.mjs a11y/antes/informe.json --proyecto .`.
3. Ejecuta `arreglar.mjs --proyecto .` y enseña el diff. Aplícalo solo con el visto bueno (`--aplicar`). Pregunta el idioma si falta `lang`.
4. Trabaja el plan en orden, por bloques, con una rama y un commit por bloque. Arregla en el componente o la plantilla. Lo que exija criterio humano (textos alternativos, colores de marca, subtítulos): propón y pregunta; no lo inventes.
5. Tras cada bloque, audita a `a11y/despues` con las mismas opciones, ejecuta `comparar.mjs` y sigue el veredicto. Para si no hay progreso.
6. Con cero fallos detectables, crea la revisión manual con `revision.mjs crear`, marca con `--agente` lo que hayas probado de verdad y deja el resto con los pasos concretos.

Entrega antes y después, cambios por criterio, pendientes con responsable y revisión manual pendiente. No digas que la web es accesible ni que cumple: di qué se comprobó. La auditoría automática detecta solo una parte de los fallos.
