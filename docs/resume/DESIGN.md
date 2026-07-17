# Resume Page — Design Document

## Context and scope

This document describes the visual and structural design system used by the Resume pages
(`/ko/resume`, `/en/resume`, rendered via `_layouts/resume.html`). It covers the card
hierarchy, spacing, typography, content rules, and the print/web parity model shared with
Portfolio (see [`docs/portfolio/DESIGN.md`](../portfolio/DESIGN.md)).

The Resume reuses the same `Projects` component (`_includes/pro/resume/projects.html`) as
Portfolio, so the two documents intentionally overlap on the shared card system but diverge
on section composition, column layout, and typical data density.

## Goals

- Content rows may use up to two lines on the web and must stay on one line in the local
  A4 print preview — never a silent wrap beyond the applicable limit.
- A single, consistent four-level visual hierarchy across `Projects`, `Work`, and
  `Education`, so a reader's eye tracks the same indentation and type scale regardless of
  section.
- Screen and print render from the same SCSS rules; print is not a separately maintained
  stylesheet.
- Machine-checkable layout invariants (see [Validation](#validation-resume-lint)), not just
  visual review.

## Non-goals

- Pixel-perfect parity with the Adobe/Word-generated resume formats some ATS tools expect.
- A generic multi-column CMS-driven resume builder. This is a fixed, hand-authored layout.
- Automatic translation between `resume-ko.yml` and `resume-en.yml`. Bilingual parity is a
  manual authoring discipline, not a build-time guarantee.

## Component hierarchy

Every card-based section (`Projects`, `Work`, `Education`, `Other Activities`) follows the same four levels.
`Projects` is the reference implementation; `Work` and `Education` are kept in sync with it.

| Level | Meaning | Example | Markup |
|---|---|---|---|
| 1 | Section | `Projects` / `Work` / `Education` / `Other Activities` heading | `<section><h2>` |
| 2 | Card header | Date range + position/company, or degree/institution/GPA | `.resume-card-title` inside `<header>` |
| 3 | Semantic row | Project `Role`/`Results`, Work `Roles`, Education `Field`/`Keywords`, Other Activities highlights | `.resume-meta-row` (icon + optional label + text) |
| 4 | Detail item under a level-3 row | A Project result or Work role item | `.resume-detail-list li` |

Level 3 is always a `.resume-meta-row`: a flex row of `.resume-meta-icon` (fixed width),
`.resume-meta-label` (bold, short noun), and `.resume-meta-text` (the value). This is true
whether the row lives in `Projects` (`Role`, `Results`), `Work` (`Roles`), or
`Education` (`Field`, `Keywords`). Work renders position before company; Education renders degree before institution and optional GPA. Reusing one class means the four cards stay
synchronized by construction instead of by manually matched pixel values.

Level 4 exists under `Projects → Results` and `Work → Roles`, rendered as
`.resume-detail-list li` and indented one step deeper than level 3. Education has no
level-4 items; Other Activities also stops at icon-led level-3 highlight rows. Its legacy
summary Note remains in data but is intentionally not rendered.

Card-header emojis are stored separately in the optional `headerIcon` field and rendered
inside `.resume-card-emoji.no-print`. They remain as visual cues on the web but are omitted
from print/PDF and the local `?print=1` preview to keep printed title baselines compact and
consistent.

Abstract-list emojis follow the same parity rule through
`.resume-abstract-emoji.no-print`: they support scanning on the web, while print/PDF relies
on the list marker and bold label without a redundant emoji marker.

### Single-item collapse rule

A level-3 row that would otherwise contain a level-4 list (currently only `Projects →
Results`) must render as **plain inline text**, not a one-item list, when it has exactly one
item and no separate description. In that case the row displays like `Role`:

```
🏆 Results — Architecture & Development — Led a Deep Agents vehicle SW verification platform
```

instead of a `Results` heading followed by a single bulleted child. Rationale: a list of one
item conveys no additional structure over inline text, and it costs an extra line of visual
weight (heading + list vs one row). When there are two or more items, the heading + list
form is kept because it genuinely groups distinct achievements.

Implementation: `_includes/pro/resume/projects.html` checks
`project.results.items.size == 1` and, if true, concatenates `description` (if any),
`item.header`, and `item.content` into one `.resume-meta-text` span using the same
`header — content` convention, instead of emitting
`.resume-results-list`.

## Visual system

All measurements below are the resolved (computed) values at the reference viewport used
during development (root font size 15px, screen mode). Print mode scales proportionally
(A4 physical width), so ratios — not absolute pixels — are what must match.

| Property | Level 2 (card header) | Level 3 (`.resume-meta-row`) | Level 4 (`.resume-detail-list li`) |
|---|---|---|---|
| `font-size` | `0.9342rem` | `0.9375rem` | `0.9375rem` |
| `line-height` | `1.3` | `1.35` | `1.35` |
| `display` | `block` | `flex` | `list-item` |
| Left indent (`x` from card padding) | card padding only | `+0.4rem` from card padding | one step deeper than level 3 |

Icons (level 3 only, IcoMoon font, `.resume-meta-icon`):

| Field | Icon |
|---|---|
| Role | `icon-user-tie` |
| Results | `icon-checkmark` |
| Growth | `icon-rocket` |
| Field (Education) | `icon-book` |
| Keywords (Education) | `icon-key` |

Vertical spacing between level-3 rows inside one card: the **first** row after the card
header gets `margin-top: calc(0.05rem + 1pt)` (a small gap from the header); every
**subsequent** row in the same card gets `margin-top: 0.0625rem` (1px at the 16px reference
root) so consecutive semantic rows remain compact but visually distinct.
This is expressed with two interchangeable class pairs in
`_sass/components/_resume-portfolio.scss`:

- First row: `.resume-role-row` (Projects) or `.resume-detail-row--first` (Work/Education)
- Subsequent rows: `.resume-results-heading` (Projects) or `.resume-detail-row--tight`
  (Work/Education)

`Work` and `Education` templates compute which field is first at render time (Liquid
`assign`/`split`) so the rule holds even if a field is omitted for a given entry.

## Content rules

1. **Up to two lines on web, one line in print.** No `white-space: nowrap`, no truncation,
   and no font-size reduction below the established scale to force a fit. If a row exceeds
   its limit, the fix is a shorter sentence, decided with the user — see
   [`.agents/skills/resume-lint/SKILL.md`](../../.agents/skills/resume-lint/SKILL.md).
2. **Single-item lists collapse to inline text** (see above).
3. **No literal unit labels duplicated in the value.** For example, Education's header
   shows `🎓 학사학위 · 금오공과대학교 (kit) · 4.3/4.5`, not `… · GPA 4.3/4.5`; the GPA figure
   does not need its own tag.
4. **External link underlines are preserved** on card titles (`.resume-card-title-link`);
   they are not suppressed for a "cleaner" look, since they are the only affordance that a
   title is a link.
5. **Bilingual parity.** Every field added to `resume-en.yml` needs a matching field in
   `resume-ko.yml` (and vice versa), including `labels.*` entries used by `Work`/`Education`
   (`role`, `roles`, `results`, `growth`, `area`, `keywords`, `gpa`).
6. **Preserve official capitalization.** Kumoh National Institute of Technology uses the
   official abbreviation `kit` in lowercase; do not normalize it to `KIT`.

## Print and web parity

Resume pages support a **local-only** print preview:

- `?print=1` (only on `localhost`/`127.0.0.1`) renders the page as if printed: it copies the
  site's `@media print` rules into a `<style>` tag active on screen, hides the
  navbar/sidebar/drawer, and centers a bordered A4 sheet (`210mm` width,
  `_sass/components/_print-preview.scss`).
- No `window.print()` call is ever triggered automatically — the mode is purely visual.
- A fixed toolbar (screen-only, hidden in real print via `_sass/components/_print-styles.scss`)
  offers:
  - **Zoom**: `50%`–`200%` CSS `zoom` on `#_main`, in `10%` steps, with a `100%` reset button.
  - **Physical calibration**: per-monitor correction (keyed by `screen.width × screen.height ×
    devicePixelRatio`, stored in `localStorage`) so the on-screen A4 sheet can be adjusted to
    match a printed page's physical size. Displayed as a signed millimeter correction
    (`-1mm`, `+2mm`, or `0mm` to reset), not a raw computed width.
- `Ctrl+A` / `Cmd+A` selects only `#_main` (the printable content), excluding the toolbar.
- Content longer than one A4 page renders as numbered sheets stacked vertically with a visible
  gap. Cards that would cross the printable bottom margin move intact to the next sheet. These
  screen-only sheets and spacers are removed on `beforeprint`, then restored on `afterprint`, so
  real browser/PDF pagination remains governed by `@media print`. Portfolio `cols=2` displays the
  sheet boundaries without synthetic card movement because CSS multi-column flow is repaginated
  by the real print engine.

Real PDF generation (`scripts/generate-pdf.js`, driven by `pdf-config.yml`) targets
`/en/resume` and `/ko/resume` directly (A4, `16mm` margin, `prefer_css_page_size: true`) and
runs in CI when Resume data, templates, or styles change. The print-preview mode exists so
that layout can be judged in a normal browser without running the Playwright-based PDF
pipeline for every iteration.

## Data contract

`_data/resume-{en,ko}.yml`:

```yaml
labels:
  role: Role         # Projects level-3 label
  roles: Roles       # Work level-3 label
  results: Results   # Projects level-3 label
  growth: Growth     # retained for legacy flat Work data
  area: Field        # Education level-3 label
  keywords: Keywords # Education level-3 label
  gpa: GPA           # kept for other consumers; not rendered as a literal label in Education

projects:
  - headerIcon: emoji       # optional; web only, omitted in print/PDF
    position: string
    company: string
    website: url            # optional
    startDate: "YYYY-MM-DD"
    endDate: "YYYY-MM-DD" | {}
    roles:
      description: string    # optional, plain text (Role row)
      items: [{ header, content }]   # optional, rendered as plain <li> (not level-4 styled)
    results:
      description: string    # optional
      items: [{ header, content }]   # 0 items → row omitted, 1 item → inline collapse,
                                      # 2+ items → heading + level-4 list
    skills:
      description: string
      items: [string]

work:
  - company: string
    headerIcon: emoji       # optional; web only, omitted in print/PDF
    position: string
    website: url
    startDate / endDate
    roles:
      items: [{ header, content }] # emphasized level-4 role items

education:
  - institution: string
    website: url
    area: string       # Field row
    thesis: string     # optional; appended to Field in parentheses
    headerIcon: emoji  # optional; web only, omitted in print/PDF
    studyType: string  # first card-header metadata, before institution
    gpa: string        # optional; appended after institution, no "GPA" text
    keywords: [string] # Keywords row, joined with middle dots
    startDate / endDate
```

Resume and Portfolio Work both use `roles: { description, items }`; Resume omits the
description and emphasizes its role-item headers, while Portfolio can include both a
description and detailed items. `_includes/pro/resume/work.html` retains the older flat
`role`/`results`/`growth` fields for backward compatibility. Education uses compact
`area`, `studyType`/`gpa`, and `keywords` fields and stops at level 3. See
[`docs/portfolio/DESIGN.md`](../portfolio/DESIGN.md) for why Portfolio keeps the itemized
form.

## Validation: resume-lint

`.agents/skills/resume-lint/scripts/lint-resume-layout.js` is the enforcement mechanism for
this document. It launches a headless browser against a local Jekyll server and checks,
across `/ko/resume`, `/en/resume` (and Portfolio equivalents), in both normal web layout and
`?print=1`:

- **Line wrapping**: every checked content row may use up to two lines on web and must
  render on one line in single-column print preview.
- **Level-3 alignment**: every `.resume-meta-row` (Projects `Role`/`Results`, Work
  `Roles`, Education `Field`/`Keywords`) must share the same `x` position,
  `display`, `font-size`, and `line-height` as Project's `.resume-role-row` (the reference).
- **Level-4 depth**: Project result items and Resume Work role items must stay indented
  deeper than level-3 rows, so the two levels never collapse into each other by accident.
- **Print contact spacing**: the contact row must keep equal top and bottom margins so it
  remains vertically separated from both the abstract and the first content section.
- **Page integrity**: every target must return a successful HTTP response and render the
  expected card/reference elements, so an empty or error page cannot pass silently.

Run it after any Resume/Portfolio data, template, or SCSS change:

```bash
node .agents/skills/resume-lint/scripts/lint-resume-layout.js
```

A non-zero exit code means a content or layout decision is needed — see the skill's
procedure for how to propose a fix rather than silently truncating text.

## Known limitations / alternatives considered

- **`Projects → Role.items`** still renders as a plain `<ul class="work">` list, not styled
  to the level-3/level-4 system and not covered by `resume-lint`'s wrap/indentation checks.
  It was left out of scope because no current data uses it with more than a placeholder, but
  a future pass should either delete the capability or promote it to the same contract as
  `Results.items`.
- We considered making the single-item collapse implicit (always inline unless `items.size >
  1`) versus explicit per-entry (`display: "list" | "inline"` field). We chose implicit
  (count-based) to avoid adding an authoring-time decision that could drift from what
  actually renders; the one time this could surprise an author is if they intended a
  single-item list to look like a list — that case does not currently exist in the data.

## Changelog

- Introduced local `?print=1` A4 preview reusing `@media print` rules on screen, with zoom
  and physical-calibration toolbar (no `window.print()` call).
- Unified `Projects`/`Work`/`Education` card padding, spacing, and compact date/period
  typography.
- Restructured `Work` and `Education` level-3 rows from a `grid`-based icon list (which had
  drifted to match Project's level-4 indentation) to `.resume-meta-row`, so all three
  sections share one hierarchy contract, verified by `resume-lint`.
- Kept `work.html` backward compatible with both structured `roles.description`/`roles.items`
  and older flat `role`/`results`/`growth` Work data.
- Restored Resume Work's `Roles` level-3 heading with emphasized level-4 role items and
  restored contextual emojis in Work, Project, and Education card headers.
- Split card-header emojis into `headerIcon` so web retains them while print/PDF omits them.
- Moved Education's degree and GPA into the card header and replaced the former `Degree`
  level-3 row with a `Keywords` row for knowledge gained during each program.
- Added the single-item collapse rule for `Projects → Results`.
- Extended `resume-lint` from a wrap-only checker to a level-3/level-4 hierarchy checker.
