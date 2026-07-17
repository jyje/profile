#!/usr/bin/env node

const { chromium } = require('playwright');

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4000').replace(/\/$/, '');
const targets = [
  { locale: 'ko', path: '/ko/resume' },
  { locale: 'en', path: '/en/resume' },
  { locale: 'ko', path: '/ko/portfolio' },
  { locale: 'en', path: '/en/portfolio' },
];
const views = [
  { name: 'web', suffix: '' },
  { name: 'print', suffix: '?print=1' },
  { name: 'print-2col', suffix: '?print=1&cols=2', portfolioOnly: true, allowWrapping: true },
];

const rowTypes = [
  {
    selector: '.resume-project-item .resume-meta-row, .resume-work-item .resume-meta-row, .resume-education-item .resume-meta-row',
    textSelector: '.resume-meta-text',
    labelSelector: '.resume-meta-label',
  },
  {
    selector: '.resume-project-item .resume-results-list li',
    textSelector: null,
    labelSelector: '.resume-result-title',
  },
  {
    selector: '.layout-resume .resume-work-item .resume-work-roles-list li',
    textSelector: null,
    labelSelector: '.resume-result-title',
  },
];

async function inspectIndentation(page) {
  return page.evaluate(() => {
    const level3Selector = '.resume-project-item .resume-role-row, .resume-project-item .resume-results-heading, .resume-work-item .resume-meta-row, .resume-education-item .resume-meta-row';
    const level3Rows = [...document.querySelectorAll(level3Selector)];
    const reference = document.querySelector('.resume-project-item .resume-role-row');
    if (level3Rows.length === 0 || !reference) return [];

    const metric = (row) => {
      const style = getComputedStyle(row);
      const rect = row.getBoundingClientRect();
      const card = row.closest('.resume-project-item, .resume-work-item, .resume-education-item');
      return {
        card: card?.querySelector('.resume-card-title')?.innerText.trim() || 'Unknown card',
        label: row.innerText.trim().split('\n')[0],
        x: rect.x,
        display: style.display,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
    };

    const expected = metric(reference);
    const tolerance = 0.5;

    const level3Violations = level3Rows.flatMap((row) => {
      const found = metric(row);
      const mismatches = [];
      if (Math.abs(found.x - expected.x) > tolerance) mismatches.push(`x ${found.x} != Project role-row x ${expected.x}`);
      if (found.display !== expected.display) mismatches.push(`display ${found.display} != ${expected.display}`);
      if (found.fontSize !== expected.fontSize) mismatches.push(`font-size ${found.fontSize} != ${expected.fontSize}`);
      if (found.lineHeight !== expected.lineHeight) mismatches.push(`line-height ${found.lineHeight} != ${expected.lineHeight}`);

      return mismatches.length > 0 ? [{ kind: 'level3-indentation', card: found.card, label: found.label, mismatches }] : [];
    });

    const level4Items = [...document.querySelectorAll('.resume-project-item .resume-results-list li, .layout-resume .resume-work-item .resume-work-roles-list li')];
    const level4Violations = level4Items.flatMap((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.x > expected.x + tolerance) return [];

      const card = item.closest('.resume-project-item, .resume-work-item');
      return [{
        kind: 'level4-indentation',
        card: card?.querySelector('.resume-card-title')?.innerText.trim() || 'Unknown card',
        label: item.innerText.trim().slice(0, 40),
        mismatches: [`level4 x ${rect.x} not deeper than level3 x ${expected.x}`],
      }];
    });

    return [...level3Violations, ...level4Violations];
  });
}

async function inspectContactSpacing(page) {
  return page.evaluate(() => {
    const contact = document.querySelector('.columns.contact');
    if (!contact) return [];

    const style = getComputedStyle(contact);
    const marginTop = Number.parseFloat(style.marginTop);
    const marginBottom = Number.parseFloat(style.marginBottom);
    const tolerance = 0.5;

    if (!Number.isFinite(marginTop) || !Number.isFinite(marginBottom) || Math.abs(marginTop - marginBottom) <= tolerance) {
      return [];
    }

    return [{
      kind: 'contact-spacing',
      card: 'Contact',
      label: 'vertical margin',
      mismatches: [`margin-top ${marginTop}px != margin-bottom ${marginBottom}px`],
    }];
  });
}

