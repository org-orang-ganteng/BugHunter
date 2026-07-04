/* =====================================================================
   game.js — Logika Utama Permainan Shikaku
   ---------------------------------------------------------------------
   Berisi bagian yang terpisah rapi:
     • STATE      : data permainan yang sedang berjalan
     • RENDER     : menggambar papan & sel
     • DRAG       : interaksi tarik-pilih (pointer / sentuh)
     • VALIDATION : memeriksa apakah persegi panjang yang dipilih benar
     • BLOCKS     : menyimpan / menghapus blok yang sudah jadi
     • UI         : tombol, pesan, deteksi kemenangan
   ===================================================================== */

(function () {
  "use strict";

  const { generatePuzzle, levelsForSize } = window.ShikakuGenerator;

  /* -------------------------------------------------------------------
     Warna lembut untuk blok. Dipakai bergiliran; tidak ada dua blok
     bersebelahan yang wajib berbeda, tetapi kita putar agar bervariasi.
     ------------------------------------------------------------------- */
  const BLOCK_COLORS = [
    "#ffd3b6", "#c8e6c9", "#b3e5fc", "#f8bbd0", "#fff9c4",
    "#d1c4e9", "#ffccbc", "#b2dfdb", "#f0f4c3", "#e1bee7",
    "#c5cae9", "#ffe0b2",
  ];

  /* ---------- Elemen DOM ---------- */
  const boardEl       = document.getElementById("board");
  const messageEl     = document.getElementById("message");
  const progressFill  = document.getElementById("progressFill");
  const progressText  = document.getElementById("progressText");
  const sizeEl        = document.getElementById("sizeSelect");
  const levelEl       = document.getElementById("levelSelect");
  const winOverlay    = document.getElementById("winOverlay");

  /* ===================================================================
     STATE — semua data permainan yang sedang berjalan
     =================================================================== */
  let puzzle = null;          // { rows, cols, clues, solution }
  let cellEls = [];           // matriks elemen DOM sel [r][c]
  let blocks = [];            // daftar blok jadi: {r0,c0,r1,c1,area,color,clueIndex}
  let cellOwner = [];         // [r][c] -> index blok pemilik, atau -1
  let colorIndex = 0;         // penunjuk warna berikutnya

  /* Status drag */
  let dragging = false;
  let startCell = null;       // {r, c}
  let lastCell = null;        // {r, c}

  /* ===================================================================
     RENDER — menggambar papan
     =================================================================== */

  /** Bangun ulang papan dari data `puzzle`. */
  function renderBoard() {
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${puzzle.cols}, 1fr)`;
    // Batasi lebar papan agar sel tetap kotak & muat di layar.
    // Sel mengecil untuk papan besar; batasi ukuran maksimum per sel.
    const maxCellPx = puzzle.cols <= 6 ? 78 : puzzle.cols <= 12 ? 60 : 46;
    boardEl.style.width = `min(94vw, ${puzzle.cols * maxCellPx}px)`;
    // Ukuran angka menyesuaikan lebar sel agar tetap terbaca di papan besar.
    const cellFont = `clamp(0.5rem, ${(46 / puzzle.cols).toFixed(2)}vw, 1.4rem)`;

    cellEls = Array.from({ length: puzzle.rows }, () => Array(puzzle.cols));

    // Peta cepat: sel mana yang berisi petunjuk & berapa nilainya.
    const clueMap = new Map();
    puzzle.clues.forEach((clue, i) => {
      clueMap.set(clue.row + "," + clue.col, { value: clue.value, index: i });
    });

    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.style.fontSize = cellFont;
        cell.setAttribute("role", "gridcell");

        const clue = clueMap.get(r + "," + c);
        if (clue) {
          cell.classList.add("cell--clue");
          const num = document.createElement("span");
          num.className = "cell__num";
          num.textContent = clue.value;
          cell.appendChild(num);
        }

        boardEl.appendChild(cell);
        cellEls[r][c] = cell;
      }
    }
  }

  /** Terapkan warna blok ke sel-sel yang dimilikinya. */
  function paintBlocks() {
    // Kosongkan dulu semua warna latar dari blok.
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        cellEls[r][c].style.background = "";
      }
    }
    blocks.forEach((block) => {
      for (let r = block.r0; r <= block.r1; r++) {
        for (let c = block.c0; c <= block.c1; c++) {
          cellEls[r][c].style.background = block.color;
        }
      }
    });
  }

  /* ===================================================================
     DRAG — interaksi tarik-pilih
     =================================================================== */

  /** Ambil koordinat {r,c} dari sebuah elemen sel, atau null. */
  function cellCoordsFromEl(el) {
    if (!el || !el.classList || !el.classList.contains("cell")) return null;
    return { r: +el.dataset.r, c: +el.dataset.c };
  }

  /** Ambil sel yang berada di titik layar (untuk sentuh & mouse). */
  function cellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    return cellCoordsFromEl(el && el.closest ? el.closest(".cell") : el);
  }

  /** Hitung batas persegi panjang dari dua sel sudut. */
  function rectFrom(a, b) {
    return {
      r0: Math.min(a.r, b.r),
      c0: Math.min(a.c, b.c),
      r1: Math.max(a.r, b.r),
      c1: Math.max(a.c, b.c),
    };
  }

  /** Tampilkan sorotan sementara selama menarik. */
  function showPreview(rect) {
    clearPreview();
    // Periksa apakah pratinjau menimpa blok lain (untuk warna sorotan).
    let overlaps = false;
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        if (cellOwner[r][c] !== -1) overlaps = true;
      }
    }
    const cls = overlaps ? "cell--preview-bad" : "cell--preview";
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        cellEls[r][c].classList.add(cls);
      }
    }
  }

  /** Bersihkan semua sorotan pratinjau. */
  function clearPreview() {
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        cellEls[r][c].classList.remove("cell--preview", "cell--preview-bad");
      }
    }
  }

  /* --- Penangan pointer (mendukung mouse & sentuh) --- */

  function onPointerDown(e) {
    const coords = cellFromPoint(e.clientX, e.clientY);
    if (!coords) return;
    e.preventDefault();
    dragging = true;
    startCell = coords;
    lastCell = coords;
    showPreview(rectFrom(startCell, lastCell));
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const coords = cellFromPoint(e.clientX, e.clientY);
    if (!coords) return;
    // Perbarui pratinjau hanya jika sel berubah (hemat kerja).
    if (coords.r !== lastCell.r || coords.c !== lastCell.c) {
      lastCell = coords;
      showPreview(rectFrom(startCell, lastCell));
    }
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    clearPreview();

    const rect = rectFrom(startCell, lastCell);
    const isSingle = rect.r0 === rect.r1 && rect.c0 === rect.c1;

    // Klik tunggal pada sel milik blok => hapus blok itu.
    if (isSingle && cellOwner[rect.r0][rect.c0] !== -1) {
      removeBlock(cellOwner[rect.r0][rect.c0]);
      return;
    }

    validateSelection(rect);
    startCell = null;
    lastCell = null;
  }

  /* ===================================================================
     VALIDATION — memeriksa persegi panjang yang dipilih
     =================================================================== */

  /**
   * Periksa rectangle terpilih sesuai aturan Shikaku, lalu terima/tolak.
   */
  function validateSelection(rect) {
    const width  = rect.c1 - rect.c0 + 1;
    const height = rect.r1 - rect.r0 + 1;
    const area   = width * height;

    // 1) Cari petunjuk yang berada di dalam persegi panjang.
    const cluesInside = puzzle.clues
      .map((clue, index) => ({ ...clue, index }))
      .filter((clue) =>
        clue.row >= rect.r0 && clue.row <= rect.r1 &&
        clue.col >= rect.c0 && clue.col <= rect.c1
      );

    // 2) Tolak jika tidak ada angka di dalamnya.
    if (cluesInside.length === 0) {
      return reject(rect, "Kotak harus berisi satu angka! 🔢");
    }
    // 3) Tolak jika ada lebih dari satu angka.
    if (cluesInside.length > 1) {
      return reject(rect, "Terlalu banyak angka di dalam kotak! ✋");
    }

    const clue = cluesInside[0];

    // 4) Tolak jika luas tidak sama dengan angka.
    if (area !== clue.value) {
      return reject(rect, `Luasnya ${area}, seharusnya ${clue.value}. Coba lagi! 📏`);
    }

    // 5) Tolak jika menimpa blok yang sudah ada.
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        if (cellOwner[r][c] !== -1) {
          return reject(rect, "Kotak menimpa kotak lain! ⛔");
        }
      }
    }

    // 6) Semua aturan terpenuhi => terima blok.
    acceptBlock(rect, clue, area);
  }

  /** Tolak pemilihan: pesan + animasi getar. */
  function reject(rect, msg) {
    setMessage(msg, "bad");
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        const cell = cellEls[r][c];
        cell.classList.remove("cell--rejected");
        void cell.offsetWidth;            // paksa reflow agar animasi ulang
        cell.classList.add("cell--rejected");
      }
    }
  }

  /* ===================================================================
     BLOCKS — menyimpan & menghapus blok jadi
     =================================================================== */

  /** Terima blok baru: simpan, beri warna, animasikan. */
  function acceptBlock(rect, clue, area) {
    const color = BLOCK_COLORS[colorIndex % BLOCK_COLORS.length];
    colorIndex++;

    const block = {
      r0: rect.r0, c0: rect.c0, r1: rect.r1, c1: rect.c1,
      area, color, clueIndex: clue.index,
    };
    const blockIndex = blocks.length;
    blocks.push(block);

    // Tandai kepemilikan sel.
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        cellOwner[r][c] = blockIndex;
      }
    }

    paintBlocks();

    // Animasi "pop" pada sel yang baru diterima.
    for (let r = rect.r0; r <= rect.r1; r++) {
      for (let c = rect.c0; c <= rect.c1; c++) {
        const cell = cellEls[r][c];
        cell.classList.remove("cell--accepted");
        void cell.offsetWidth;
        cell.classList.add("cell--accepted");
      }
    }

    setMessage("Bagus! Kotak diterima 🎉", "good");
    updateProgress();
    checkWin();
  }

  /** Hapus blok berdasarkan indeks, lalu susun ulang kepemilikan. */
  function removeBlock(index) {
    blocks.splice(index, 1);
    rebuildOwnership();
    paintBlocks();
    setMessage("Kotak dihapus. Coba lagi ya! ✏️", "info");
    updateProgress();
  }

  /** Bangun ulang peta kepemilikan dari daftar blok saat ini. */
  function rebuildOwnership() {
    cellOwner = Array.from({ length: puzzle.rows }, () =>
      Array(puzzle.cols).fill(-1)
    );
    blocks.forEach((block, i) => {
      for (let r = block.r0; r <= block.r1; r++) {
        for (let c = block.c0; c <= block.c1; c++) {
          cellOwner[r][c] = i;
        }
      }
    });
  }

  /* ===================================================================
     UI — pesan, kemajuan, kemenangan
     =================================================================== */

  function setMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = "message message--" + (kind || "info");
  }

  /** Hitung persentase sel yang sudah tertutup blok. */
  function coveredCount() {
    let n = 0;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        if (cellOwner[r][c] !== -1) n++;
      }
    }
    return n;
  }

  function updateProgress() {
    const total = puzzle.rows * puzzle.cols;
    const pct = Math.round((coveredCount() / total) * 100);
    progressFill.style.width = pct + "%";
    progressText.textContent = pct + "%";
  }

  /** Papan selesai jika SETIAP sel dimiliki oleh sebuah blok. */
  function isComplete() {
    return coveredCount() === puzzle.rows * puzzle.cols;
  }

  function checkWin() {
    if (isComplete()) showWin();
  }

  function showWin() {
    setMessage("SELAMAT! Kamu berhasil! 🏆", "good");
    winOverlay.hidden = false;
    launchConfetti();
  }

  /* ===================================================================
     PERIKSA & PETUNJUK
     =================================================================== */

  /** Tombol "Periksa": beri tahu status papan saat ini. */
  function checkAnswer() {
    if (isComplete()) {
      showWin();
    } else {
      const left = puzzle.rows * puzzle.cols - coveredCount();
      setMessage(`Belum selesai — masih ada ${left} kotak kosong. Semangat! 💪`, "info");
    }
  }

  /**
   * Tombol "Petunjuk": pilih satu petunjuk yang belum terselesaikan dan
   * pasang blok solusinya secara otomatis (berdasarkan solusi internal).
   */
  function giveHint() {
    // Cari region solusi yang belum punya blok jadi menutupinya penuh.
    for (const clue of puzzle.clues) {
      // Lewati bila sel petunjuk sudah dimiliki blok.
      if (cellOwner[clue.row][clue.col] !== -1) continue;

      // Tentukan batas region milik petunjuk ini dari papan solusi.
      const regionId = puzzle.solution[clue.row][clue.col];
      let r0 = Infinity, c0 = Infinity, r1 = -1, c1 = -1;
      for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          if (puzzle.solution[r][c] === regionId) {
            r0 = Math.min(r0, r); c0 = Math.min(c0, c);
            r1 = Math.max(r1, r); c1 = Math.max(c1, c);
          }
        }
      }

      // Pastikan area solusi ini tidak bertabrakan dengan blok pemain.
      let clash = false;
      for (let r = r0; r <= r1 && !clash; r++) {
        for (let c = c0; c <= c1; c++) {
          if (cellOwner[r][c] !== -1) { clash = true; break; }
        }
      }
      if (clash) continue;

      // Pasang blok petunjuk ini.
      const rect = { r0, c0, r1, c1 };
      acceptBlock(rect, { ...clue, index: puzzle.clues.indexOf(clue) }, (r1 - r0 + 1) * (c1 - c0 + 1));
      setMessage("Ini satu petunjuk untukmu! 💡", "info");
      return;
    }
    setMessage("Tidak ada petunjuk yang bisa diberikan sekarang. 🙂", "info");
  }

  /* ===================================================================
     KONTROL PERMAINAN (mulai / reset / puzzle baru)
     =================================================================== */

  /** Isi dropdown ukuran papan (3×3 sampai 20×20). */
  function populateSizes() {
    sizeEl.innerHTML = "";
    for (let s = 3; s <= 20; s++) {
      const opt = document.createElement("option");
      opt.value = String(s);
      opt.textContent = `${s}×${s}`;
      sizeEl.appendChild(opt);
    }
  }

  /** Isi dropdown level sesuai ukuran terpilih (jumlah = min(ukuran, 10)). */
  function populateLevels() {
    const size = +sizeEl.value;
    const count = levelsForSize(size);
    const prev = +levelEl.value || 1;
    levelEl.innerHTML = "";
    for (let lv = 1; lv <= count; lv++) {
      const opt = document.createElement("option");
      opt.value = String(lv);
      opt.textContent = `Level ${lv}`;
      levelEl.appendChild(opt);
    }
    // Pertahankan pilihan level bila masih valid, jika tidak kembali ke 1.
    levelEl.value = String(prev <= count ? prev : 1);
  }

  /** Mulai puzzle baru sesuai ukuran & level terpilih. */
  function newGame() {
    puzzle = generatePuzzle(+sizeEl.value, +levelEl.value);
    blocks = [];
    colorIndex = 0;
    rebuildOwnership();      // membuat cellOwner sesuai ukuran papan baru
    renderBoard();
    paintBlocks();
    updateProgress();
    setMessage("Tarik dari satu kotak ke kotak lain untuk mulai! ✨", "info");
    winOverlay.hidden = true;
  }

  /** Hapus semua blok pemain tapi pertahankan puzzle yang sama. */
  function resetGame() {
    blocks = [];
    colorIndex = 0;
    rebuildOwnership();
    paintBlocks();
    updateProgress();
    setMessage("Papan dibersihkan. Ayo coba lagi! 🔄", "info");
    winOverlay.hidden = true;
  }

  /* ===================================================================
     KONFETI sederhana (tanpa pustaka luar)
     =================================================================== */
  function launchConfetti() {
    const emojis = ["🎉", "⭐", "🎊", "🌈", "✨", "🍭"];
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement("span");
      piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      piece.style.position = "fixed";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.top = "-40px";
      piece.style.fontSize = 18 + Math.random() * 20 + "px";
      piece.style.zIndex = 60;
      piece.style.pointerEvents = "none";
      piece.style.transition = "transform 2.4s ease-in, opacity 2.4s ease-in";
      document.body.appendChild(piece);
      requestAnimationFrame(() => {
        piece.style.transform =
          `translateY(110vh) rotate(${Math.random() * 720 - 360}deg)`;
        piece.style.opacity = "0";
      });
      setTimeout(() => piece.remove(), 2600);
    }
  }

  /* ===================================================================
     PASANG EVENT
     =================================================================== */

  // Interaksi tarik-pilih pada papan. Pointer events menyatukan mouse & sentuh.
  boardEl.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // Tombol-tombol.
  document.getElementById("newBtn").addEventListener("click", newGame);
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("checkBtn").addEventListener("click", checkAnswer);
  document.getElementById("hintBtn").addEventListener("click", giveHint);
  document.getElementById("winNextBtn").addEventListener("click", newGame);
  // Saat ukuran berubah: perbarui daftar level lalu mulai puzzle baru.
  sizeEl.addEventListener("change", () => {
    populateLevels();
    newGame();
  });
  levelEl.addEventListener("change", newGame);

  // Mulai permainan pertama.
  populateSizes();
  populateLevels();
  newGame();
})();
