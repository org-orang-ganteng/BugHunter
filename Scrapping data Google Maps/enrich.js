const { chromium } = require('playwright');
const fs = require('fs');

const INPUT = 'cafe-warkop-makassar.json';
const OUTPUT = 'cafe-warkop-makassar-enriched.json';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function extract(page) {
  return await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const clean = t => (t || '').replace(/\s+/g, ' ').trim() || null;

    // phone
    let phone = null;
    const pe = q('button[data-item-id^="phone:tel:"]');
    if (pe) phone = pe.getAttribute('data-item-id').replace('phone:tel:', '');

    // website
    let website = null;
    const we = q('a[data-item-id="authority"]');
    if (we) website = we.href;

    // address (full)
    let address = null;
    const ae = q('button[data-item-id="address"]');
    if (ae) address = clean((ae.getAttribute('aria-label') || '').replace(/^Alamat:\s*/i, ''));

    // plus code
    let plusCode = null;
    const oe = q('button[data-item-id="oloc"]');
    if (oe) plusCode = clean((oe.getAttribute('aria-label') || '').replace(/^Plus Codes?:\s*/i, ''));

    // rating + reviews
    let rating = null, reviews = null;
    const f7 = q('div.F7nice');
    if (f7) {
      const rt = f7.querySelector('span[aria-hidden="true"]');
      if (rt) rating = rt.textContent.trim();
      const rv = f7.querySelector('span[aria-label*="ulasan"], span[aria-label*="review"]');
      if (rv) { const m = rv.getAttribute('aria-label').match(/([\d.,]+)/); if (m) reviews = m[1]; }
      if (!reviews) { const m = f7.innerText.match(/\(([\d.,]+)\)/); if (m) reviews = m[1]; }
    }

    // category
    let category = null;
    const ce = q('button[jsaction*="category"]');
    if (ce) category = clean(ce.textContent);

    return { phone, website, address, plusCode, rating, reviews, category };
  });
}

async function extractHours(page) {
  return await page.evaluate(() => {
    const clean = t => (t || '').replace(/\s+/g, ' ').trim() || null;
    const dayRe = /^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)\b/;
    const timeRe = /\d{1,2}[.:]\d{2}|24 jam|Tutup|Buka 24/i;
    let hoursWeek = Array.from(document.querySelectorAll('[aria-label]'))
      .map(e => (e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
      .filter(l => dayRe.test(l) && timeRe.test(l) && l.length < 45);
    hoursWeek = [...new Set(hoursWeek)];
    // fallback: read hours table rows
    if (hoursWeek.length < 2) {
      const t = document.querySelector('table.eK4R0e, table.WgFkxc, div[role="region"] table');
      if (t) {
        hoursWeek = Array.from(t.querySelectorAll('tr')).map(tr => {
          const c = Array.from(tr.querySelectorAll('td,th')).map(td => td.textContent.trim()).filter(Boolean);
          return c.length >= 2 ? c[0] + ', ' + c[1] : null;
        }).filter(Boolean);
      }
    }
    // normalize: strip "Salin jam buka", dedupe by day, order Sen->Min
    const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const byDay = {};
    for (let l of hoursWeek) {
      l = l.replace(/,?\s*Salin jam buka.*$/i, '').replace(/\s+/g, ' ').trim();
      const day = (l.match(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)/) || [])[1];
      if (day && !byDay[day]) byDay[day] = l;
    }
    const out = order.filter(d => byDay[d]).map(d => byDay[d]);
    return out.length ? out : null;
  });
}

async function expandHours(page) {
  try {
    await page.evaluate(() => {
      const btn = document.querySelector('[jsaction*="openhours"], button[aria-label*="jam buka"], [data-item-id="oh"]')
        || [...document.querySelectorAll('[jsaction*="pane"]')].find(e => /Tutup|Buka|24 jam/.test(e.textContent) && e.textContent.length < 60);
      if (btn) (btn.closest('button') || btn).click();
    });
    await sleep(600);
  } catch (e) { /* ignore */ }
}

(async () => {
  const places = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  let done = {};
  if (fs.existsSync(OUTPUT)) {
    for (const r of JSON.parse(fs.readFileSync(OUTPUT, 'utf8'))) done[r.placeId] = r;
  }

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    locale: 'id-ID',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  });
  // bypass consent
  await ctx.addCookies([{ name: 'SOCS', value: 'CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwMTA5LjA1X3AwGgJlbiADGgYIgLC_rQY', domain: '.google.com', path: '/' }]);

  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  const results = [];
  let processed = 0, failed = 0;
  for (const p of places) {
    if (done[p.placeId]) { results.push(done[p.placeId]); continue; }
    try {
      await page.goto(p.mapsUrl + '?hl=id', { waitUntil: 'domcontentloaded' });
      // wait for detail panel
      await page.waitForSelector('button[data-item-id="address"], div.F7nice, h1', { timeout: 15000 }).catch(() => {});
      await sleep(600);
      const d = await extract(page);
      await expandHours(page);
      const hoursWeek = await extractHours(page);
      const merged = {
        ...p,
        address: d.address || p.address,
        category: d.category || p.category,
        rating: d.rating ? parseFloat(d.rating.replace(',', '.')) : p.rating,
        reviews: d.reviews || p.reviews,
        phone: d.phone || p.phone,
        website: d.website || p.website,
        hoursSnippet: p.hours || null,
        hoursWeek: (hoursWeek && hoursWeek.length) ? hoursWeek : null,
        plusCode: d.plusCode || null,
      };
      delete merged.hours;
      results.push(merged);
    } catch (e) {
      failed++;
      results.push({ ...p, _error: e.message });
    }
    processed++;
    if (processed % 10 === 0) {
      fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
      console.log(`  progress: ${processed}/${places.length} (gagal ${failed})`);
    }
    await sleep(700 + Math.random() * 800);
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`SELESAI: ${results.length} tempat, gagal ${failed}`);
  console.log('  dengan telepon:', results.filter(r => r.phone).length);
  console.log('  dengan website:', results.filter(r => r.website).length);
  console.log('  dengan reviews:', results.filter(r => r.reviews).length);
  await browser.close();
})();