async function inspectTarget(page, target, view) {
  const response = await page.goto(`${baseUrl}${target.path}${view.suffix}`, { waitUntil: 'domcontentloaded' });
  if (!response || !response.ok()) {
    throw new Error(`${target.path}${view.suffix} returned HTTP ${response?.status() || 'unknown'}`);
  }
  if (view.name.startsWith('print')) {
    try {
      await page.waitForFunction(() => (
        document.body.classList.contains('print-preview')
        && document.getElementById('_printPreviewStyles')?.sheet
      ));
    } catch {
      throw new Error(`${target.path}${view.suffix} did not activate print preview styles`);
    }
  }
  try {
    await page.waitForFunction(() => [...document.styleSheets].some((sheet) => {
      try {
        return [...sheet.cssRules].some((rule) => rule.cssText.includes('resume-detail-list'));
      } catch {
        return false;
      }
    }));
  } catch {
    throw new Error(`${target.path}${view.suffix} did not load Resume/Portfolio styles`);
  }
  await page.evaluate(() => document.fonts.ready);

  const cardCount = await page.locator('.resume-project-item, .resume-work-item, .resume-education-item').count();
  const referenceCount = await page.locator('.resume-project-item .resume-role-row').count();
  if (cardCount === 0 || referenceCount === 0) {
    throw new Error(`${target.path}${view.suffix} did not render the expected resume cards`);
  }

  // Portfolio's optional two-column layout is intentionally narrow and
  // permits natural wrapping. Its contract is successful, non-empty render;
  // one-line and absolute-x invariants belong to web and single-column print.
  if (view.allowWrapping) return [];

  const violations = [];
  for (const rowType of rowTypes) {
    const maxLines = view.name === 'web' ? 2 : 1;
    const rows = await page.locator(rowType.selector).evaluateAll((elements, config) => elements.flatMap((row) => {
      const text = config.textSelector ? row.querySelector(config.textSelector) : row;
      const label = row.querySelector(config.labelSelector);
      const card = row.closest('.resume-project-item, .resume-work-item, .resume-education-item');

      if (!text || !label || !card) return [];

      const textStyle = getComputedStyle(text);
      const lineHeight = Number.parseFloat(textStyle.lineHeight);
      const textHeight = text.getBoundingClientRect().height;
      const wrapped = Number.isFinite(lineHeight) && textHeight > lineHeight * (config.maxLines + 0.5);

      if (!wrapped) return [];

      return [{
        card: card.querySelector('.resume-card-title')?.innerText.trim() || 'Unknown card',
        label: label.innerText.trim(),
        text: text.innerText.trim(),
        lines: Math.round(textHeight / lineHeight),
      }];
    }), { ...rowType, maxLines });
    violations.push(...rows);
  }

  return violations;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const violations = [];

  page.on('pageerror', (error) => console.error(`resume-lint: browser error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(`resume-lint: browser console: ${message.text()}`);
  });

  try {
    console.log('resume-lint: checking Resume and Portfolio in web and print preview.');
    for (const target of targets) {
      for (const view of views) {
        if (view.portfolioOnly && !target.path.includes('/portfolio')) continue;
        const rows = await inspectTarget(page, target, view);
        rows.forEach((row) => violations.push({ ...target, view: view.name, ...row }));
        if (view.name.startsWith('print')) {
          const contactSpacing = await inspectContactSpacing(page);
          contactSpacing.forEach((violation) => violations.push({ ...target, view: view.name, ...violation }));
        }
        if (!view.allowWrapping) {
          const indentation = await inspectIndentation(page);
          indentation.forEach((violation) => violations.push({ ...target, view: view.name, ...violation }));
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (violations.length === 0) {
    console.log('resume-lint: no wrapped or misindented Resume or Portfolio content rows found.');
    return;
  }

  console.error(`resume-lint: ${violations.length} Resume or Portfolio layout violation(s) found.`);
  for (const violation of violations) {
    if (violation.kind === 'level3-indentation' || violation.kind === 'level4-indentation' || violation.kind === 'contact-spacing') {
      console.error(`- [${violation.locale}/${violation.view}] ${violation.card} | ${violation.label} | ${violation.mismatches.join(', ')}`);
      continue;
    }
    console.error(`- [${violation.locale}/${violation.view}] ${violation.card} | ${violation.label} | ${violation.lines} lines`);
    console.error(`  ${violation.text}`);
  }
  if (violations.some((violation) => !violation.kind)) {
    console.error('Propose a shorter rewrite that fits the view line limit; do not hide, truncate, force-nowrap, or shrink the content.');
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`resume-lint: ${error.message}`);
  process.exitCode = 2;
});
