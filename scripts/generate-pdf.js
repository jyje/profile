#!/usr/bin/env node

/**
 * PDF Generation Script for jyje.online Portfolio
 * 
 * This script generates PDF files from the Jekyll-built resume and projects pages
 * using Playwright for high-quality rendering with proper Korean font support.
 * 
 * Configuration is loaded from pdf-config.yml at the project root.
 * 
 * Usage:
 *   node scripts/generate-pdf.js [--config=pdf-config.yml] [--output-dir=assets]
 * 
 * Environment Variables:
 *   SITE_DIR       - Jekyll build directory (default: _site)
 *   PDF_OUTPUT_DIR - PDF output directory (default: assets, CI: _site/assets)
 *   PDF_CONFIG     - Path to config file (default: pdf-config.yml)
 *   PORT           - Local server port (default: from config or 8080)
 *   BASE_URL       - Base URL for pages (default: starts local server)
 * 
 * Requirements:
 *   - Playwright installed with Chromium browser
 *   - Jekyll site built in _site directory (or specified directory)
 *   - pdf-config.yml configuration file
 * 
 * Examples:
 *   # Local development
 *   npm run generate-pdf
 * 
 *   # CI environment (output to _site/assets)
 *   PDF_OUTPUT_DIR=_site/assets npm run generate-pdf
 */

const { chromium } = require('playwright');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const http = require('http');

/**
 * Load configuration from YAML file
 */
