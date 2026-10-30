# AccesibilidadWeb

**Una skill abierta para que cualquier IA o agente de código audite y adapte una web a la normativa de accesibilidad española y europea**: Ley 11/2023 (Acta Europea de Accesibilidad), Real Decreto 1112/2018, EN 301 549 y WCAG 2.2 nivel AA.

Funciona con Claude Code, Codex y otros agentes que leen `AGENTS.md`, Cursor, GitHub Copilot y Gemini CLI. Incluye un script de auditoría automática (Playwright + axe-core), una revisión manual guiada, recetas de arreglo por componente y por stack, y la plantilla de declaración de accesibilidad.

[English version](README.en.md)

> **Aviso importante.** Esta herramienta ayuda a encontrar y corregir problemas, pero **no sustituye una auditoría manual experta ni el asesoramiento jurídico**. Las pruebas automáticas detectan solo una parte de los problemas. Los widgets «overlay» de accesibilidad **no garantizan el cumplimiento** y pueden empeorar la experiencia de quien usa tecnologías de apoyo.

## Qué hace

1. **Detecta el stack** (HTML, React/Next, Vue/Nuxt, WordPress, Shopify, plantillas de servidor) y dónde arreglar cada cosa.
2. **Auditoría automática** con `auditar.mjs`: axe-core a 1280 y 390 px, modo claro y oscuro si la web lo soporta, recorrido con Tab (foco visible, foco tapado, trampas, enlace «saltar al contenido») y reflow a 320 px. Genera `informe.json` e `informe.md` agrupados por criterio WCAG, impacto y página, con selectores y sugerencia de arreglo. Códigos de salida para CI.
3. **Revisión manual guiada**: teclado, lectores de pantalla (NVDA, VoiceOver, TalkBack), contraste, zoom 200 %, espaciado de texto, movimiento, formularios y multimedia.
4. **Arreglos priorizados** por impacto con recetas por componente: imágenes, enlaces, botones, formularios, modales, carruseles, menús, tablas, iconos, vídeo y animaciones, contraste, estructura, teclado y foco. Patrones ARIA correctos y anti-patrones.
5. **Declaración de accesibilidad** y canal de quejas a partir de una plantilla.
6. **Informe final** con criterios WCAG 2.2 y cláusulas EN 301 549 citados.

## Estructura

```text
skills/accesibilidad-web/          ← la skill (fuente única para todas las IA)
├── SKILL.md                       flujo en 6 pasos
├── references/                    se cargan solo cuando hacen falta
│   ├── checklist-wcag22-aa.md     56 criterios con mapeo a EN 301 549
│   ├── revision-manual.md
│   ├── deteccion-stack.md
│   ├── patrones-aria.md
│   ├── anti-patrones.md
│   └── recetas/                   una receta por componente
└── scripts/
    ├── auditar.mjs                auditoría con Playwright + axe-core
    ├── lib/                       criterios, teclado, informe
    └── test/
docs/
├── normativa-es.md                qué ley aplica, a quién y desde cuándo
└── declaracion-accesibilidad-plantilla.md
AGENTS.md · GEMINI.md · .cursor/rules/ · .github/copilot-instructions.md   adaptadores
.claude-plugin/                    plugin y marketplace de Claude Code
commands/auditar-accesibilidad.md  comando /auditar-accesibilidad
action.yml                         GitHub Action reutilizable
ejemplos/                          informe de ejemplo
```

## Instalación

Necesitas **Node.js 20 o superior** para el script de auditoría.

### Claude Code (plugin)

```text
/plugin marketplace add mediosyproyectos2016/AccesibilidadWeb
/plugin install accesibilidad-web@accesibilidad-web
```

La skill se activa sola cuando pides algo de accesibilidad («revisa la accesibilidad de esta web», «prepara la declaración de accesibilidad»). También puedes lanzar el comando:

```text
/accesibilidad-web:auditar-accesibilidad https://tu-web.es
```

