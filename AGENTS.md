# Instrucciones para agentes de código

Este repositorio contiene **AccesibilidadWeb**, una skill para auditar y adaptar webs a la normativa de accesibilidad española y europea (Ley 11/2023 – Acta Europea de Accesibilidad, RD 1112/2018, EN 301 549, WCAG 2.2 AA).

## Si te piden auditar o mejorar la accesibilidad de una web

La fuente única de instrucciones es **[skills/accesibilidad-web/SKILL.md](skills/accesibilidad-web/SKILL.md)**. Léelo y sigue su flujo:

1. Detectar el stack → `skills/accesibilidad-web/references/deteccion-stack.md`
2. Auditoría automática → `node skills/accesibilidad-web/scripts/auditar.mjs <url>` (antes: `npm install` y `npx playwright install chromium` en esa carpeta)
3. Revisión manual guiada → `references/revision-manual.md`
4. Arreglos por impacto con recetas → `references/recetas/`, `references/patrones-aria.md`, `references/anti-patrones.md`
5. Declaración de accesibilidad → `docs/declaracion-accesibilidad-plantilla.md` (normativa en `docs/normativa-es.md`)
6. Informe final citando criterios WCAG y cláusulas EN 301 549

Carga cada referencia solo cuando llegues a ese paso. No propongas overlays; no ocultes problemas a la herramienta; la skill no sustituye una auditoría manual ni asesoramiento jurídico.

## Si trabajas en este repositorio (contribuir)

- Idioma principal: español (README también en inglés).
- Scripts en `skills/accesibilidad-web/scripts/` (Node ≥ 18, ESM, sin dependencias fuera de Playwright y axe-core). Tests: `npm test` en esa carpeta.
- Una regla nueva de axe o comprobación propia → añade su arreglo en `scripts/lib/wcag.mjs` (`ARREGLOS`) y, si hace falta, una receta en `references/recetas/`.
- Mantén `AGENTS.md`, `GEMINI.md`, `.cursor/rules/` y `.github/copilot-instructions.md` breves: apuntan a la skill, no duplican su contenido.
- Lee [CONTRIBUTING.md](CONTRIBUTING.md).
