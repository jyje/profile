# Project Context and Guidelines

This document provides project structure, technology stack, and working guidelines to help AI agents understand and work with this project.

## Project Overview

This project is the official portfolio site for developer Jeayoung Jeon (전제영).

- **Site URL**: https://jyje.online
- **Purpose**: Static website for managing developer profile, resume, and portfolio
- **Main Deliverables**: 
  - Website (static HTML)
  - Resume PDF files (Korean/English)
  - Project portfolio PDF files (Korean/English)

## Technology Stack

### Build System
- **Jekyll**: 3.9.2 (Ruby-based static site generator)
- **Webpack**: JavaScript/CSS bundling
- **Ruby**: 3.3
- **Node.js**: 20

### Theme and Framework
- **Hydejack**: 9.2.0 (Jekyll theme, fork of Hyde)
- **SCSS**: Stylesheet preprocessor
- **KaTeX**: Mathematical formula rendering

### Deployment
- **GitHub Pages**: Automatic deployment
- **GitHub Actions**: CI/CD pipeline

### Key Plugins
- jekyll-seo-tag: SEO optimization
- jekyll-sitemap: Sitemap generation
- jekyll-feed: RSS feed
- jekyll-mermaid: Diagram rendering
- jekyll-last-modified-at: Last modified date tracking

## Project Structure

```
profile/
├── _config.yml              # Jekyll main configuration file
├── _data/                   # YAML data files
│   ├── resume-en.yml        # Resume data (English)
│   ├── resume-ko.yml        # Resume data (Korean)
│   ├── projects-en.yml      # Project portfolio data (English)
│   ├── projects-ko.yml     # Project portfolio data (Korean)
│   ├── authors.yml         # Author information
│   ├── social.yml          # Social media links
│   └── ...
├── _layouts/               # Layout templates
│   ├── home.html          # Homepage layout
│   ├── resume.html        # Resume layout
│   ├── project.html       # Project layout
│   └── ...
├── _includes/              # Reusable components
│   ├── body/              # Page body components
│   ├── components/        # UI components
│   ├── head/              # Header components
│   └── ...
├── _sass/                  # SCSS stylesheets
│   ├── my-style.scss      # Custom styles
│   └── ...
├── _js/                    # JavaScript source files
│   └── src/               # JS bundled by Webpack
├── assets/                 # Static assets
│   ├── img/               # Image files
│   │   ├── certtifications/  # Certification images
│   │   ├── profile/       # Profile images
│   │   └── ...
│   ├── js/                # Built JavaScript files
│   └── *.pdf              # PDF files (auto-generated, gitignored)
├── scripts/                # Build and automation scripts
│   └── generate-pdf.js    # PDF generation script (Playwright-based)
├── pdf-config.yml          # PDF generation configuration
├── profile/                # Profile-related pages
│   ├── resume.md          # Resume page
│   ├── projects.md        # Projects page
│   └── ko/                # Korean pages
├── posts/                  # Blog post collection
│   └── _posts/
├── works/                  # Works collection
│   └── _posts/
├── certifications/         # Certifications collection
│   └── _posts/
├── articles/               # Articles collection
│   └── _posts/
├── .github/                # GitHub settings
│   └── workflows/
│       └── publish-github-pages.yml  # Deployment workflow
├── Gemfile                 # Ruby dependencies
├── package.json            # Node.js dependencies
└── webpack.config.js       # Webpack configuration
```

## Key Files Description

### Configuration Files

#### `_config.yml`
Jekyll's main configuration file. It includes:
- Site metadata (title, description, URL, etc.)
- Hydejack theme settings
- Collection definitions (works, certifications, articles, etc.)
- Plugin settings
- SEO settings
- Google Analytics, Giscus comment system settings

#### `Gemfile`
Defines Ruby gem dependencies:
- `jekyll`: Jekyll core
- `jekyll-theme-hydejack`: Hydejack theme
- `kramdown-math-katex`: Mathematical formula rendering
- Other Jekyll plugins

#### `package.json`
Defines Node.js dependencies and build scripts:
- Webpack and related loaders
- Build scripts: `npm run build`, `npm run watch`
- JavaScript/CSS bundling configuration
- PDF generation: `npm run generate-pdf`
- Playwright for headless browser PDF rendering

### Data Files