Sin plugin: copia `skills/accesibilidad-web/` en `.claude/skills/` de tu proyecto o en `~/.claude/skills/`.

### Codex y otros agentes con AGENTS.md

Copia `skills/accesibilidad-web/` en tu proyecto y añade a tu `AGENTS.md`:

```markdown
Para auditar o mejorar la accesibilidad, sigue skills/accesibilidad-web/SKILL.md.
```

Si tu agente soporta el estándar abierto Agent Skills, basta con poner la carpeta en su directorio de skills.

### Cursor

Copia `skills/accesibilidad-web/` y `.cursor/rules/accesibilidad-web.mdc` en tu proyecto. La regla se aplica cuando el agente detecta que la tarea es de accesibilidad (o invócala con `@accesibilidad-web`).

### GitHub Copilot

Copia `skills/accesibilidad-web/` y añade el contenido de `.github/copilot-instructions.md` al de tu repositorio.

### Gemini CLI

Copia `skills/accesibilidad-web/` y `GEMINI.md` (o añade su contenido a tu `GEMINI.md`).

## Uso del script

```bash
cd skills/accesibilidad-web/scripts
npm install
npx playwright install chromium

node auditar.mjs https://tu-web.es https://tu-web.es/contacto
node auditar.mjs --rastrear 20 https://tu-web.es          # descubre páginas del mismo dominio
node auditar.mjs --urls urls.txt --salida informe          # lista de URLs en un fichero
node auditar.mjs --clic "#aceptar-cookies" https://tu-web.es
node auditar.mjs --umbral critico https://tu-web.es        # para CI
node auditar.mjs --ayuda
```

| Opción | Por defecto | Qué hace |
|---|---|---|
| `--anchos` | `1280,390` | Anchos de ventana |
| `--esquemas` | `auto` | `auto` añade modo oscuro solo si la web lo soporta |
| `--umbral` | `grave` | `critico`, `grave`, `moderado`, `leve` o `ninguno` |
| `--rastrear N` | — | Descubre hasta N páginas desde la primera URL |
| `--excluir sel` | — | Excluye un selector del análisis (repetible) |
| `--clic sel` | — | Pulsa un elemento tras cargar (banner de cookies) |
| `--buenas-practicas` | no | Incluye reglas «best-practice» de axe |
| `--sin-teclado` / `--sin-reflow` | no | Desactiva las comprobaciones propias |

**Códigos de salida:** `0` sin problemas por encima del umbral · `1` hay problemas por encima del umbral · `2` error de ejecución.

El informe de ejemplo de [`ejemplos/shop-myp/`](ejemplos/shop-myp/informe.md) muestra el formato.

## Integración continua

Usa la acción en tu repositorio:

```yaml
- uses: mediosyproyectos2016/AccesibilidadWeb@v0.1.0
  with:
    urls: https://tu-web.es https://tu-web.es/contacto
    umbral: grave
```

El resumen aparece en la página de la ejecución. Ejemplo completo en [`.github/workflows/accesibilidad.yml`](.github/workflows/accesibilidad.yml).

## Normativa

- [Guía de normativa española y europea](docs/normativa-es.md): a quién afecta la Ley 11/2023 y el RD 1112/2018, plazos, sanciones, EN 301 549 V3.2.1 y V4.1.1, y por qué apuntar ya a WCAG 2.2 AA.
- [Plantilla de declaración de accesibilidad](docs/declaracion-accesibilidad-plantilla.md).

## Contribuir

¡Las contribuciones son bienvenidas! Recetas nuevas, mejoras de las existentes, más stacks, traducciones, reglas automáticas y correcciones normativas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

## Licencia

[MIT](LICENSE) © Medios y Proyectos Neil, S.L.

axe-core es de Deque Systems (MPL-2.0) y Playwright de Microsoft (Apache-2.0); se instalan como dependencias, no se incluyen en este repositorio.
