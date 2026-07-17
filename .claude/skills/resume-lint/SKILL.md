---
name: resume-lint
description: "Lint Resume and Portfolio web and print-preview layouts for wrapped content rows. Use when editing resume or portfolio data, Liquid templates, or SCSS; when the user asks to check line wrapping, one-line layout, print layout, portfolio layout, or resume-lint."
---

# Resume and Portfolio Layout Lint

Use this skill after changing Resume or Portfolio YAML, Liquid templates, or shared styles. It detects wrapped and inconsistently indented content rows in both the normal web layout and local A4 print preview.

## Rule

Resume and Portfolio content rows may use up to two lines on the web and must render on one line in print preview. Do not solve a violation by hiding, truncating, shrinking text below the established page scale, or adding `white-space: nowrap`; those approaches either obscure content or cause overflow.

A violation needs a content decision. Present the user with a concise one-line rewrite proposal that preserves the original meaning, then apply it only after confirmation.

Project result lists, Work detail lists, Education detail rows, and Other Activities highlights must use the same indentation contract. Render level-3 content in a `.resume-detail-group` with `.resume-meta-row`; use `.resume-detail-list` only for genuine level-4 items. Icon-led rows may change only their icon and row layout; they must not override the shared horizontal indentation.

### Hierarchy contract

Resume cards use four levels, defined by Project (the reference implementation):

1. Section (`Projects` / `Work` / `Education` / `Other Activities`)
2. Card header (date range, then Work position/company or Education degree/institution/GPA)
3. Semantic row (Project `Role` / `Results`, Work `Roles`, Education `Field` / `Keywords`, Other Activities highlights) — rendered as `.resume-meta-row`, left-aligned with Project's `.resume-role-row` / `.resume-results-heading` (same `x`, `display: flex`, font size, and line height). Education's degree/GPA are compact metadata in the card header; an optional thesis is appended parenthetically to the `Field` value.
4. Detail item under a level-3 row (Project result bullets or Resume Work role bullets) — indented one step deeper than level 3, using `.resume-detail-list`

Education and Other Activities stop at level 3. Resume Work uses a level-3 `Roles` heading with emphasized level-4 role items. Do not reintroduce a grid-based icon list; always render level-3 rows as `.resume-meta-row` so they stay synced with Project automatically.

## Procedure

1. Ensure the local Jekyll server is available. The default URL is `http://127.0.0.1:4000`.
2. Run the layout linter from the repository root:

   ```bash
   node .agents/skills/resume-lint/scripts/lint-resume-layout.js
   ```

   To lint another running local server:

   ```bash
   node .agents/skills/resume-lint/scripts/lint-resume-layout.js http://127.0.0.1:4001
   ```

3. If it reports no violations, proceed with the normal build validation.
4. For every violation, report the locale, view (`web` or `print`), card title, detail label, and original text. Propose one or two rewrites that fit the applicable limit: two lines on web or one line in print.
5. Wait for the user's choice before editing Resume or Portfolio YAML. Preserve factual meaning and bilingual parity when editing Korean and English data.
6. Rerun the linter after the edit. Also run a Jekyll build when templates or SCSS changed:

   ```bash
   bundle exec jekyll build --incremental
   ```

## Scope

- Checks `/ko/resume`, `/en/resume`, `/ko/portfolio`, and `/en/portfolio`.
- Checks each URL as normal web layout and `?print=1` local A4 preview.
- Also checks that Portfolio renders successfully with cards in `?print=1&cols=2`. Natural wrapping is allowed in this intentionally narrow mode; the two-line web and one-line print limits apply elsewhere.
- Fails when a target returns a non-success HTTP response or does not render the expected cards, preventing empty/error pages from passing silently.
- Checks every `.resume-meta-row` (Project role/results, Work roles, Education field/keywords, Other Activities highlights), every Project level-4 result item, and every Resume Work level-4 role item against the two-line web and one-line print limits.
- Verifies all level-3 `.resume-meta-row` elements share the same `x`, `display`, `font-size`, and `line-height` as Project's `.resume-role-row` (the reference).
- Verifies Project's level-4 result items stay indented deeper than level-3 rows.
- Verifies the contact row has equal top and bottom margins in print preview, including Portfolio's optional two-column mode.
- Verifies Resume and Portfolio print-preview columns remain inside the A4 sheet at 900px, 1200px, 1920px, and 2560px browser widths.
- Verifies overflowing previews render as vertically stacked A4 sheets and keeps each card inside one page's printable area in single-column print. In Portfolio `cols=2`, verify the sheets but leave card flow to the browser's paged-media engine.
- Returns a non-zero exit code when any row wraps, hierarchy shifts, or print-preview page boundary is violated, so it can be used in a local pre-commit workflow.
