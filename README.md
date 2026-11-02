# AccesibilidadWeb

**Una skill abierta para que cualquier IA o agente de código lleve una web de la auditoría de accesibilidad al código arreglado**, según la normativa española y europea: Ley 11/2023 (Acta Europea de Accesibilidad), Real Decreto 1112/2018, EN 301 549 y WCAG 2.2 nivel AA. También responde si esa normativa le aplica a tu web.

No se queda en el informe: prioriza, localiza el fichero, aplica lo que es seguro con un diff revisable, reaudita en bucle, registra la revisión manual, genera la declaración con los resultados reales y vigila las regresiones en la CI. Funciona en cualquier stack, con Claude Code, Codex y otros agentes que leen `AGENTS.md`, Cursor, GitHub Copilot y Gemini CLI.

[English version](README.en.md)

## Lo que esta herramienta no puede prometer

**Nadie puede garantizar una web «100 % accesible», tampoco esta skill.** Las necesidades de las personas son diversas y el contenido cambia. El objetivo realista es **cero fallos detectables, más la lista de comprobación manual completada con lector de pantalla y personas reales**, y poder decir qué se comprobó y cómo.

- **La auditoría automática solo detecta una parte de los fallos.** En la [prueba del GDS británico](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) (2017), la mejor de 10 herramientas halló el 41 % de las barreras y 42 de las 143 no las vio ninguna. [Deque](https://www.deque.com/automated-accessibility-testing-coverage/), fabricante de axe-core, estima el 57 % por volumen de incidencias. El [W3C](https://www.w3.org/WAI/test-evaluate/tools/selecting/) lo resume: las herramientas «*can not determine accessibility, they can only assist*».
- **Un panel o *overlay* no hace conforme una web ni sustituye arreglar el código.** El [European Disability Forum y la IAAP](https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/) lo dijeron en 2023 («*Overlays do not make the website accessible or compliant with European accessibility legislation*»), más de mil profesionales y personas con discapacidad lo firman en el [Overlay Fact Sheet](https://overlayfactsheet.com/en/), y la [FTC de EE. UU.](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) impuso en 2025 una orden de 1 millón de dólares a un proveedor que lo prometía. El panel de esta skill es una comodidad adicional, y así se presenta.
- **No sustituye una auditoría manual experta ni el asesoramiento jurídico.** La declaración generada nunca afirma una conformidad que nadie ha verificado.

## El flujo

```text
¿qué norma aplica? → auditar → priorizar → arreglar en el código → reauditar ⟲ → revisión manual con personas → declaración → CI
```

| Paso | Herramienta | Qué hace |
|---|---|---|
| Aplicabilidad | `aplicabilidad.mjs` | Para cualquier web: «aplica», «no aplica» o «dudoso», con certeza, artículo y enlace, argumentos, obligaciones, autoridad y texto de la declaración. Sin red ni instalación. |
| Auditar | `auditar.mjs` | axe-core a 1280 y 390 px, más lo que axe no cubre: teclado, trampas y orden del foco, diálogos (foco, retención, `Esc`, devolución), desplegables, movimiento sin pausa, `prefers-reduced-motion`, reflow a 320 px, zoom al 200 %, espaciado de texto y contraste medido de texto sobre imagen o vídeo. Varias páginas por sitemap y estados interactivos. |
| Priorizar | `priorizar.mjs` | Plan por impacto y alcance: componentes compartidos, fichero fuente probable, receta y quién puede arreglarlo. |
| Arreglar | `arreglar.mjs`, recetas | Arreglos seguros con diff revisable. Recetas por componente y [guías por framework](skills/accesibilidad-web/references/frameworks/). Lista de lo que exige criterio humano. |
| Reauditar | `comparar.mjs` | Antes y después, con veredicto: seguir, corregir regresión, escalar o pasar a la revisión manual. |
| Revisión manual | `revision.mjs` | Registro de teclado, lector de pantalla, contenido y personas reales. Sin autor y método no cuenta, y un agente no puede aprobar lo que exige a una persona. |
| Declarar | `declaracion.mjs` | Declaración en Markdown y HTML con los resultados reales, más un [formulario de comunicación accesible](skills/accesibilidad-web/plantillas/contacto-accesibilidad.html). |
| Vigilar | `--linea-base` | La CI falla solo con regresiones respecto a una línea base. |
| Opcional | [panel](skills/accesibilidad-web/panel/README.md) | Preferencias del visitante, sin dependencias ni rastreo. |

Cómo se trabaja y cuándo parar: [references/flujo-arreglo.md](skills/accesibilidad-web/references/flujo-arreglo.md).

## Empezar en cinco minutos

Con un agente, basta con pedirlo: «arregla la accesibilidad de esta web». A mano:

```bash
cd skills/accesibilidad-web/scripts
npm install --omit=dev
npx playwright install chromium

node auditar.mjs --salida a11y/antes http://localhost:3000 http://localhost:3000/contacto
node priorizar.mjs a11y/antes/informe.json --proyecto ../../../mi-web
node arreglar.mjs --proyecto ../../../mi-web --idioma es        # solo genera arreglos.diff
node arreglar.mjs --proyecto ../../../mi-web --idioma es --aplicar

# …arreglas lo demás con plan.md…

node auditar.mjs --salida a11y/despues http://localhost:3000 http://localhost:3000/contacto
node comparar.mjs a11y/antes/informe.json a11y/despues/informe.json --salida a11y/comparacion.md

node revision.mjs crear --informe a11y/despues/informe.json --salida a11y/revision-manual.json
node declaracion.mjs --informe a11y/despues/informe.json --revision a11y/revision-manual.json --datos datos.json
```

## Instalación en tu IA

Necesitas **Node.js 20 o superior** para los scripts.

### Claude Code (plugin)

```text
/plugin marketplace add mediosyproyectos2016/AccesibilidadWeb
/plugin install accesibilidad-web@accesibilidad-web
```

La skill se activa sola cuando pides algo de accesibilidad. Comandos:

```text
/accesibilidad-web:auditar-accesibilidad https://tu-web.es
/accesibilidad-web:arreglar-accesibilidad http://localhost:3000
/accesibilidad-web:aplicabilidad-accesibilidad tienda en línea de una S.L. de 25 personas
/accesibilidad-web:panel-accesibilidad en-linea
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

## ¿Te aplica la normativa?

Pregunta por hechos, no por tipos de negocio: qué ofrece la web, a quién, si se contrata en ella, quién es el titular y su tamaño. Vale para una tienda, un marketplace, reservas, SaaS, banca, transporte, medios, un blog, una ONG, una administración, un servicio B2B, una web corporativa o un autónomo.

```bash
cd skills/accesibilidad-web/scripts
node aplicabilidad.mjs --preguntas
node aplicabilidad.mjs --titular privado --destinatarios consumidores --contrato en-la-web \
  --contraparte titular --personas 25 --volumen 3000000 --balance 2500000 --grupo no --comunidad MD
```

Lo que no sepas, omítelo: sale «dudoso» con cada escenario. Si ni la norma ni un criterio oficial zanjan el caso, da los dos argumentos y una recomendación prudente, y separa norma, criterio oficial, opinión de terceros y razonamiento propio. **No es asesoramiento jurídico.** Datos revisados el 2-11-2026, con fecha en cada resultado y aviso si envejecen. España es el primer país completo; la Directiva hace de base para añadir otros. Árbol, autoridades por comunidad, «parcialmente conforme» y fuentes: [references/aplicabilidad.md](skills/accesibilidad-web/references/aplicabilidad.md).

## Auditar: opciones

```bash
node auditar.mjs --sitemap https://tu-web.es/sitemap.xml --max-paginas 20
node auditar.mjs --rastrear 20 https://tu-web.es
node auditar.mjs --urls urls.txt --concurrencia 4           # varias páginas a la vez
node auditar.mjs --clic "#aceptar-cookies" --tecla Escape https://tu-web.es
node auditar.mjs --almacenamiento aviso-visto=si https://tu-web.es
node auditar.mjs --estados estados.json --sesion sesion.json https://tu-web.es/cuenta
node auditar.mjs --rapido https://tu-web.es     # solo axe, teclado y reflow
node auditar.mjs --ayuda
```

`estados.json` audita lo que solo aparece al interactuar:

```json
[
  { "nombre": "Menú móvil abierto", "ancho": 390, "pasos": [{ "clic": "#menu" }] },
  { "nombre": "Error de formulario", "url": "/contacto", "pasos": [
    { "escribir": ["#correo", "no-es-un-correo"] }, { "clic": "button[type=submit]" }, { "esperar": 300 }
  ] }
]
```

Por sí sola, la auditoría solo pulsa controles que declaran abrir un diálogo o un desplegable, y nunca envía formularios. Un paso de `--estados` hace lo que le pidas: úsalo contra una copia de pruebas.

**Códigos de salida:** `0` sin problemas por encima del umbral (o sin regresiones, con `--linea-base`) · `1` hay problemas o regresiones · `2` error de ejecución o página conocida sin auditar.

El informe de ejemplo de [`ejemplos/shop-myp/`](ejemplos/shop-myp/informe.md) muestra el formato.

## Arreglos automáticos

`arreglar.mjs` solo aplica lo que es correcto sea cual sea el contenido: añadir `lang` (si lo indicas), quitar el bloqueo de zoom, `tabindex` positivo a `0`, `<marquee>` y `<blink>` a elementos estáticos, `outline: none` sin sustituto, y bloques de `prefers-reduced-motion` y `:focus-visible` en la hoja que indiques. **Por defecto no escribe nada**: genera un diff para revisar. Nunca inventa textos alternativos, etiquetas ni títulos.

## Integración continua

```yaml
- uses: mediosyproyectos2016/AccesibilidadWeb@v0.2.0
  with:
    urls: https://tu-web.es https://tu-web.es/contacto
    umbral: grave
    linea-base: a11y-base.json   # opcional: falla solo con regresiones
```

Crea la línea base una vez con `auditar.mjs --guardar-linea-base a11y-base.json <urls>` y súbela. Es una lista de deuda, no de fallos aceptables: regenérala cuando mejores, no para hacer pasar la CI. Ejemplo en [`.github/workflows/accesibilidad.yml`](.github/workflows/accesibilidad.yml).

## Panel de preferencias

```html
<panel-accesibilidad modo="en-linea" declaracion="/accesibilidad"></panel-accesibilidad>
<script src="/panel-accesibilidad.js" defer></script>
```

Tamaño de texto, contraste, espaciado, enlaces subrayados, parar animaciones y fuente sencilla. Sin dependencias ni peticiones de red; guarda en local solo lo que la persona cambia. **Es una comodidad: no corrige la web ni acredita nada.** Límites, instalación por plataforma y envoltorio de React en [panel/README.md](skills/accesibilidad-web/panel/README.md).

Para probarlo: `cd skills/accesibilidad-web/panel && python -m http.server 8000` y abre `http://localhost:8000/demo.html`.

## Estructura

```text
skills/accesibilidad-web/          ← la skill (fuente única para todas las IA)
├── SKILL.md                       aplicabilidad y flujo en 10 pasos
├── references/                    se cargan solo cuando hacen falta
│   ├── aplicabilidad.md           si la norma obliga, autoridades y fuentes
│   ├── flujo-arreglo.md           el bucle y cuándo parar
│   ├── frameworks/                HTML, React/Next, Vue/Nuxt, Astro, WordPress, Shopify
│   ├── recetas/                   una receta por componente
│   ├── checklist-wcag22-aa.md     56 criterios con mapeo a EN 301 549
│   └── revision-manual.md · deteccion-stack.md · patrones-aria.md · anti-patrones.md
├── scripts/                       aplicabilidad · auditar · priorizar · arreglar · comparar · revision · declaracion
├── panel/                         componente web, ejemplo de React y página de prueba
└── plantillas/                    formulario de comunicación y datos de la declaración
docs/                              normativa y plantilla de declaración
AGENTS.md · GEMINI.md · .cursor/rules/ · .github/copilot-instructions.md   adaptadores
.claude-plugin/ · commands/        plugin y comandos de Claude Code
action.yml                         GitHub Action reutilizable
```

## Normativa

- [¿Te aplica?](skills/accesibilidad-web/references/aplicabilidad.md): árbol de decisión, microempresa, comercio electrónico, obligaciones por artículo, autoridades por comunidad y «parcialmente conforme».
- [Guía de normativa española y europea](docs/normativa-es.md): a quién afecta la Ley 11/2023 y el RD 1112/2018, plazos, sanciones, EN 301 549 V3.2.1 y V4.1.1, y por qué apuntar ya a WCAG 2.2 AA.
- [Plantilla de declaración de accesibilidad](docs/declaracion-accesibilidad-plantilla.md), en la que se basa `declaracion.mjs`.

## Contribuir

Se buscan colaboradores: recetas, guías para más frameworks, comprobaciones automáticas, traducciones del panel, correcciones normativas y, sobre todo, pruebas con personas que usan tecnologías de apoyo. Lee [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

## Licencia

[MIT](LICENSE) © Medios y Proyectos Neil, S.L.

axe-core es de Deque Systems (MPL-2.0) y Playwright de Microsoft (Apache-2.0); se instalan como dependencias, no se incluyen en este repositorio.