#### `_data/resume-en.yml` / `_data/resume-ko.yml`
Stores resume data in YAML format:
- `basics`: Basic information (name, email, LinkedIn, etc.)
- `work`: Work experience
- `education`: Education
- `skills`: Technical skills
- `awards`: Awards
- `publications`: Papers/publications
- `certificates`: Certifications
- `languages`: Language proficiency
- `interests`: Interests

#### `_data/projects-en.yml` / `_data/projects-ko.yml`
Stores project portfolio data:
- Detailed information per project
- Roles and contributions
- Technical stack
- Results and achievements

## Build and Deployment Process

### Local Development Environment Setup

1. **Install Dependencies**
   ```bash
   # Install Ruby dependencies
   bundle install
   
   # Install Node.js dependencies
   npm install
   ```

2. **Run Local Server**
   ```bash
   # Start Jekyll server (with auto-reload)
   bundle exec jekyll serve --force_polling --livereload
   ```
   
   Or watch JavaScript/CSS in development mode:
   ```bash
   # In a separate terminal
   npm run watch
   ```

3. **Production Build**
   ```bash
   # Build JavaScript/CSS
   npm run build
   
   # Build Jekyll
   bundle exec jekyll build
   ```

### Deployment Process

Deployment is performed automatically via GitHub Actions:

1. **Trigger**: Automatically runs on push to `main` branch
2. **Build Step**:
   - Setup Ruby 3.3 environment
   - Setup Node.js 20 environment
   - Run `bundle install` and `npm ci`
   - Run `bundle exec jekyll build` (production mode)
3. **Conditional PDF Generation** (when relevant files change):
   - Install Playwright browser and Korean fonts
   - Generate PDFs to `_site/assets/` directory
   - PDFs are included in the deployment automatically
4. **Deployment Step**: Automatic deployment to GitHub Pages

Workflow file: `.github/workflows/publish-github-pages.yml`

#### PDF Generation Trigger Conditions

PDFs are regenerated when any of these files change:
- `pdf-config.yml` - PDF generation configuration
- `_data/resume*.yml` or `_data/projects*.yml`
- `profile/` pages
- `_layouts/resume.html` or `_layouts/projects*.html`
- `_includes/pro/resume/` templates
- `_sass/` stylesheets
- `scripts/generate-pdf.js`

You can also force PDF regeneration via the GitHub Actions "Run workflow" button with the "Force PDF generation" option.

## Data Structure and Working Guidelines

### Modifying Resume Data

To modify resume information, edit `_data/resume-en.yml` (English) or `_data/resume-ko.yml` (Korean).

**Notes**:
- Follow YAML syntax precisely (indentation, quotes, etc.)
- Date format: `"YYYY-MM-DD"` (e.g., `"2026-02-24"`)
- Empty end dates should be `{}`
- Maintain consistency between multilingual versions

**Key Sections**:
- `work`: Work experience (company, position, period, roles)
- `education`: Education (school, major, degree, period)
- `skills`: Technical stack (grouped by category, `*` indicates expertise)
- `certificates`: Certifications (title, issuer, verification date, expiration date, link)

### Modifying Project Portfolio

To modify project information, edit `_data/projects-en.yml` (English) or `_data/projects-ko.yml` (Korean).

**Structure**:
- Each project has `position`, `company`, `startDate`, `endDate` fields
- `roles`: Roles and contributions
- `results`: Project results and achievements
- `skills`: Technical stack used

### PDF File Management

Resume and project PDF files are automatically generated during CI/CD:
- `jeayoungjeon-resume-en.pdf`: Resume (English)
- `jeayoungjeon-resume-ko.pdf`: Resume (Korean)
- `jeayoungjeon-projects-en.pdf`: Project portfolio (English)
- `jeayoungjeon-projects-ko.pdf`: Project portfolio (Korean)

**Important Notes**:
- PDF files are **gitignored** - they are generated during build, not stored in git
- PDFs are generated to `_site/assets/` during CI and included in deployment
- For local development, PDFs are generated to `assets/` directory
- Uses Playwright with Chromium for high-quality rendering with Korean font support

#### PDF Configuration File

PDF generation is configured via `pdf-config.yml` at the project root:

```yaml
# PDF targets to generate
targets:
  - path: /en/profile/resume      # Page path
    output: jeayoungjeon-resume-en.pdf # Output filename
    title: "Resume - Jeayoung Jeon"

# PDF options
pdf_options:
  format: A4
  margin:
    top: 16mm
    right: 16mm
    bottom: 16mm
    left: 16mm

# Browser viewport for rendering
viewport:
  width: 1200
  height: 800
  device_scale_factor: 2

# Timeout settings (ms)
timeout:
  navigation: 30000
  fonts: 5000
```

