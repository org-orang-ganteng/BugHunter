const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('cafe-warkop-makassar-enriched.json', 'utf8'));

const toInt = s => {
  if (s == null) return null;
  const n = String(s).replace(/[^\d]/g, '');
  return n ? parseInt(n, 10) : null;
};

const final = raw.map((r, i) => ({
  no: i + 1,
  nama: r.name,
  kategori: r.category,
  alamat: r.address,
  kota: /Kota Makassar/i.test(r.address || '') ? 'Makassar' :
        (r.address && (r.address.match(/Kabupaten [A-Za-z]+|Kota [A-Za-z]+/) || [])[0]) || null,
  koordinat: { lat: r.lat, lng: r.lng },
  plusCode: r.plusCode || null,
  rating: r.rating ?? null,
  jumlahUlasan: toInt(r.reviews),
  telepon: r.phone || null,
  website: r.website || null,
  jamBuka: r.hoursWeek || (r.hoursSnippet ? [r.hoursSnippet] : null),
  linkMaps: r.mapsUrl,
  sumberQuery: r.sourceQueries,
}));

fs.writeFileSync('cafe-warkop-makassar-final.json', JSON.stringify(final, null, 2));

const inMks = final.filter(r => r.kota === 'Makassar').length;
console.log('=== RINGKASAN DATASET ===');
console.log('Total tempat        :', final.length);
console.log('Di Kota Makassar    :', inMks, `(${(inMks/final.length*100).toFixed(0)}%)`);
console.log('Punya telepon       :', final.filter(r => r.telepon).length);
console.log('Punya website       :', final.filter(r => r.website).length);
console.log('Punya rating        :', final.filter(r => r.rating != null).length);
console.log('Punya jumlah ulasan :', final.filter(r => r.jumlahUlasan != null).length);
console.log('Punya jam buka      :', final.filter(r => r.jamBuka).length);
console.log('Punya koordinat     :', final.filter(r => r.koordinat.lat).length);
console.log('\nFile final: cafe-warkop-makassar-final.json');
