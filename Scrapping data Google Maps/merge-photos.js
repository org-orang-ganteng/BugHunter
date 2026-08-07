const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data-makassar-final.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('data-makassar-photos.json', 'utf8'));

// add foto after website
const merged = data.map(r => {
  const out = {};
  for (const [k, v] of Object.entries(r)) {
    out[k] = v;
    if (k === 'website') out.foto = photos[r.linkMaps] || null;
  }
  if (!('foto' in out)) out.foto = photos[r.linkMaps] || null;
  return out;
});
fs.writeFileSync('data-makassar-final.json', JSON.stringify(merged, null, 2));

// regenerate CSV
const headers = ['no', 'nama', 'kategori', 'alamat', 'kota', 'lat', 'lng',
  'plusCode', 'rating', 'jumlahUlasan', 'telepon', 'website', 'foto', 'jamBuka', 'linkMaps', 'sumberQuery'];
const esc = v => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const rows = merged.map(r => [
  r.no, r.nama, r.kategori, r.alamat, r.kota,
  r.koordinat ? r.koordinat.lat : '', r.koordinat ? r.koordinat.lng : '',
  r.plusCode, r.rating, r.jumlahUlasan, r.telepon, r.website, r.foto,
  Array.isArray(r.jamBuka) ? r.jamBuka.join(' | ') : (r.jamBuka || ''),
  r.linkMaps,
  Array.isArray(r.sumberQuery) ? r.sumberQuery.join(' | ') : (r.sumberQuery || ''),
].map(esc).join(','));
fs.writeFileSync('data-makassar-final.csv', '\uFEFF' + headers.join(',') + '\n' + rows.join('\n') + '\n');

console.log('Digabung. Total:', merged.length, '| ada foto:', merged.filter(r => r.foto).length);
console.log('Diperbarui: data-makassar-final.json & data-makassar-final.csv (kolom "foto" ditambahkan)');
