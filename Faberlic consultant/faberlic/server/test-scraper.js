
const { chromium } = require('playwright');

async function testFaberlicPage() {
  // Replace with a real Faberlic catalog URL!
  const testUrl = 'https://faberlic.com/az/az/catalog/kozmetika/';

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to:', testUrl);
    await page.goto(testUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'faberlic-page.png', fullPage: true });
    console.log('Screenshot saved to faberlic-page.png');

    // Print page HTML (first 2000 characters)
    const html = await page.content();
    console.log('Page HTML (first 2000 chars):');
    console.log(html.substring(0, 2000));

    // Try to find all possible product card selectors
    const possibleSelectors = await page.evaluate(() => {
      const selectors = [
        'div[class*="product"]',
        'div[class*="item"]',
        'div[class*="card"]',
        'article',
        'a[href*="product"]'
      ];

      const results = {};
      selectors.forEach(sel => {
        const count = document.querySelectorAll(sel).length;
        results[sel] = count;
      });

      // Also print first 3 matches of each selector
      const details = {};
      selectors.forEach(sel => {
        const cards = Array.from(document.querySelectorAll(sel)).slice(0, 3);
        details[sel] = cards.map(card => ({
          tagName: card.tagName,
          className: card.className,
          innerHTML: card.innerHTML.substring(0, 500)
        }));
      });

      return { counts: results, details };
    });

    console.log('\nSelector counts:', possibleSelectors.counts);
    console.log('\nSelector details:', JSON.stringify(possibleSelectors.details, null, 2));

    console.log('\nTest complete! Check the screenshot and console output to find correct selectors!');
    
    // Keep browser open for a minute so you can inspect the page
    await page.waitForTimeout(60000);
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testFaberlicPage();
