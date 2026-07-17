[![Publish GitHub Pages](https://github.com/jyje/profile/actions/workflows/publish-github-pages.yml/badge.svg?branch=main)](https://github.com/jyje/profile/actions/workflows/publish-github-pages.yml)

# profile

Personal portfolio website powered by Jekyll with Hydejack theme.

**Live Site**: [https://jyje.online](https://jyje.online)

## Features

- Resume and Portfolio pages with PDF download support
- Automatic PDF generation during CI/CD
- Korean and English language support
- Blog posts, certifications, and works showcase

## Development

### Prerequisites

- Ruby 3.3+
- Node.js 20+
- Bundler

### Setup

```bash
# Install Ruby dependencies
bundle install

# Update dependencies
bundle update --bundler

# Install Node.js dependencies
npm install

# Update Node.js dependencies
npm update

# Install Bower dependencies (for KaTeX and MathJax)
cd assets && npx bower install && cd ..

# Start local development server
bundle exec jekyll serve --force_polling --livereload
```

The site will be available at `http://localhost:4000`.

## Print Mode

The maintained Resume and Portfolio pages support a local A4 print-preview mode. Append
`?print=1` while the site is running on `localhost` or `127.0.0.1`; the preview is disabled on
the public site and does not open the browser print dialog automatically.

| Page | Web path | Local print preview |
| --- | --- | --- |
| English Resume | `/en/resume` | `/en/resume?print=1` |
| Korean Resume | `/ko/resume` | `/ko/resume?print=1` |
| English Portfolio | `/en/portfolio` | `/en/portfolio?print=1` |
| Korean Portfolio | `/ko/portfolio` | `/ko/portfolio?print=1` |

Resume preview uses a fixed 70/30 two-column A4 layout. Portfolio preview is one column by
default; append `&cols=2` (for example, `/ko/portfolio?print=1&cols=2`) to inspect its optional
two-column layout. The preview toolbar controls visual zoom and per-monitor physical-size
calibration without changing the A4 content layout. When content exceeds one page, the preview
stacks numbered A4 sheets vertically and moves a card that would cross the bottom margin to the
next sheet. Portfolio's optional `cols=2` preview shows the same page boundaries while leaving
its multi-column card flow to the browser's real print engine.

The same four pages are the supported PDF-generation targets in `pdf-config.yml`. Use the
page's Print button or the browser print command for direct printing; use the generated PDF
button for the CI-built A4 artifact.

## PDF Generation

Resume and project portfolio PDFs are automatically generated during deployment when relevant files change.

### Configuration

PDF generation is configured via `pdf-config.yml` at the project root:

```yaml
# PDF targets to generate
targets:
  - path: /en/resume
    output: jeayoungjeon-resume-en.pdf
    title: "Resume - Jeayoung Jeon"
  # ... more targets

# PDF options (format, margins, etc.)
pdf_options:
  format: A4
  margin:
    top: 16mm
    # ...
```

### Local PDF Generation

To generate PDFs locally:

```bash
# 1. First, build the Jekyll site
bundle exec jekyll build

# 2. Install Playwright browser (first time only)
npx playwright install chromium

# 3. Generate PDFs
npm run generate-pdf
```

PDFs will be created in the `assets/` directory (as configured in `pdf-config.yml`).

### CI/CD PDF Generation

PDFs are automatically generated during GitHub Actions deployment when changes are detected in:
- `pdf-config.yml` - PDF configurations
- `_data/resume*.yml` or `_data/portfolio*.yml`
- `profile/` pages
- `_layouts/resume.html` or `_layouts/portfolio*.html`
- `_includes/pro/resume/` templates
- `_sass/` stylesheets
- `scripts/generate-pdf.js`

To force PDF regeneration, use the "Run workflow" button in GitHub Actions with the "Force PDF generation" option enabled.

## Building

```bash
# Production build
JEKYLL_ENV=production bundle exec jekyll build

# Build JavaScript/CSS assets
npm run build
```

## Dependency Management

### Bower Dependencies

This project uses Bower to manage frontend dependencies (KaTeX, MathJax). These dependencies are automatically installed during CI/CD, but you need to install them manually for local development:

```bash
# Install Bower dependencies
cd assets && npx bower install && cd ..

# Or from project root
cd assets
npx bower install
cd ..
```

**Note**: `assets/bower_components/` is gitignored and will be automatically installed during CI/CD builds. You don't need to commit these files.

## License

This project uses the [Hydejack](https://hydejack.com/) theme.
