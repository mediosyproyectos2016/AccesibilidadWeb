# AccesibilidadWeb para Gemini CLI

Para auditar y arreglar la accesibilidad de una web (WCAG 2.2 AA, EN 301 549, Ley 11/2023, RD 1112/2018), sigue **@skills/accesibilidad-web/SKILL.md**. Es la fuente única: no dupliques aquí sus pasos.

Resumen, con los scripts de `skills/accesibilidad-web/scripts/`: `aplicabilidad.mjs` para saber si la norma obliga → stack → `auditar.mjs` → `priorizar.mjs` → `arreglar.mjs` y recetas → `comparar.mjs` en bucle → `revision.mjs` con personas → `declaracion.mjs` → `auditar.mjs --linea-base` en la CI. Panel de preferencias en `panel/`, solo como comodidad adicional.

No prometas una web «100 % accesible», no inventes textos alternativos ni resultados y no generes declaraciones que afirmen conformidad no verificada. Si un caso legal no está zanjado, di «dudoso».

Para contribuir a este repositorio, lee `AGENTS.md` y `CONTRIBUTING.md`.
