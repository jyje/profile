[![Publish GitHub Pages](https://github.com/jyje/profile/actions/workflows/publish-github-pages.yml/badge.svg?branch=main)](https://github.com/jyje/profile/actions/workflows/publish-github-pages.yml)

# profile

Personal portfolio website powered by Jekyll with Hydejack theme.

**Live Site**: [https://jyje.online](https://jyje.online)

## Features

- Resume and Projects pages with PDF download support
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

# Start local development server
bundle exec jekyll serve --force_polling --livereload
```

The site will be available at `http://localhost:4000`.

## PDF Generation

Resume and project portfolio PDFs are automatically generated during deployment when relevant files change.

### Configuration

PDF generation is configured via `pdf-config.yml` at the project root:

```yaml
# PDF targets to generate
targets:
  - path: /profile/resume
    output: jyje-resume-en.pdf
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
- `pdf-config.yml` - PDF configuration
- `_data/resume*.yml` or `_data/projects*.yml`
- `profile/` pages
- `_layouts/resume.html` or `_layouts/projects*.html`
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

## License

This project uses the [Hydejack](https://hydejack.com/) theme.
