---
name: check-build-prod
description: Run Jekyll production build to match CI (GitHub Actions). Use when verifying SCSS/layout changes before push, debugging CI-only build failures, or when the user asks to check production build.
---

# Check production build (CI parity)

## When to use

- Before pushing changes that touch `_includes/styles/`, `_sass/`, or `_config.yml`
- When CI fails but local `bundle exec jekyll build` passes
- When the user asks to "check production build" or "verify CI build locally"

## Why it matters

CI runs with `JEKYLL_ENV=production` and `GITHUB_PAGES=true`. Default local build does not, so:

- **Production**: Uses the "no inline CSS" path → compiles `style.scss` with `__link__` partials and the main stylesheet.
- **Development**: Uses the "inline CSS" path → different SCSS entry (e.g. inline.scss via scssify) and `.pre` partials.

Sass errors like "namespace base", "Undefined variable", or "$accent-color" duplicate often appear only in production build.

## Command

Run from the project root:

```bash
JEKYLL_ENV=production GITHUB_PAGES=true bundle exec jekyll build --baseurl ""
```

- Success: build finishes with exit code 0 (deprecation warnings for `@import` are acceptable).
- Failure: fix reported Sass/Liquid errors; production and CI use the same code path.

## Optional: quick check before commit

After editing styles or config, run the production build once to catch CI-only failures before pushing.
