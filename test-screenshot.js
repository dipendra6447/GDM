import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport for a desktop layout
  await page.setViewport({ width: 1280, height: 800 });
  
  // Login first
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', 'parikshit@email.com');
  await page.type('input[type="password"]', 'test@123');
  await page.click('button[type="submit"]');
  
  // Wait for login to complete
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Go to admin
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  
  // Give it a second for stats to load
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'admin-dash.png', fullPage: true });
  await browser.close();
  console.log("Screenshot saved to admin-dash.png");
})();
