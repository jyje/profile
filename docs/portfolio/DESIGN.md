# Portfolio Page — Design Document

## Context and scope

This document describes the visual and structural design system used by the Portfolio pages
(`/ko/portfolio`, `/en/portfolio`, rendered via `_layouts/portfolio.html`). Portfolio reuses
several of the same includes as Resume (`pro/resume/work.html`, `pro/resume/projects.html`,
`pro/resume/education.html`, `pro/resume/skills.html`, and others), driven by its own data
files, `_data/portfolio-{en,ko}.yml`. This document focuses on what differs from Resume —
page composition, data conventions for `Work`, and the two-column print mode — and defers to
[`docs/resume/DESIGN.md`](../resume/DESIGN.md) for the shared card hierarchy, spacing,
typography, and content rules (web/print line limits, single-item collapse, icon set, etc.), which
apply identically here.

## Goals

- Present the same four-level card hierarchy as Resume (`Work`, `Projects`, `Education`),
  but with the fuller itemized detail (`roles.items` / `results.items`) that a portfolio
  reader is expected to want, rather than a resume's quick-scan summary.
- Preserve Resume's line limits — up to two lines on the web and one line in single-column
  print — with Portfolio checked by the same `resume-lint` run, not a separate tool.
- Support a denser, optionally two-column print layout for the larger number of entries
  Portfolio typically holds, without introducing a second card design.

## Non-goals

- A distinct visual language from Resume. Portfolio should look like "Resume's cards, at full
  detail," not a different product.
- Independent print pagination logic. Two-column mode is a CSS column split
  (`body.print-2col`), not a JS-driven layout engine.
- A separate data shape per section. Portfolio's `Education` reuses Resume's exact flat
  field shape; only `Work` differs (see below), and only because it predates the newer
  convention.

## Relationship to the Resume card system

