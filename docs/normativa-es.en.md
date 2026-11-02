# Spanish web accessibility law — executive summary (English)

> **Not legal advice.** Short summary for international contributors. The full, sourced Spanish guide is [normativa-es.md](normativa-es.md); if this summary and the Spanish guide differ, the Spanish guide wins. Sources checked on **30 Oct 2026**, and on **2 Nov 2026** for scope, authorities, microenterprises and EN 301 549. Items marked **[to be verified]** could not be confirmed from official sources.

**Does it apply to your site?** Run `node aplicabilidad.mjs`: it answers «aplica» (applies), «no aplica» (does not) or «dudoso» (unsettled), with articles and both arguments. Full reasoning in Spanish: [references/aplicabilidad.md](../skills/accesibilidad-web/references/aplicabilidad.md).

## Who is covered

| Entity | Law | Since |
|---|---|---|
| Public sector (central, regional and local government, public bodies, justice administration) | **Royal Decree 1112/2018** (transposes Directive (EU) 2016/2102) | Websites: 20 Sep 2018, with phased deadlines; apps: 23 Jun 2021 |
| Private companies providing to **consumers**: e-commerce, consumer banking, electronic communications, access to audiovisual media, some passenger transport elements, e-books, **plus Spanish additions not in the EAA**: some electricity, water and gas supply elements, travel agencies and tour operators, social networks | **Law 11/2023, Title I** (transposes Directive (EU) 2019/882, the European Accessibility Act) | **28 Jun 2025** |
| Microenterprises providing services (< 10 staff and turnover or balance sheet ≤ €2 M; partner and linked enterprises count, per Recommendation 2003/361/EC via recital 53) | Exempt from Title I requirements (art. 3.3). Services only, not products | — |
| Sites that send users elsewhere to contract (affiliate, comparison, directories) or take quote requests | Unsettled: neither the text nor any official guidance found resolves it | — |
| Private companies with public funding for their site, running a public service or publicly funded schools | Technical criteria of RD 1112/2018 (additional provision 1) | — |
| Large companies (≥ 250 staff, or turnover > €50 M, or balance sheet > €43 M) selling to consumers, plus utilities, transport, postal, telecom and financial services | **Law 10/2025** on customer service: accessible customer service, easy-to-read and pictograms, complaint reply within 15 working days | In force 28 Dec 2025; 12 months to adapt |

## Key points of Law 11/2023

- **Transition:** products already in use may keep being used until **28 Jun 2030**; contracts signed before 28 Jun 2025 may run unchanged for up to 5 years. **Self-service terminals: Spain chose a 10-year cap**, not the 20 years the Directive allows.
- **Disproportionate burden or fundamental alteration (art. 16):** documented assessment kept for 5 years, renewed at least every 5 years for services, and notified to the authority.
- **Accessibility information (art. 13):** in the terms and conditions or an equivalent document, accessible, in written and oral form, kept up to date.
- **Enforcement:** market surveillance authorities are designated by each autonomous community; a national technical unit (Royal Decree 143/2026, within the Directorate-General for the Rights of Persons with Disabilities) coordinates and fills gaps. No official list was found as of 2 Nov 2026. Asturias and the Valencian Community have not designated one, according to a report of 29 Aug 2026; for the rest nothing could be confirmed. Contact: `utac@dsca.gob.es`. Whether the provider's or the user's region prevails is not stated in any rule.
- **Penalties (art. 30):** sector-specific law first; otherwise Title III of Royal Decree-Law 1/2013. Fines range from **€301 to €1,000,000**: minor up to €30,000, serious up to €90,000, very serious up to €1,000,000 (arts. 83 and 96), plus possible bans from public aid.
- The old accessibility clause in the e-commerce law (LSSI, additional provision 5) was **repealed** by Law 11/2023.

## Public sector (RD 1112/2018)

An accessibility statement following the **Commission Implementing Decision (EU) 2018/1523** model, updated at least yearly and linked from every page. A feedback channel with a 20-working-day reply and a complaint to the accessibility unit within 2 months apply to central government; regional and local rules may differ (Constitutional Court ruling STC 100/2019). Each body also needs a responsible accessibility unit, periodic reviews and annual reports.

## Technical standard

- **EN 301 549 V3.2.1** (Spanish adoption UNE-EN 301549:2022) is the harmonised standard cited in the Official Journal for Directive 2016/2102; its clause 9 = **WCAG 2.1 AA**.
- **EN 301 549 V4.1.1** was published by ETSI on **2 Sep 2026**. It is based on **WCAG 2.2 AA** and maps to the EAA. **No citation in the Official Journal could be found** as of 2 Nov 2026; expected dates conflict (16 Dec 2026 per Ireland's National Disability Authority, 30 Nov 2026 in ETSI's schedule per a third party). No harmonised standard appears to be cited under the EAA, and Law 11/2023 requires no specific version. EUR-Lex could not be opened from here: **[to be verified]**.
- **Project recommendation:** target **WCAG 2.2 AA** now.

## What does not prove compliance

- **Overlays/widgets:** the EDF and IAAP said on 17 May 2023 that overlays do not make sites compliant. On 22 Apr 2025 the US FTC finalised a **$1,000,000** order against accessiBe. The Overlay Fact Sheet takes the same position.
- **Automated tests,** including free online scanners, are only a first filter. The W3C says human judgement is required.

## Templates

[declaracion-accesibilidad-plantilla.md](declaracion-accesibilidad-plantilla.md) is a Spanish template, based on the EU 2018/1523 model, that also serves as the Law 11/2023 "service accessibility information".
