import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(5000);

// Check structure
const checks = await page.evaluate(() => {
  return {
    smoothWrapper: !!document.getElementById('smooth-wrapper'),
    smoothContent: !!document.getElementById('smooth-content'),
    portalFixed:   !!document.getElementById('portal-fixed'),
    navbarInPortal: !!document.getElementById('portal-fixed')?.querySelector('.navbar, nav'),
    mpBarInPortal:  !!document.getElementById('portal-fixed')?.querySelector('.mp-bar'),
    rootInContent:  !!document.getElementById('smooth-content')?.querySelector('#root'),
    smoothWrapperH: document.getElementById('smooth-wrapper')?.offsetHeight,
    // Check ScrollSmoother is active (it adds data attributes or custom properties)
    contentTransform: window.getComputedStyle(document.getElementById('smooth-content') || document.body).transform,
  };
});

console.log('=== ScrollSmoother Structure ===');
console.log('smooth-wrapper present:', checks.smoothWrapper, checks.smoothWrapper ? '✅' : '❌');
console.log('smooth-content present:', checks.smoothContent, checks.smoothContent ? '✅' : '❌');
console.log('portal-fixed present:', checks.portalFixed, checks.portalFixed ? '✅' : '❌');
console.log('navbar in portal (outside smooth-content):', checks.navbarInPortal, checks.navbarInPortal ? '✅' : '❌');
console.log('mp-bar in portal:', checks.mpBarInPortal, checks.mpBarInPortal ? '✅' : '❌');
console.log('#root inside smooth-content:', checks.rootInContent, checks.rootInContent ? '✅' : '❌');
console.log('smooth-wrapper height:', checks.smoothWrapperH + 'px');
console.log('smooth-content transform:', checks.contentTransform);

console.log('\n=== JS Errors ===');
const realErrors = errors.filter(e => !e.includes('ERR_ABORTED') && !e.includes('ORB'));
console.log(realErrors.length === 0 ? '✅ No errors' : realErrors.slice(0,5).join('\n'));

// Take screenshot
await page.screenshot({ path: 'smooth-result.png' });
console.log('\nScreenshot: smooth-result.png');

// Test scroll
await page.evaluate(() => window.scrollTo(0, 500));
await page.waitForTimeout(800);
const scrolled = await page.evaluate(() => window.scrollY);
console.log('Scroll test - scrollY after scrollTo(500):', scrolled, scrolled > 0 ? '✅' : '⚠️ may need interaction');

await browser.close();
