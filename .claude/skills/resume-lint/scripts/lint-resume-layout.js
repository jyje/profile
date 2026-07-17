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
const printPreviewViewportWidths = [900, 1200, 1920, 2560];

const rowTypes = [
  {
    selector: '.resume-project-item .resume-meta-row, .resume-work-item .resume-meta-row, .resume-education-item .resume-meta-row',
    textSelector: '.resume-meta-text',
    labelSelector: '.resume-meta-label',
  },
  {
    selector: '.resume-volunteer-item .resume-meta-row',
    textSelector: '.resume-meta-text',
    labelSelector: null,
    fallbackLabel: 'Highlight',
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
    const level3Selector = '.resume-project-item .resume-role-row, .resume-project-item .resume-results-heading, .resume-work-item .resume-meta-row, .resume-education-item .resume-meta-row, .resume-volunteer-item .resume-meta-row';
    const level3Rows = [...document.querySelectorAll(level3Selector)];
    const reference = document.querySelector('.resume-project-item .resume-role-row');
    if (level3Rows.length === 0 || !reference) return [];

    const metric = (row) => {
      const style = getComputedStyle(row);
      const rect = row.getBoundingClientRect();
      const card = row.closest('.resume-project-item, .resume-work-item, .resume-education-item, .resume-volunteer-item');
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

async function inspectPrintPreviewBounds(page, target, viewportWidth) {
  await page.setViewportSize({ width: viewportWidth, height: 900 });
  const response = await page.goto(`${baseUrl}${target.path}?print=1`, { waitUntil: 'domcontentloaded' });
  if (!response || !response.ok()) {
    throw new Error(`${target.path}?print=1 returned HTTP ${response?.status() || 'unknown'}`);
  }
  try {
    await page.waitForFunction(() => (
      document.body.classList.contains('print-preview')
      && document.getElementById('_printPreviewStyles')?.sheet
    ));
  } catch {
    throw new Error(`${target.path}?print=1 did not activate print preview styles`);
  }

  return page.evaluate((width) => {
    const sheet = document.getElementById('_main')?.getBoundingClientRect();
    if (!sheet) return [];

    const tolerance = 1;
    return [...document.querySelectorAll('#_main .columns-break')].flatMap((columns, index) => {
      const rect = columns.getBoundingClientRect();
      const leftOverflow = sheet.left - rect.left;
      const rightOverflow = rect.right - sheet.right;
      if (leftOverflow <= tolerance && rightOverflow <= tolerance) return [];

      return [{
        kind: 'print-preview-bounds',
        card: index === 0 ? 'Contact columns' : 'Content columns',
        label: `${width}px viewport`,
        mismatches: [
          `columns [${rect.left.toFixed(1)}, ${rect.right.toFixed(1)}] exceed A4 sheet [${sheet.left.toFixed(1)}, ${sheet.right.toFixed(1)}]`,
        ],
      }];
    });
  }, viewportWidth);
}

async function inspectPrintPreviewPagination(page, allowCardCrossing = false) {
  try {
    await page.waitForFunction(() => Number(document.getElementById('_main')?.dataset.printPreviewPages) > 0);
  } catch {
    return [{
      kind: 'print-preview-pagination',
      card: 'A4 preview',
      label: 'page sheets',
      mismatches: ['print preview pagination did not finish'],
    }];
  }

  return page.evaluate((allowCardCrossing) => {
    const main = document.getElementById('_main');
    const sheets = [...document.querySelectorAll('.print-preview-page-sheet')];
    if (!main || sheets.length === 0) {
      return [{
        kind: 'print-preview-pagination',
        card: 'A4 preview',
        label: 'page sheets',
        mismatches: ['no A4 page sheets rendered'],
      }];
    }

    const mainRect = main.getBoundingClientRect();
    const scale = main.offsetWidth > 0 ? mainRect.width / main.offsetWidth : 1;
    const geometry = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: (rect.top - mainRect.top) / scale,
        bottom: (rect.bottom - mainRect.top) / scale,
        height: rect.height / scale,
      };
    };
    const sheetGeometry = sheets.map(geometry);
    const pageHeight = sheetGeometry[0].height;
    const pageGap = sheetGeometry.length > 1 ? sheetGeometry[1].top - sheetGeometry[0].bottom : 24;
    const pagePeriod = pageHeight + pageGap;
    const mainStyle = getComputedStyle(main);
    const paddingTop = Number.parseFloat(mainStyle.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(mainStyle.paddingBottom) || 0;
    const contentHeight = pageHeight - paddingTop - paddingBottom;
    const expectedPageCount = Number(main.dataset.printPreviewPages);
    const violations = [];

    if (expectedPageCount !== sheets.length) {
      violations.push({
        kind: 'print-preview-pagination',
        card: 'A4 preview',
        label: 'page count',
        mismatches: [`data page count ${expectedPageCount} != ${sheets.length} rendered sheets`],
      });
    }

    if (allowCardCrossing) return violations;

    const selector = [
      '.resume-project-item',
      '.resume-work-item',
      '.resume-education-item',
      '.resume-volunteer-item',
      '.awards-item',
      '.certificates-item',
      'blockquote.reference',
      '.layout-portfolio .column-3-0 > section > section',
    ].join(',');

    [...new Set(document.querySelectorAll(selector))].forEach((card) => {
      const rect = geometry(card);
      if (rect.height > contentHeight) return;

      const pageIndex = Math.max(0, Math.floor(rect.top / pagePeriod));
      const pageStart = pageIndex * pagePeriod;
      const contentTop = pageStart + paddingTop;
      const contentBottom = pageStart + pageHeight - paddingBottom;
      if (rect.top >= contentTop - 1 && rect.bottom <= contentBottom + 1) return;

      violations.push({
        kind: 'print-preview-pagination',
        card: card.querySelector('.resume-card-title')?.innerText.trim() || card.innerText.trim().slice(0, 60) || 'Unknown card',
        label: `page ${pageIndex + 1}`,
        mismatches: [`card [${rect.top.toFixed(1)}, ${rect.bottom.toFixed(1)}] crosses printable area [${contentTop.toFixed(1)}, ${contentBottom.toFixed(1)}]`],
      });
    });

    return violations;
  }, allowCardCrossing);
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

  const cardCount = await page.locator('.resume-project-item, .resume-work-item, .resume-education-item, .resume-volunteer-item').count();
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
      const label = config.labelSelector ? row.querySelector(config.labelSelector) : null;
      const card = row.closest('.resume-project-item, .resume-work-item, .resume-education-item, .resume-volunteer-item');

      if (!text || !card || (config.labelSelector && !label)) return [];

      const textStyle = getComputedStyle(text);
      const lineHeight = Number.parseFloat(textStyle.lineHeight);
      const textHeight = text.getBoundingClientRect().height;
      const wrapped = Number.isFinite(lineHeight) && textHeight > lineHeight * (config.maxLines + 0.5);

      if (!wrapped) return [];

      return [{
        card: card.querySelector('.resume-card-title')?.innerText.trim() || 'Unknown card',
        label: label?.innerText.trim() || config.fallbackLabel || 'Content',
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
          const pagination = await inspectPrintPreviewPagination(page, view.allowWrapping);
          pagination.forEach((violation) => violations.push({ ...target, view: view.name, ...violation }));
        }
        if (!view.allowWrapping) {
          const indentation = await inspectIndentation(page);
          indentation.forEach((violation) => violations.push({ ...target, view: view.name, ...violation }));
        }
      }
      for (const viewportWidth of printPreviewViewportWidths) {
        const bounds = await inspectPrintPreviewBounds(page, target, viewportWidth);
        bounds.forEach((violation) => violations.push({ ...target, view: 'print', ...violation }));
      }
      await page.setViewportSize({ width: 1200, height: 900 });
    }
  } finally {
    await browser.close();
  }

  if (violations.length === 0) {
    console.log('resume-lint: no wrapped, misindented, or out-of-bounds Resume or Portfolio content found.');
    return;
  }

  console.error(`resume-lint: ${violations.length} Resume or Portfolio layout violation(s) found.`);
  for (const violation of violations) {
    if (violation.kind === 'level3-indentation' || violation.kind === 'level4-indentation' || violation.kind === 'contact-spacing' || violation.kind === 'print-preview-bounds' || violation.kind === 'print-preview-pagination') {
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
