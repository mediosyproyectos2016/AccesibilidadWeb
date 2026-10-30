# AccesibilidadWeb

**An open skill that lets any AI coding agent audit and fix a website for Spanish and European accessibility law**: Spain's Law 11/2023 (transposing the European Accessibility Act), Royal Decree 1112/2018 (public sector), EN 301 549 and WCAG 2.2 level AA.

It works with Claude Code, Codex and other agents that read `AGENTS.md`, Cursor, GitHub Copilot and Gemini CLI. It ships an automated audit script (Playwright + axe-core), a guided manual review, fix recipes per component and per stack, and an accessibility statement template.

The skill and its references are written in **Spanish** (its primary audience is Spanish-speaking teams), but agents follow them fine when you work in English, and the audit script can print axe messages in English with `--idioma en`.

[Versión en español](README.md)

> **Important.** This tool helps you find and fix problems, but it **does not replace an expert manual audit or legal advice**. Automated tests catch only part of the issues. Accessibility overlay widgets **do not guarantee compliance** and can make things worse for assistive technology users.

## What it does

1. **Detects the stack** (plain HTML, React/Next, Vue/Nuxt, WordPress, Shopify, server templates) and where each fix belongs.
2. **Automated audit** with `auditar.mjs`: axe-core at 1280 and 390 px, light and dark mode when the site supports it, a Tab walk (visible focus, obscured focus, focus traps, skip link) and a 320 px reflow check. Produces `informe.json` and `informe.md` grouped by WCAG criterion, impact and page, with selectors and fix hints. Exit codes for CI.
3. **Guided manual review**: keyboard, screen readers (NVDA, VoiceOver, TalkBack), contrast, 200 % zoom, text spacing, motion, forms and media.
4. **Prioritised fixes** by impact, with recipes for images, links, buttons, forms, modals, carousels, menus, tables, icons, video and animation, contrast, structure, keyboard and focus. Correct ARIA patterns and anti-patterns.
5. **Accessibility statement** and feedback/complaints channel from a template.
6. **Final report** citing WCAG 2.2 criteria and EN 301 549 clauses.

## Install

You need **Node.js 18+** for the audit script.

**Claude Code (plugin)**

```text
/plugin marketplace add mediosyproyectos2016/AccesibilidadWeb
/plugin install accesibilidad-web@accesibilidad-web
/accesibilidad-web:auditar-accesibilidad https://your-site.example
```

Without the plugin, copy `skills/accesibilidad-web/` into `.claude/skills/` or `~/.claude/skills/`.

**Codex / AGENTS.md agents**: copy `skills/accesibilidad-web/` into your project and add to `AGENTS.md`: *"For accessibility audits or fixes, follow skills/accesibilidad-web/SKILL.md."*

**Cursor**: copy `skills/accesibilidad-web/` and `.cursor/rules/accesibilidad-web.mdc`.

**GitHub Copilot**: copy `skills/accesibilidad-web/` and merge `.github/copilot-instructions.md` into yours.

**Gemini CLI**: copy `skills/accesibilidad-web/` and `GEMINI.md`.

## Running the script

```bash
cd skills/accesibilidad-web/scripts
npm install
npx playwright install chromium

node auditar.mjs https://your-site.example https://your-site.example/contact
node auditar.mjs --rastrear 20 https://your-site.example   # crawl up to 20 same-origin pages
node auditar.mjs --umbral critico https://your-site.example # CI: fail only on critical issues
node auditar.mjs --idioma en https://your-site.example     # axe messages in English
node auditar.mjs --ayuda                                    # all options
```

Exit codes: `0` nothing above the threshold · `1` issues above the threshold · `2` execution error. Thresholds: `critico` (critical), `grave` (serious, default), `moderado`, `leve`, `ninguno` (never fail).

## CI

```yaml
- uses: mediosyproyectos2016/AccesibilidadWeb@v0.1.0
  with:
    urls: https://your-site.example https://your-site.example/contact
    umbral: grave
```

See [`.github/workflows/accesibilidad.yml`](.github/workflows/accesibilidad.yml).

## Regulations

- [Spanish and EU accessibility law guide](docs/normativa-es.en.md) (summary in English; full guide in Spanish at [docs/normativa-es.md](docs/normativa-es.md)).
- [Accessibility statement template](docs/declaracion-accesibilidad-plantilla.md) (Spanish).

## Contributing

Contributions are welcome: new recipes, more stacks, translations, automated checks and legal corrections. See [CONTRIBUTING.md](CONTRIBUTING.md) (in Spanish; issues and PRs in English are fine too) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Medios y Proyectos Neil, S.L. axe-core (Deque Systems, MPL-2.0) and Playwright (Microsoft, Apache-2.0) are installed as dependencies, not bundled.
