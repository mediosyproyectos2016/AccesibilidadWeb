# AccesibilidadWeb

**An open skill that lets any AI coding agent take a website from accessibility audit to fixed code**, following Spanish and European law: Spain's Law 11/2023 (transposing the European Accessibility Act), Royal Decree 1112/2018 (public sector), EN 301 549 and WCAG 2.2 level AA.

It does not stop at a report. It prioritises, locates the source file, applies what is safe with a reviewable diff, re-audits in a loop, records the manual review, generates the accessibility statement from real results and watches for regressions in CI. It works on any stack, with Claude Code, Codex and other agents that read `AGENTS.md`, Cursor, GitHub Copilot and Gemini CLI.

The skill and its references are written in **Spanish** (its primary audience is Spanish-speaking teams), but agents follow them fine when you work in English. The audit script prints axe messages in English with `--idioma en`, and the preferences panel ships in English and Spanish.

[Versión en español](README.md)

## What this tool cannot promise

**Nobody can guarantee a "100 % accessible" website, and neither can this skill.** People's needs are diverse and content changes. The realistic goal is **zero detectable failures, plus the manual checklist completed with a screen reader and real people**, and being able to say what was checked and how.

- **Automated audits catch only part of the failures.** In the [UK GDS test](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/) (2017), the best of 10 tools found 41 % of barriers, and 42 of the 143 were missed by all of them. [Deque](https://www.deque.com/automated-accessibility-testing-coverage/), which makes axe-core, estimates 57 % by issue volume. As the [W3C](https://www.w3.org/WAI/test-evaluate/tools/selecting/) puts it, tools "can not determine accessibility, they can only assist".
- **A panel or overlay does not make a site compliant and does not replace fixing the code.** The [European Disability Forum and IAAP](https://www.edf-feph.org/accessibility-overlays-dont-guarantee-compliance-with-european-legislation/) said so in 2023 ("Overlays do not make the website accessible or compliant with European accessibility legislation"), over a thousand professionals and people with disabilities have signed the [Overlay Fact Sheet](https://overlayfactsheet.com/en/), and in 2025 the [US FTC](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) finalised a $1 million order against a vendor that promised it. This skill's panel is an added convenience and is presented as such.
- **It does not replace an expert manual audit or legal advice.** The generated statement never claims conformity nobody has verified.

## The flow

```text
which law applies? → audit → prioritise → fix in code → re-audit ⟲ → manual review with people → statement → CI
```

| Step | Tool | What it does |
|---|---|---|
| Applicability | `aplicabilidad.mjs` | For any website: applies, does not apply or unsettled («dudoso»), with certainty, article and link, arguments, duties, authority and statement wording. Spain first, with the EU Directive as the base for other countries. No network or install. Output in Spanish. |
| Audit | `auditar.mjs` | axe-core at 1280 and 390 px, plus what axe does not cover: keyboard, focus traps and order, dialogs (focus, containment, `Esc`, return), disclosures, motion without pause, `prefers-reduced-motion`, 320 px reflow, 200 % zoom, text spacing and measured contrast of text over images or video. Multiple pages via sitemap, and interactive states. |
| Prioritise | `priorizar.mjs` | Plan by impact and reach: shared components, likely source file, recipe and who can fix it. |
| Fix | `arreglar.mjs`, recipes | Safe fixes with a reviewable diff. Recipes per component and [guides per framework](skills/accesibilidad-web/references/frameworks/). A list of what needs human judgement. |
| Re-audit | `comparar.mjs` | Before and after, with a verdict: continue, fix regression, escalate or move to manual review. |
| Manual review | `revision.mjs` | Record of keyboard, screen reader, content and real-people checks. No author and method, no credit; an agent cannot approve what requires a person. |
| Statement | `declaracion.mjs` | Markdown and HTML from real results, plus an [accessible feedback form](skills/accesibilidad-web/plantillas/contacto-accesibilidad.html). |
| Guard | `--linea-base` | CI fails only on regressions against a baseline. |
| Optional | [panel](skills/accesibilidad-web/panel/README.md) | Visitor preferences, no dependencies or tracking. |

## Quick start

With an agent, just ask: "fix the accessibility of this site". By hand:

```bash
cd skills/accesibilidad-web/scripts
npm install --omit=dev
npx playwright install chromium

node auditar.mjs --salida a11y/before http://localhost:3000 http://localhost:3000/contact
node priorizar.mjs a11y/before/informe.json --proyecto ../../../my-site
node arreglar.mjs --proyecto ../../../my-site --idioma en     # only writes arreglos.diff
node arreglar.mjs --proyecto ../../../my-site --idioma en --aplicar

# …fix the rest using plan.md…

node auditar.mjs --salida a11y/after http://localhost:3000 http://localhost:3000/contact
node comparar.mjs a11y/before/informe.json a11y/after/informe.json --salida a11y/comparison.md

node revision.mjs crear --informe a11y/after/informe.json --salida a11y/manual-review.json
node declaracion.mjs --informe a11y/after/informe.json --revision a11y/manual-review.json --datos data.json
```

## Install

You need **Node.js 20+** for the scripts.

**Claude Code (plugin)**

```text
/plugin marketplace add mediosyproyectos2016/AccesibilidadWeb
/plugin install accesibilidad-web@accesibilidad-web
/accesibilidad-web:auditar-accesibilidad https://your-site.example
/accesibilidad-web:arreglar-accesibilidad http://localhost:3000
/accesibilidad-web:aplicabilidad-accesibilidad online shop run by a 25-person company
/accesibilidad-web:panel-accesibilidad en-linea
```

Without the plugin, copy `skills/accesibilidad-web/` into `.claude/skills/` or `~/.claude/skills/`.

**Codex / AGENTS.md agents**: copy `skills/accesibilidad-web/` into your project and add to `AGENTS.md`: *"For accessibility audits or fixes, follow skills/accesibilidad-web/SKILL.md."*

**Cursor**: copy `skills/accesibilidad-web/` and `.cursor/rules/accesibilidad-web.mdc`.

**GitHub Copilot**: copy `skills/accesibilidad-web/` and merge `.github/copilot-instructions.md` into yours.

**Gemini CLI**: copy `skills/accesibilidad-web/` and `GEMINI.md`.

## Audit options

```bash
node auditar.mjs --sitemap https://your-site.example/sitemap.xml --max-paginas 20
node auditar.mjs --rastrear 20 https://your-site.example   # crawl up to 20 same-origin pages
node auditar.mjs --estados states.json --sesion session.json https://your-site.example/account
node auditar.mjs --urls urls.txt --concurrencia 4           # several pages at once
node auditar.mjs --clic "#accept" --tecla Escape https://your-site.example
node auditar.mjs --almacenamiento notice-seen=yes https://your-site.example
node auditar.mjs --rapido https://your-site.example        # axe, keyboard and reflow only
node auditar.mjs --idioma en https://your-site.example     # axe messages in English
node auditar.mjs --ayuda                                   # all options
```

By itself, the audit only clicks controls that declare they open a dialog or disclosure, and never submits forms. A step in `--estados` does what you tell it: point it at a test copy.

Exit codes: `0` nothing above the threshold (or no regressions, with `--linea-base`) · `1` issues or regressions · `2` execution error or known page not audited. Thresholds: `critico` (critical), `grave` (serious, default), `moderado`, `leve`, `ninguno` (never fail).

## Automatic fixes

`arreglar.mjs` applies only what is correct whatever the content: adding `lang` (if you state it), removing zoom locks, positive `tabindex` to `0`, `<marquee>` and `<blink>` to static elements, `outline: none` with no replacement, and `prefers-reduced-motion` and `:focus-visible` blocks in the stylesheet you name. **By default it writes nothing**: it generates a diff to review. It never invents alt text, labels or titles.

## CI

```yaml
- uses: mediosyproyectos2016/AccesibilidadWeb@v0.2.0
  with:
    urls: https://your-site.example https://your-site.example/contact
    umbral: grave
    linea-base: a11y-base.json   # optional: fail only on regressions
```

Create the baseline once with `auditar.mjs --guardar-linea-base a11y-base.json <urls>` and commit it. It is a debt list, not a list of acceptable failures. See [`.github/workflows/accesibilidad.yml`](.github/workflows/accesibilidad.yml).

## Preferences panel

```html
<panel-accesibilidad modo="en-linea" declaracion="/accessibility"></panel-accesibilidad>
<script src="/panel-accesibilidad.js" defer></script>
```

Text size, contrast, spacing, underlined links, stop animations and a plain font. No dependencies or network requests; it stores locally only what the person changes. **It is a convenience: it does not fix the site or prove anything.** Limits, per-platform install and a React wrapper in [panel/README.md](skills/accesibilidad-web/panel/README.md) (Spanish).

To try it: `cd skills/accesibilidad-web/panel && python -m http.server 8000`, then open `http://localhost:8000/demo.html`.

## Regulations

- [Does the law apply to your site?](skills/accesibilidad-web/references/aplicabilidad.md) Decision tree, microenterprises, e-commerce, duties, authorities and sources (Spanish). Not legal advice; reviewed on 2 Nov 2026. Where neither the text nor official guidance settles a case, it says so and gives both arguments.
- [Spanish and EU accessibility law guide](docs/normativa-es.en.md) (summary in English; full guide in Spanish at [docs/normativa-es.md](docs/normativa-es.md)).
- [Accessibility statement template](docs/declaracion-accesibilidad-plantilla.md) (Spanish).

## Contributing

We are looking for collaborators: recipes, more framework guides, automated checks, panel translations, legal corrections and, above all, testing with people who use assistive technology. See [CONTRIBUTING.md](CONTRIBUTING.md) (in Spanish; issues and PRs in English are fine too) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Medios y Proyectos Neil, S.L. axe-core (Deque Systems, MPL-2.0) and Playwright (Microsoft, Apache-2.0) are installed as dependencies, not bundled.
