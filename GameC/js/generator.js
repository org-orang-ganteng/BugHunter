/* =====================================================================
   generator.js — Pembuat Puzzle Shikaku
   ---------------------------------------------------------------------
   Tugas modul ini: membuat puzzle Shikaku yang valid.
   Cara kerja:
     1. Mulai dengan satu papan penuh sebagai satu wilayah.
     2. Bagi papan berulang kali menjadi persegi panjang yang lebih kecil
        (recursive partition) sampai ukurannya nyaman.
     3. Hitung luas (area) tiap persegi panjang.
     4. Taruh SATU angka petunjuk di sel acak di dalamnya (nilai = luas).
     5. Kembalikan hanya sel petunjuk ke pemain, simpan solusi lengkap.

   Aturan angka:
     • Setiap wilayah selalu memiliki luas antara 2 dan 20.
     • Angka 1 tidak pernah muncul (tidak ada kotak 1×1).

   Ukuran & level:
     • Ukuran papan tersedia dari 3×3 sampai 20×20.
     • Tiap ukuran punya beberapa level: jumlah level = min(ukuran, 10).
       Contoh: 3×3 punya 3 level, 4×4 punya 4 level, … 10×10 dan lebih
       besar punya 10 level. Level lebih tinggi = wilayah lebih kecil
       (lebih banyak potongan) sehingga terasa lebih menantang.
     • Tiap kombinasi (ukuran, level) memakai benih acak tetap sehingga
       puzzle-nya konsisten setiap kali dibuka.
   ===================================================================== */

/** Batas luas wilayah: angka petunjuk hanya boleh 2..20. */
const MIN_AREA = 2;
const MAX_AREA = 20;

/** Jumlah level yang tersedia untuk sebuah ukuran papan. */
function levelsForSize(size) {
  return Math.min(size, 10);
}

/** Pembangkit angka acak berbenih (mulberry32) — hasilnya bisa diulang. */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Angka acak bilangan bulat dari min sampai max (inklusif). */
function randIntRng(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Membuat satu puzzle Shikaku untuk ukuran & level tertentu.
 *
 * @param {number} size  - ukuran papan (3..20), papan selalu size×size
 * @param {number} level - nomor level (1..levelsForSize(size))
 * @returns {{rows:number, cols:number, clues:Array, solution:Array<Array<number>>}}
 */
function generatePuzzle(size, level) {
  const rows = clamp(size | 0, 3, 20);
  const cols = rows;

  const levelCount = levelsForSize(rows);
  const lvl = clamp((level | 0) || 1, 1, levelCount);

  // Fraksi kesulitan t: 0 (mudah) .. 1 (sulit).
  const t = levelCount > 1 ? (lvl - 1) / (levelCount - 1) : 0;

  // Batas "nyaman": level mudah cenderung wilayah besar, level sulit kecil.
  const softMaxEasy = Math.min(MAX_AREA, rows + 2);
  const softMaxHard = 4;
  const softMax = clamp(
    Math.round(softMaxEasy + (softMaxHard - softMaxEasy) * t),
    3,
    MAX_AREA
  );

  const rng = makeRng(rows * 1000 + lvl);

  // Papan solusi: tiap sel menyimpan id "region". -1 berarti belum terisi.
  const solution = Array.from({ length: rows }, () => Array(cols).fill(-1));
  const regions = []; // daftar {r0,c0,r1,c1}

  /** Bagi sebuah persegi panjang secara rekursif. */
  function partition(r0, c0, r1, c1) {
    const H = r1 - r0 + 1;
    const W = c1 - c0 + 1;
    const area = W * H;

    // Apakah pembagian yang menjaga tiap anak berluas >= 2 masih mungkin?
    const verticalOK = (H >= 2 && W >= 2) || (H === 1 && W >= 4);
    const horizontalOK = (W >= 2 && H >= 2) || (W === 1 && H >= 4);
    const canSplit = verticalOK || horizontalOK;

    let doSplit;
    if (area > MAX_AREA) {
      doSplit = true; // wajib dipecah agar luas <= 20
    } else if (!canSplit) {
      doSplit = false; // tidak bisa dipecah tanpa membuat kotak 1×1
    } else if (area <= softMax) {
      doSplit = false; // sudah cukup kecil
    } else {
      doSplit = rng() < 0.75; // di antara softMax dan 20: kadang biarkan besar
    }

    if (!doSplit) {
      regions.push({ r0, c0, r1, c1 });
      return;
    }

    // Pilih arah pemotongan.
    let orient;
    if (verticalOK && horizontalOK) orient = rng() < 0.5 ? "v" : "h";
    else orient = verticalOK ? "v" : "h";

    if (orient === "v") {
      // Potong berdasarkan kolom. Jaga tiap sisi berluas >= 2.
      let kmin = 1;
      let kmax = W - 1;
      if (H === 1) {
        kmin = 2;
        kmax = W - 2;
      }
      const k = randIntRng(rng, kmin, kmax);
      partition(r0, c0, r1, c0 + k - 1);
      partition(r0, c0 + k, r1, c1);
    } else {
      // Potong berdasarkan baris. Jaga tiap sisi berluas >= 2.
      let kmin = 1;
      let kmax = H - 1;
      if (W === 1) {
        kmin = 2;
        kmax = H - 2;
      }
      const k = randIntRng(rng, kmin, kmax);
      partition(r0, c0, r0 + k - 1, c1);
      partition(r0 + k, c0, r1, c1);
    }
  }

  partition(0, 0, rows - 1, cols - 1);

  // Tandai solusi & buat satu petunjuk per wilayah.
  const clues = [];
  regions.forEach((reg, id) => {
    for (let r = reg.r0; r <= reg.r1; r++) {
      for (let c = reg.c0; c <= reg.c1; c++) {
        solution[r][c] = id;
      }
    }
    const area = (reg.r1 - reg.r0 + 1) * (reg.c1 - reg.c0 + 1);
    const clueR = randIntRng(rng, reg.r0, reg.r1);
    const clueC = randIntRng(rng, reg.c0, reg.c1);
    clues.push({ row: clueR, col: clueC, value: area, region: id });
  });

  return { rows, cols, clues, solution };
}

// Ekspor ke lingkup global agar bisa dipakai game.js
window.ShikakuGenerator = { generatePuzzle, levelsForSize, MIN_AREA, MAX_AREA };
