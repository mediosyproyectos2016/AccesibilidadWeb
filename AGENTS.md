# Instrucciones para agentes de código

Este repositorio contiene **AccesibilidadWeb**, una skill para llevar una web de la auditoría al código arreglado según la normativa de accesibilidad española y europea (Ley 11/2023 – Acta Europea de Accesibilidad, RD 1112/2018, EN 301 549, WCAG 2.2 AA).

## Si te piden auditar o mejorar la accesibilidad de una web

La fuente única de instrucciones es **[skills/accesibilidad-web/SKILL.md](skills/accesibilidad-web/SKILL.md)**. Léelo y sigue su flujo:

1. Stack → `references/deteccion-stack.md`, `references/frameworks/`
2. Auditar → `scripts/auditar.mjs` (antes: `npm install --omit=dev` y `npx playwright install chromium` en esa carpeta)
3. Priorizar → `scripts/priorizar.mjs` (plan con recetas y fichero probable)
4. Arreglar en el código → `scripts/arreglar.mjs` (diff revisable), `references/flujo-arreglo.md`, `references/recetas/`
5. Reauditar en bucle → `scripts/comparar.mjs` (antes/después y criterio de parada)
6. Revisión manual → `scripts/revision.mjs`, `references/revision-manual.md`
7. Declaración y canal → `scripts/declaracion.mjs`, `plantillas/`
8. CI → `auditar.mjs --linea-base`
9. Si lo piden, panel de preferencias → `panel/`: comodidad adicional, nunca en lugar de arreglar
10. Informe final citando criterios WCAG y cláusulas EN 301 549

Carga cada referencia solo cuando llegues a ese paso. No prometas una web «100 % accesible»: la auditoría automática detecta solo una parte de los fallos. Un panel u overlay no hace conforme una web. No ocultes problemas a la herramienta. No inventes textos alternativos ni resultados de pruebas. No generes una declaración que afirme conformidad no verificada. La skill no sustituye una auditoría manual ni asesoramiento jurídico.

## Si trabajas en este repositorio (contribuir)

- Idioma principal: español (README también en inglés).
- Scripts en `skills/accesibilidad-web/scripts/` (Node ≥ 20, ESM, sin dependencias de ejecución fuera de Playwright y axe-core). Tests: `npm test` en esa carpeta.
- El panel (`panel/`) no puede tener dependencias, peticiones de red ni rastreo, y debe pasar la auditoría.
- Una regla nueva de axe o comprobación propia → añade su arreglo en `scripts/lib/wcag.mjs` (`ARREGLOS`) y, si hace falta, una receta en `references/recetas/`.
- Un arreglo automático nuevo solo si es correcto sea cual sea el contenido, con test, en `scripts/lib/arreglos.mjs`.
- Mantén `AGENTS.md`, `GEMINI.md`, `.cursor/rules/` y `.github/copilot-instructions.md` breves: apuntan a la skill, no duplican su contenido.
- Lee [CONTRIBUTING.md](CONTRIBUTING.md).