function loadConfig(configPath) {
  const fullPath = path.resolve(configPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Config file not found: ${fullPath}`);
    process.exit(1);
  }
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const config = yaml.load(fileContents);
    console.log(`📋 Loaded config from: ${configPath}`);
    return config;
  } catch (error) {
    console.error(`❌ Failed to parse config file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Convert YAML config to internal format
 */
function parseConfig(yamlConfig, overrides = {}) {
  const pdfOptions = yamlConfig.pdf_options || {};
  
  return {
    siteDir: overrides.siteDir || process.env.SITE_DIR || '_site',
    port: overrides.port || parseInt(process.env.PORT) || yamlConfig.server?.port || 8080,
    baseUrl: overrides.baseUrl || process.env.BASE_URL || null,
    outputDir: overrides.outputDir || process.env.PDF_OUTPUT_DIR || 'assets',
    
    targets: yamlConfig.targets || [],
    
    pdfOptions: {
      format: pdfOptions.format || 'A4',
      printBackground: pdfOptions.print_background !== false,
      preferCSSPageSize: pdfOptions.prefer_css_page_size !== false,
      displayHeaderFooter: pdfOptions.display_header_footer || false,
      margin: pdfOptions.margin || {
        top: '16mm',
        right: '16mm',
        bottom: '16mm',
        left: '16mm'
      }
    },
    
    viewport: {
      width: yamlConfig.viewport?.width || 1200,
      height: yamlConfig.viewport?.height || 800,
      deviceScaleFactor: yamlConfig.viewport?.device_scale_factor || 2
    },
    
    timeout: {
      navigation: yamlConfig.timeout?.navigation || 30000,
      fonts: yamlConfig.timeout?.fonts || 5000,
      network: yamlConfig.timeout?.network || 3000,
      render: yamlConfig.timeout?.render || 2000
    }
  };
}

/**
 * Simple static file server for the Jekyll site
 * Returns an object with { server, port } where port is the actual port the server is listening on
 */
function createServer(siteDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      let filePath = path.join(siteDir, urlPath === '/' ? 'index.html' : urlPath);
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      
      if (!fs.existsSync(filePath) && !path.extname(filePath)) {
        filePath += '.html';
      }
      
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.pdf': 'application/pdf'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      });
    });
    
    server.listen(port, '127.0.0.1', () => {
      // Get the actual port the server is listening on (may differ if port was in use)
      const actualPort = server.address().port;
      console.log(`📦 Static server running at http://127.0.0.1:${actualPort}`);
      resolve({ server, port: actualPort });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
        server.close();
        createServer(siteDir, port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Wait for page to be fully loaded with timeout
 */
async function waitForPageReady(page, config) {
  try {
    // Use navigation timeout for DOM content loading (longer timeout for page load)
    await page.waitForLoadState('domcontentloaded', { timeout: config.timeout.navigation });
    
    await page.waitForLoadState('networkidle', { timeout: config.timeout.network }).catch(() => {
      console.log('   ⚠️  Network idle timeout - proceeding anyway');
    });
    
    // Use fonts timeout specifically for font loading
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    
    await page.waitForTimeout(config.timeout.render);
    
  } catch (error) {
    console.log(`   ⚠️  Page ready timeout: ${error.message}`);
  }
}

/**
 * Generate PDF from a single page
 */
async function generatePDF(browser, baseUrl, target, outputDir, config) {
  const context = await browser.newContext({
    viewport: {
      width: config.viewport.width,
      height: config.viewport.height
    },
    deviceScaleFactor: config.viewport.deviceScaleFactor,
  });
  
  const page = await context.newPage();
  const url = `${baseUrl}${target.path}`;
  const outputPath = path.join(outputDir, target.output);
  
  console.log(`\n📄 Generating: ${target.output}`);
  console.log(`   URL: ${url}`);
  if (target.title) {
    console.log(`   Title: ${target.title}`);
  }
  
  try {
    await page.emulateMedia({ media: 'print' });
    
    console.log('   ⏳ Loading page...');
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeout.navigation
    });
    
    console.log('   ⏳ Waiting for content...');
    await waitForPageReady(page, config);
    
    console.log('   📝 Generating PDF...');
    await page.pdf({
      path: outputPath,
      ...config.pdfOptions
    });
    
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ✅ Created: ${outputPath} (${sizeKB} KB)`);
      return { success: true, path: outputPath, size: stats.size };
    } else {
      throw new Error('PDF file was not created');
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 PDF Generation Script for jyje.online');
  console.log('=========================================\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const overrides = {};
  let configPath = process.env.PDF_CONFIG || 'pdf-config.yml';
  
  args.forEach(arg => {
    if (arg.startsWith('--config=')) {
      configPath = arg.split('=')[1];
    } else if (arg.startsWith('--site-dir=')) {
      overrides.siteDir = arg.split('=')[1];
    } else if (arg.startsWith('--output-dir=')) {
      overrides.outputDir = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      overrides.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      overrides.port = parseInt(arg.split('=')[1]);
    }
  });
  
  // Load and parse configuration
  const yamlConfig = loadConfig(configPath);
  const config = parseConfig(yamlConfig, overrides);
  
  // Validate targets
  if (!config.targets || config.targets.length === 0) {
    console.error('❌ No PDF targets defined in config file');
    process.exit(1);
  }
  
  console.log(`📑 Found ${config.targets.length} PDF target(s)`);
  
  // Resolve paths
  const siteDir = path.resolve(config.siteDir);
  const outputDir = path.resolve(config.outputDir);
  
  // Verify site directory exists
  if (!fs.existsSync(siteDir)) {
    console.error(`❌ Site directory not found: ${siteDir}`);
    console.error('   Please run "bundle exec jekyll build" first.');
    process.exit(1);
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let server = null;
  let serverPort = null;
  let baseUrl = config.baseUrl;
  let browser = null;
  
  try {
    // Start local server if no base URL provided
    if (!baseUrl) {
      const serverInfo = await createServer(siteDir, config.port);
      server = serverInfo.server;
      serverPort = serverInfo.port;
      baseUrl = `http://127.0.0.1:${serverPort}`;
    }
    
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    });
    
    // Generate PDFs sequentially
    const results = [];
    for (const target of config.targets) {
      const result = await generatePDF(browser, baseUrl, target, outputDir, config);
      results.push({ ...result, target });
    }
    
    // Summary
    console.log('\n=========================================');
    console.log('📊 Summary');
    console.log('=========================================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Successful: ${successful.length}`);
    successful.forEach(r => {
      console.log(`   - ${r.target.output}`);
    });
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.target.output}: ${r.error}`);
      });
    }
    
    // Exit with error if any failed
    if (failed.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    // Close browser
    if (browser) {
      await browser.close().catch(() => {});
      console.log('\n🌐 Browser closed');
    }
    
    // Close server
    if (server) {
      server.close();
      console.log('📦 Server stopped');
    }
  }
}

// Run
main();
