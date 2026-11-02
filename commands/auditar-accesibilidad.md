---
description: Audita la accesibilidad de una web (WCAG 2.2 AA / EN 301 549) y propone arreglos priorizados
argument-hint: "<url> [más urls] | --rastrear N <url>"
---

Usa la skill `accesibilidad-web` para auditar: $ARGUMENTS

1. Si no hay URL, pregunta cuál auditar (o detecta un servidor local del proyecto, p. ej. `http://localhost:3000`).
2. Ejecuta la auditoría automática con el script de la skill:
   `cd "${CLAUDE_PLUGIN_ROOT}/skills/accesibilidad-web/scripts" && npm install --no-audit --no-fund && npx playwright install chromium && node auditar.mjs --umbral ninguno --salida "<carpeta del proyecto>/informe-accesibilidad" $ARGUMENTS`
3. Lee `informe-accesibilidad/informe.md` y resume: problemas por impacto y por criterio, los 5 más importantes y en qué componente compartido se arreglan.
4. Si estás dentro del código de esa web, genera el plan con `node priorizar.mjs "<carpeta del proyecto>/informe-accesibilidad/informe.json" --proyecto "<carpeta del proyecto>"` y ofrece arreglarlo con `/accesibilidad-web:arreglar-accesibilidad`. Si no, entrega el resumen y la lista de revisión manual pendiente.
5. Recuerda que un informe limpio no acredita la conformidad: detecta solo una parte de los fallos.
