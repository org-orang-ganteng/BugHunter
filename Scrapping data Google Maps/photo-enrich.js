const { chromium } = require('playwright');
const fs = require('fs');

const INPUT = 'data-makassar-final.json';
const OUTPUT = 'data-makassar-photos.json'; // progress cache: {placeId/linkMaps: fotoUrl}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function extractPhoto(page) {
  return await page.evaluate(() => {
    const fromBg = el => {
      const bg = el && getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) return bg.slice(bg.indexOf('url(') + 4, bg.lastIndexOf(')')).replace(/["']/g, '');
      return null;
    };
    const isPhoto = u => u && /googleusercontent\.com\/(p|gps-cs|places)|lh3\.googleusercontent/.test(u) && !/=s0|photo\/@/.test(u);
    // 1) hero header button image
    const heroBtn = document.querySelector('button[jsaction*="heroHeaderImage"], button[aria-label*="Foto"], button[aria-label*="foto"]');
    if (heroBtn) {
      const img = heroBtn.querySelector('img');
      if (img && isPhoto(img.src)) return img.src;
      const bg = fromBg(heroBtn.querySelector('div') || heroBtn);
      if (isPhoto(bg)) return bg;
    }
    // 2) any header img
    for (const img of document.querySelectorAll('img')) {
      if (isPhoto(img.src) && img.naturalWidth !== 1) return img.src;
    }
    // 3) any element with bg image
    for (const el of document.querySelectorAll('[style*="background-image"]')) {
      const u = fromBg(el);
      if (isPhoto(u)) return u;
    }
    return null;
  });
}

(async () => {
  const places = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  let cache = {};
  if (fs.existsSync(OUTPUT)) cache = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    locale: 'id-ID',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  });
  await ctx.addCookies([{ name: 'SOCS', value: 'CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwMTA5LjA1X3AwGgJlbiADGgYIgLC_rQY', domain: '.google.com', path: '/' }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : places.length;
  let processed = 0, withPhoto = 0;
  for (const p of places.slice(0, limit)) {
    const key = p.linkMaps;
    if (cache[key] !== undefined) { if (cache[key]) withPhoto++; continue; }
    try {
      await page.goto(p.linkMaps + '?hl=id', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('div.F7nice, h1, button[jsaction*="heroHeaderImage"]', { timeout: 15000 }).catch(() => {});
      await sleep(700);
      const url = await extractPhoto(page);
      cache[key] = url || null;
      if (url) withPhoto++;
    } catch (e) {
      cache[key] = null;
    }
    processed++;
    if (processed % 10 === 0) {
      fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));
      console.log(`  progress: ${processed}/${limit} (ada foto ${withPhoto})`);
    }
    await sleep(600 + Math.random() * 700);
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2));
  console.log(`SELESAI: ${processed} diproses, ada foto ${withPhoto}`);
  await browser.close();
})();
