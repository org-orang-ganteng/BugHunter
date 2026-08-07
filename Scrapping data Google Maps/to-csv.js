const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data-makassar-final.json', 'utf8'));

const headers = ['no', 'nama', 'kategori', 'alamat', 'kota', 'lat', 'lng',
  'plusCode', 'rating', 'jumlahUlasan', 'telepon', 'website', 'jamBuka', 'linkMaps', 'sumberQuery'];

const esc = v => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const rows = data.map(r => [
  r.no, r.nama, r.kategori, r.alamat, r.kota,
  r.koordinat ? r.koordinat.lat : '', r.koordinat ? r.koordinat.lng : '',
  r.plusCode, r.rating, r.jumlahUlasan, r.telepon, r.website,
  Array.isArray(r.jamBuka) ? r.jamBuka.join(' | ') : (r.jamBuka || ''),
  r.linkMaps,
  Array.isArray(r.sumberQuery) ? r.sumberQuery.join(' | ') : (r.sumberQuery || ''),
].map(esc).join(','));

// BOM so Excel reads UTF-8 correctly
const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n') + '\n';
fs.writeFileSync('data-makassar-final.csv', csv);
console.log('CSV dibuat: data-makassar-final.csv (' + data.length + ' baris)');