Portfolio's page (`en/portfolio.md` / `ko/portfolio.md` front matter) renders these sections,
in order, through the same shared includes Resume uses:
`work`, `projects`, `skills`, `education`, `awards`, `publications`, `certifications`,
`interests`, `languages` — all in a single content column (see [Page layout](#page-layout)).

`Projects` and `Education` are rendered by the identical Liquid includes used by Resume, with
Portfolio's own, more detailed data:

- Same four-level hierarchy (Section → Card header → `.resume-meta-row` → level-4 list).
- Same `.resume-meta-row` classes, icons (`icon-user-tie` for Role, `icon-checkmark` for
  Results, `icon-book`/`icon-key` for Education's Field/Keywords), and spacing rules
  (`resume-role-row`/`resume-detail-row--first` first-row margin,
  `resume-results-heading`/`resume-detail-row--tight` tight-stack margin).
- Same **single-item collapse rule**: a `results.items` list with exactly one entry renders
  as inline text like `Role`, instead of a heading + one-item list. (Today no Portfolio
  project hits this case — every Portfolio project has 2+ `results.items` — but the rule
  applies automatically if that ever changes, since it lives in the shared template.)
- Same level-4 list (`.resume-detail-list.resume-results-list`) for `results.items` when there
  are 2 or more.
- `Education` uses the exact same flat fields as Resume (`area`, `studyType`, `gpa`) — no
  divergence there.

Resume and Portfolio both use `roles: { description, items }` for current `Work` entries.
Portfolio generally includes a description and fuller item list, while Resume keeps the
same shape concise for quick scanning. `_includes/pro/resume/work.html` also retains the
legacy flat `role`/`results`/`growth` fields for backward compatibility, so one template
serves both documents without a Portfolio-specific include. See
[Data contract](#data-contract) for the exact shape.

What Portfolio actually exercises more than Resume:

- **`roles.items` on `Projects`**: every Portfolio project uses 2–4 role bullet items
  (rendered as a plain `<ul class="work">`), whereas Resume's `Projects` entries only use
  `roles.description` (plain text, no items). This is the one part of the shared component
  not yet promoted to the level-3/level-4 `.resume-meta-row` + `.resume-detail-list`
  contract — see [Known limitations](#known-limitations--alternatives-considered).
- **`skills.items`**: Portfolio projects list a tag stack of technologies per project
  (`.skill-tags`/`.skill-tag`), used far more consistently than in Resume.

## Page layout

Portfolio uses a single content column (`.column.column-3-0`) rather than Resume's two-column
split (`.column-3-5` / `.column-2-5` for `Projects`/`Work`/`Education` vs
`Languages`/`Skills`/`Interests`). `page.sections` in `en/portfolio.md`/`ko/portfolio.md`
lists `work`, `projects`, `skills`, `education`, `awards`, `publications`, `certifications`,
`interests`, `languages`, so the page is one long feed of cards under the shared
header/contact block (`pro/resume/header.html`, `pro/resume/buttons.html`,
`pro/resume/basics.html`, `pro/resume/profiles.html`).

## Print and web parity

Portfolio uses the same local print-preview mechanism as Resume
(`?print=1`, `_sass/components/_print-preview.scss`, no automatic `window.print()`), with one
addition:

- **`?cols=2`** adds a `print-2col` class to `<body>`. In `_sass/components/_print-styles.scss`,
  this makes `.layout-portfolio .column-3-0` a two-column CSS layout
  (`column-count: 2`), with each project's section/heading kept from splitting across the
  column break. This is used when a longer Portfolio would otherwise print as many single-
  column A4 pages — the same card component still renders per project, just flowed into two
  columns instead of one.
- PDF generation (`scripts/generate-pdf.js`, `pdf-config.yml`) targets `/en/portfolio` and
  `/ko/portfolio` directly, independent of the `?cols=2` screen preview toggle — the actual
  PDF's column behavior is whatever the compiled `@media print` rules resolve to for that
  route.

## Content rules

All Resume content rules apply unchanged (see
[`docs/resume/DESIGN.md`](../resume/DESIGN.md)). In addition, for Portfolio's denser
detail:

- Prefer 2–4 concise `roles.items`/`results.items` entries per project; if a category would
  only ever have one entry, use the plain `description` field instead of a one-item `items`
  list (mirrors the single-item collapse rule already enforced for `Results`).
- `skills.items` per project should list concrete technologies (tools, frameworks, protocols),
  not restate the role/result text — they exist to be visually scannable tags, not
  prose.

## Data contract

Portfolio uses its own data files, `_data/portfolio-{en,ko}.yml`. `Education` matches
Resume's shape exactly (see
[`docs/resume/DESIGN.md`](../resume/DESIGN.md#data-contract)). `Work` and `Projects` differ
as follows:

```yaml
labels:
  role: Role            # must be defined per language file; there is no cross-file fallback
  results: Results
  growth: Growth
  area: Field
  degree: Degree
  gpa: GPA

work:
  - company: string
    headerIcon: emoji               # optional; web only, omitted in print/PDF
    position: string
    website: url
    startDate / endDate
    roles:
      description: string           # single Role-style level-3 row
      items: [{ header, content }]  # rendered as a level-4 bullet list under that row

projects:
  - headerIcon: emoji       # optional; web only, omitted in print/PDF
    position: string
    company: string
    website: url
    startDate / endDate
    roles:
      description: string           # short one-line summary (Role row)
      items: [{ header, content }]  # 2–4 bullets typical; plain <li>, not level-4 styled
    results:
      description: string           # optional multi-clause summary (Results row)
      items: [{ header, content }]  # 2–4 bullets typical; level-4 styled list
    skills:
      description: string
      items: [string]
```

`labels.*` is read as `resume.labels.*` by the shared includes, where `resume` resolves to
whichever `data_file` the page declares (`portfolio-en`/`portfolio-ko` for Portfolio,
`resume-en`/`resume-ko` for Resume). Each data file must define its own `labels` block in its
own language — Portfolio does not inherit Resume's `labels`, since they are two independent
top-level YAML documents. Omitting it does not error; Liquid's `default:"Role"` filter
silently falls back to the **English** default regardless of page language, which is why this
must be verified per data file rather than assumed from Resume's file alone.

## Validation: resume-lint

The same [`resume-lint`](../../.agents/skills/resume-lint/SKILL.md) run checks Portfolio
alongside Resume — `/ko/portfolio` and `/en/portfolio`, in web, `?print=1`, and
`?print=1&cols=2` modes:

```bash
node .agents/skills/resume-lint/scripts/lint-resume-layout.js
```

It verifies the same three invariants as Resume (no wrapped rows, level-3 rows aligned to
Project's reference `.resume-role-row`, level-4 rows indented deeper than level-3), across
every `.resume-meta-row` on the page — including Portfolio's `Work` section, which is why the
`work.html` regression described in the changelog below was caught. It does not check label
*language correctness* (e.g. an English word appearing on the Korean page reads as "no
wrapping issue" to the lint, since layout is unaffected) — that must still be checked
visually or with a dedicated content assertion. In two-column print mode it verifies a
successful, non-empty card render but permits natural wrapping because each column is
intentionally narrower; one-line and absolute-x checks remain scoped to web and
single-column print.

## Known limitations / alternatives considered

- `resume-lint` does not assert label *language* correctness (see previous section); it only
  measures layout. A missing `labels:` block silently renders English defaults on the Korean
  page without failing the lint.
- `Projects → roles.items` (used heavily in Portfolio) is still an unstyled `<ul
  class="work">` list, not promoted to the level-3/level-4 `.resume-meta-row` +
  `.resume-detail-list` contract that `Work`'s legacy shape now uses. Because Portfolio
  relies on it more than Resume, promoting it would benefit Portfolio the most if undertaken.
- We considered giving Portfolio a denser, portfolio-specific card variant (e.g. smaller type
  scale to fit more per page) instead of reusing Resume's card exactly. Rejected to keep a
  single source of truth for the card design and a single `resume-lint` contract instead of
  two parallel visual systems to keep in sync.

## Changelog

- Portfolio project cards synchronized to the same four-level hierarchy fix applied to
  Resume's `Work`/`Education` (level-3 `.resume-meta-row` alignment with Project's reference
  row).
- Discovered and fixed a regression: restructuring `work.html` to the flat
  `role`/`results`/`growth` convention had silently dropped support for Portfolio's legacy
  `roles.description`/`roles.items` shape, blanking Portfolio's entire `Work` section content
  (title and dates still rendered; the role description and bullet list did not). Fixed by
  making `work.html` support both shapes, with the flat fields taking precedence.
- Discovered and fixed a localization bug: `_data/portfolio-{en,ko}.yml` had no `labels:`
  block, so `Role`/`Results`/etc. rendered in English on the Korean Portfolio page (Liquid's
  `default:"Role"` filter silently masked the missing key). Added a `labels:` block to both
  files matching Resume's values per language.
- Portfolio content audited and shortened wherever `resume-lint` reported a wrapped row,
  preserving factual meaning (see `resume-lint`'s procedure for the review discipline used).
- `resume-lint` scope extended to include `/ko/portfolio` and `/en/portfolio` in both web and
  print views, alongside Resume.