#### Local PDF Generation

```bash
# 1. Build Jekyll site first
bundle exec jekyll build

# 2. Install Playwright browser (first time only)
npx playwright install chromium

# 3. Generate PDFs
npm run generate-pdf
```

#### Environment Variables

- `PDF_OUTPUT_DIR`: Output directory (default: `assets`, CI: `_site/assets`)
- `PDF_CONFIG`: Config file path (default: `pdf-config.yml`)
- `SITE_DIR`: Jekyll build directory (default: `_site`)

### Adding New Posts/Works

#### Blog Posts
```bash
# Using Jekyll Compose
bundle exec jekyll post "Post Title"

# Or create directly
# posts/_posts/YYYY-MM-DD-post-title.md
```

#### Works
```bash
bundle exec jekyll work "Work Title"
```

#### Certifications
```bash
bundle exec jekyll certification "Certification Title"
```

**Front Matter Example**:
```yaml
---
layout: post  # or work, project, etc.
title: "Title"
description: "Description"
image: /assets/img/path/to/image.jpg
tags: [tag1, tag2]
---
```

### Multilingual Support

This project supports Korean and English:
- Data files: Korean versions distinguished by `-ko.yml` suffix
- Pages: Korean pages in `profile/ko/` directory
- `_config.yml` setting: `lang: en-US, ko-KR`

### Commit Message Rules

- **Language**: Write in English
- **Format**: Concise and clear
- Examples:
  - `Update resume with new position`
  - `Add new project to portfolio`
  - `Fix typo in resume-ko.yml`

## Important Notes

1. **YAML Syntax**: Use 2 spaces for indentation, no tabs
2. **Date Format**: Follow ISO 8601 format (`YYYY-MM-DD`)
3. **Image Paths**: Use relative paths from `/assets/img/`
4. **Build Testing**: Recommended to test builds locally before applying changes
5. **Data Consistency**: Maintain consistency between English/Korean versions
6. **PDF Generation**: PDFs are auto-generated during CI/CD when resume/project data changes

## Recommendations and Improvements

### Short-term Improvements

1. ~~**Automated Resume PDF Generation**~~ ✅ **Implemented**
   - PDF generation script: `scripts/generate-pdf.js`
   - Uses Playwright for high-quality rendering
   - Integrated with GitHub Actions (conditional execution)
   - Supports Korean fonts (Noto Sans KR)

2. **Data Consistency Validation**
   - Script to validate YAML file syntax and structure
   - Verify required fields match between English/Korean versions
   - Date format validation

3. **Image Optimization**
   - Automate image compression
   - Consider WebP format conversion
   - Generate responsive images

### Medium-term Improvements

4. **SEO Optimization**
   - Automatic meta tag generation
   - Add structured data (JSON-LD)
   - Improve Open Graph tags

5. **Performance Optimization**
   - Optimize JavaScript bundle size
   - CSS optimization and Critical CSS extraction
   - Image lazy loading

6. **Accessibility Improvements**
   - Add ARIA labels
   - Improve keyboard navigation
   - Validate color contrast

### Long-term Improvements

7. **CI/CD Improvements**
   - Set up notifications for build failures
   - Preview deployments (per Pull Request)
   - Optimize build time

8. **Monitoring and Analytics**
   - Verify Google Analytics setup
   - Integrate error tracking tools
   - Performance monitoring

9. **Documentation**
   - Improve README.md
   - Write developer guide
   - API documentation (if needed)

## Useful Commands

```bash
# Start local server
bundle exec jekyll serve --force_polling --livereload

# Production build
JEKYLL_ENV=production bundle exec jekyll build

# Build JavaScript/CSS
npm run build

# Watch mode for JavaScript/CSS
npm run watch

# Generate PDF files (requires Jekyll build first)
bundle exec jekyll build && npm run generate-pdf

# Install Playwright browser (first time only)
npx playwright install chromium

# Create new post
bundle exec jekyll post "Post Title"

# Create new work
bundle exec jekyll work "Work Title"

# Update dependencies
bundle update
npm update
```

## References

- [Jekyll Official Documentation](https://jekyllrb.com/docs/)
- [Hydejack Theme Documentation](https://hydejack.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [YAML Syntax Guide](https://yaml.org/spec/1.2.2/)
