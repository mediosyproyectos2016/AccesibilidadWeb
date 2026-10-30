# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones según [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [0.1.0] - 2026-10-30

### Añadido
- Skill `accesibilidad-web` (formato Agent Skills) con flujo en 6 pasos: stack, auditoría automática, revisión manual, arreglos por impacto, declaración e informe.
- Referencias: checklist WCAG 2.2 AA con mapeo a EN 301 549, revisión manual guiada, detección de stack, patrones ARIA, anti-patrones y 13 recetas por componente.
- `auditar.mjs`: axe-core + Playwright a 1280/390 px, modo oscuro automático, recorrido de teclado (foco visible, foco tapado, trampas, enlace «saltar»), reflow a 320 px, rastreo, umbral y códigos de salida para CI, informe JSON y Markdown en español.
- Guía de normativa (Ley 11/2023, RD 1112/2018, EN 301 549 V3.2.1/V4.1.1) y plantilla de declaración de accesibilidad.
- Adaptadores: `AGENTS.md`, `GEMINI.md`, regla de Cursor, instrucciones de Copilot.
- Plugin y marketplace de Claude Code con el comando `/auditar-accesibilidad`.
- GitHub Action reutilizable (`action.yml`) y flujos de ejemplo y de tests.
