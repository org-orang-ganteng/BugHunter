const fs = require('fs');
const files = ['q1-cafe.json','q2-warkop.json','q3-kedaikopi.json','q4-coffeeshop.json'];
const map = new Map();
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of j.data) {
    if (!map.has(r.placeId)) {
      r.sourceQueries = [j.query];
      map.set(r.placeId, r);
    } else {
      map.get(r.placeId).sourceQueries.push(j.query);
    }
  }
}
const all = [...map.values()];
// normalize rating to number
for (const r of all) {
  if (r.rating) r.rating = parseFloat(String(r.rating).replace(',', '.'));
}
fs.writeFileSync('cafe-warkop-makassar.json', JSON.stringify(all, null, 2));
console.log('Total unik:', all.length);
console.log('Dengan koordinat:', all.filter(r=>r.lat).length);
console.log('Dengan alamat:', all.filter(r=>r.address).length);
console.log('Dengan rating:', all.filter(r=>r.rating).length);
