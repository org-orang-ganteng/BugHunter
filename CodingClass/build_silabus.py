#!/usr/bin/env python3
"""Generator silabus Pra-Coding batita (30 pertemuan, 2 jam) -> HTML siap cetak PDF."""

# Data 30 pertemuan: (no, tahap_kelas, tahap_nama, topik, tujuan, deskripsi, jenis, aktivitas, media, tugas)
TAHAP = {
    1: ("phase1", "🟢 Tahap 1 — Mengenal & Merasa Senang (Pertemuan 1–5) · Konsep: sebab-akibat dasar"),
    2: ("phase2", "🔵 Tahap 2 — Mencocokkan & Memilah (Pertemuan 6–10) · Konsep: matching & sorting"),
    3: ("phase3", "🟡 Tahap 3 — Urutan Sederhana (Pertemuan 11–15) · Konsep: sequence / algoritma"),
    4: ("phase4", "🟠 Tahap 4 — Pola (Pertemuan 16–20) · Konsep: pattern / perulangan (loop)"),
    5: ("phase5", "🟣 Tahap 5 — Sebab-Akibat & Perintah (Pertemuan 21–25) · Konsep: input/output & kondisi"),
    6: ("phase6", "🔴 Tahap 6 — Bermain Bersama & Perayaan (Pertemuan 26–30) · Konsep: gabungan + debugging"),
}

# no, tahap, topik, tujuan, jenis, deskripsi, media, tugas
M = [
    (1,1,"Halo, Teman!","“Ayo kenalan dan bermain!”","Unplugged",
     "Anak dikenalkan suasana kelas dan teman baru lewat lagu sapaan dan bermain balok bebas. Tujuannya membangun rasa nyaman dan senang sebelum mulai belajar.",
     "Balok besar, alat musik sederhana, kartu lagu","Menyanyikan lagu sapaan bersama orang tua di rumah."),
    (2,1,"Warna-Warni","“Ini warna merah!”","Unplugged",
     "Anak mengenal nama warna dasar (merah, kuning, biru) dengan menunjuk dan menyebut warna benda di sekitarnya.",
     "Kartu warna besar, balok warna","Menunjuk warna benda kesukaan di rumah."),
    (3,1,"Tekan, Ada Bunyi!","“Tekan → bunyi!”","Plugged (2–3 th)",
     "Anak mengenal sebab-akibat: satu aksi (menekan) menghasilkan satu hasil (bunyi/nyala). Ini fondasi konsep input–output dalam coding.",
     "Mainan tombol/aplikasi tombol besar berbunyi","Menekan bel/saklar lampu bersama orang tua (didampingi)."),
    (4,1,"Besar dan Kecil","“Mana yang besar?”","Unplugged",
     "Anak mengenal konsep ukuran (besar dan kecil) sebagai dasar membandingkan benda.",
     "Bola besar & kecil, balok","Mencari benda besar dan kecil di rumah."),
    (5,1,"Bermain Bebas","“Ayo main sesuka hati!”","Unplugged",
     "Mengulang dan memperkuat rasa nyaman. Anak bereksplorasi bebas dengan pendampingan sambil dipuji.",
     "Aneka mainan aman & besar","Bermain bebas terarah bersama orang tua."),

    (6,2,"Mana yang Sama?","“Cari yang sama!”","Unplugged",
     "Anak mengenal konsep “sama” dengan mencocokkan dua benda/kartu yang identik (matching).",
     "Pasangan kartu warna/gambar","Mencari dua benda yang sama di rumah."),
    (7,2,"Masukkan Warnanya","“Merah ke keranjang merah.”","Unplugged",
     "Anak memilah benda berdasarkan warna ke wadah yang sesuai (sorting) — dasar mengelompokkan data.",
     "Bola warna & keranjang warna","Memasukkan mainan ke kotak sesuai warna."),
    (8,2,"Pasangan Bentuk","“Bulat sama bulat!”","Unplugged",
     "Anak mencocokkan bentuk (bulat, kotak) ke lubang/pasangannya melalui mainan sortir.",
     "Mainan sortir bentuk besar","Bermain puzzle bentuk besar di rumah."),
    (9,2,"Ketuk yang Sama","“Sentuh gambar yang sama.”","Plugged (2–3 th)",
     "Versi digital dari mencocokkan: anak menyentuh gambar yang sama di layar (singkat, didampingi).",
     "Tablet dengan aplikasi mencocokkan gambar","Bermain kartu mencocokkan (ganti layar) di rumah."),
    (10,2,"Bermain Memilah","“Kita pisahkan mainan.”","Unplugged",
     "Mengulang sorting dengan kriteria besar/kecil untuk memperkuat kemampuan mengelompokkan.",
     "Mainan campur besar & kecil","Memisahkan sendok besar & kecil bersama orang tua."),

    (11,3,"Dulu, Lalu","“Dulu ini, lalu itu.”","Unplugged",
     "Anak mengenal urutan dua langkah (ambil dulu, lalu taruh) — dasar dari sequence/algoritma.",
     "Mainan & wadah","Melakukan urutan “buka keran → basuh tangan” di rumah."),
    (12,3,"Robot Mama/Papa","“Ayo suruh Mama maju!”","Unplugged",
     "Anak memberi perintah “maju/berhenti” kepada orang dewasa, memahami bahwa perintah dijalankan berurutan.",
     "Ruang gerak yang aman","Bermain “robot” bersama orang tua di rumah."),
    (13,3,"Susun Balok","“Bawah dulu, baru atas.”","Unplugged",
     "Anak menyusun menara balok dari bawah ke atas secara berurutan untuk melatih urutan langkah.",
     "Balok besar","Menyusun 3 balok atau gelas plastik."),
    (14,3,"Langkah Kaki","“Satu, dua, lompat!”","Unplugged",
     "Anak berjalan mengikuti kartu langkah (satu, dua, lompat) untuk mengenal urutan gerak.",
     "Kartu langkah / tapak kaki di lantai","Bermain lompat mengikuti aba-aba orang tua."),
    (15,3,"Urutan Warna","“Merah dulu, baru biru.”","Plugged (2–3 th)",
     "Anak menekan warna sesuai urutan yang dicontohkan pada robot/aplikasi (singkat, didampingi).",
     "Robot mainan / aplikasi urutan warna","Mengurutkan dua balok warna di rumah."),

    (16,4,"Merah-Biru-Merah","“Lanjutkan polanya!”","Unplugged",
     "Anak mengenal pola berulang sederhana (AB), yaitu dasar dari konsep perulangan (loop).",
     "Balok dua warna","Menyusun pola sendok–garpu / dua benda bergantian."),
    (17,4,"Tepuk-Tepuk","“Tepuk, tepuk, injak!”","Unplugged",
     "Anak meniru pola gerak dan bunyi (tepuk, tepuk, injak) untuk merasakan pola secara fisik.",
     "Gerak tubuh, musik","Menirukan pola tepukan yang dibuat orang tua."),
    (18,4,"Pola Bunyi","“Dengar, lalu ulangi.”","Plugged (2–3 th)",
     "Anak mendengar lalu mengulang pola suara sederhana melalui aplikasi (singkat, didampingi).",
     "Aplikasi pola suara","Menyanyikan pola nada sederhana di rumah."),
    (19,4,"Kalung Manik Besar","“Susun bergantian.”","Unplugged",
     "Anak meronce manik besar dengan pola warna bergantian untuk memperkuat pemahaman pola.",
     "Manik besar & tali tebal (aman)","Menyusun benda bergantian (mis. batu–daun)."),
    (20,4,"Pesta Pola","“Kita buat pola sendiri!”","Unplugged",
     "Anak membuat pola sendiri secara bebas dari benda yang tersedia, melatih kreativitas berpola.",
     "Aneka benda untuk pola","Membuat pola dari mainan bersama orang tua."),

    (21,5,"Tekan → Terjadi","“Tekan, lampu menyala!”","Plugged (2–3 th)",
     "Memperdalam sebab-akibat digital: satu tindakan memicu satu reaksi (input → output).",
     "Mainan/aplikasi sebab-akibat","Menekan saklar lampu dan mengamati hasilnya (didampingi)."),
    (22,5,"Kalau Aku Tepuk","“Aku tepuk, kamu lompat.”","Unplugged",
     "Anak mengenal konsep kondisi sederhana “kalau… maka…”, dasar dari if-statement.",
     "Gerak tubuh, isyarat","Bermain “kalau Mama panggil, kita datang”."),
    (23,5,"Peta Karpet","“Jalan ke gambar apel.”","Unplugged",
     "Anak berjalan menuju tujuan mengikuti arah/petunjuk — bentuk sederhana dari algoritma jalan.",
     "Karpet / kartu gambar arah","Berjalan ke dapur mengikuti petunjuk orang tua."),
    (24,5,"Suruh si Boneka","“Boneka, ambil bola!”","Unplugged",
     "Anak memberi perintah kepada boneka/robot mainan untuk mengambil benda tertentu.",
     "Boneka / robot mainan","Menyuruh boneka “tidur” atau “makan” di rumah."),
    (25,5,"Tombol Ajaib","“Tombol ini bikin apa, ya?”","Plugged (2–3 th)",
     "Anak bereksplorasi menebak apa yang terjadi saat menekan tombol berbeda (singkat, didampingi).",
     "Aplikasi tombol sederhana","Mengamati tombol remote bersama orang tua (didampingi)."),

    (26,6,"Petualangan Warna","“Cari & susun warna!”","Unplugged",
     "Anak menggabungkan kemampuan mencocokkan dan berpola dalam satu permainan menyenangkan.",
     "Kartu & balok warna","Menyusun warna favorit bersama orang tua."),
    (27,6,"Jalan si Robot","“Maju, belok, sampai!”","Unplugged",
     "Anak memandu “robot” menuju tujuan; bila salah arah, diajak “oops, coba lagi” — pengenalan debugging.",
     "Karpet/rute, kartu arah","Bermain rute menuju kamar di rumah."),
    (28,6,"Layar Ceria","“Main game warna, yuk.”","Plugged (2–3 th)",
     "Permainan digital ringan yang menggabungkan warna, pola, dan sebab-akibat (singkat, didampingi).",
     "Aplikasi ringan gabungan","Istirahat dari layar di rumah, ganti bermain fisik."),
    (29,6,"Bermain Bersama","“Kita main sama teman!”","Unplugged",
     "Anak bermain dalam kelompok kecil, belajar berbagi dan bergiliran sambil menerapkan konsep yang dipelajari.",
     "Mainan bersama","Bermain dengan saudara/teman di rumah."),
    (30,6,"Pesta Wisuda Kecil","“Hore, kita hebat!”","Unplugged",
     "Perayaan penutup: mengulang lagu-lagu, pemberian stiker dan sertifikat sebagai apresiasi.",
     "Sertifikat, stiker, dekorasi","Memajang sertifikat di rumah sebagai kenang-kenangan."),
]

def rasio(jenis):
    return "Praktik 90% · Teori 10%"

# ---- Bangun blok Rencana Pembelajaran ----
def rp_block(m):
    no, th, topik, tujuan, jenis, deskripsi, media, tugas = m
    hari = f"Pertemuan ke-{no} (Tahap {th})"
    return f"""
<table class="rp avoid-break">
  <tr><td class="rpno">1</td><td class="rplabel">Pertemuan</td><td>{hari}</td></tr>
  <tr><td class="rpno">2</td><td class="rplabel">Topik</td><td><b>{topik}</b> &nbsp;<span class="tag">{jenis}</span></td></tr>
  <tr><td class="rpno">3</td><td class="rplabel">Deskripsi topik</td><td>{deskripsi}</td></tr>
  <tr><td class="rpno">4</td><td class="rplabel">Durasi</td><td>2 Jam (120 menit)</td></tr>
  <tr><td class="rpno">5</td><td class="rplabel">Rasio Praktik &amp; Teori</td><td>{rasio(jenis)}</td></tr>
  <tr><td class="rpno">6</td><td class="rplabel">Aktivitas kelas</td><td>Lagu &amp; sapaan · Pemanasan gerak · Bermain inti ({tujuan}) · Bermain bebas · Pengulangan · Penutup</td></tr>
  <tr><td class="rpno">7</td><td class="rplabel">Alat bantu/media</td><td>{media}; kartu lagu; stiker</td></tr>
  <tr><td class="rpno">8</td><td class="rplabel">Bahan bacaan/persiapan guru</td><td>Modul Bermain · Kartu Lagu · Video Konsep (untuk guru)</td></tr>
  <tr><td class="rpno">9</td><td class="rplabel">Persiapan peserta</td><td>Sudah makan &amp; cukup istirahat, memakai baju nyaman, membawa botol minum</td></tr>
  <tr><td class="rpno">10</td><td class="rplabel">Tugas (di rumah, bersama orang tua)</td><td>{tugas}</td></tr>
</table>
"""

# ---- Bangun tabel struktur per tahap ----
def struktur_tahap(th):
    cls, nama = TAHAP[th]
    rows = ""
    for m in M:
        if m[1] != th:
            continue
        no, _, topik, tujuan, jenis, deskripsi, media, tugas = m
        rows += f"<tr><td>{no}</td><td>{topik}</td><td>{tujuan}</td><td>{jenis}</td><td>2 jam</td></tr>\n"
    return f"""
<h3 class="{cls}">{nama}</h3>
<table>
  <tr><th style="width:5%">#</th><th style="width:26%">Topik</th><th style="width:37%">Tujuan (Bahasa Sederhana)</th><th style="width:20%">Jenis</th><th style="width:12%">Durasi</th></tr>
  {rows}
</table>
"""

# ---- Rincian kegiatan lengkap per pertemuan ----
# Segmen umum (pembukaan/istirahat/penutup) berlaku sama untuk semua pertemuan.
GEN_BUKA = ("Menyambut anak di pintu, mengajak duduk melingkar, menyanyikan lagu \u201cSelamat Pagi\u201d dan tepuk semangat, menyapa nama tiap anak.",
            "Duduk melingkar, ikut bernyanyi &amp; bertepuk, mengangkat tangan/menjawab saat namanya dipanggil.")
GEN_PANAS = ("Memimpin gerak lagu \u201cKepala Pundak Lutut Kaki\u201d untuk pemanasan &amp; fokus.",
             "Berdiri menirukan gerakan guru sambil bernyanyi.")
GEN_SNACK = ("Mendampingi cuci tangan, membagikan snack, mengajak berdoa singkat.",
             "Mencuci tangan, makan snack &amp; minum, beristirahat.")
GEN_REHAT = ("Memimpin peregangan/lagu relaksasi \u201cTepuk Angin\u201d agar anak tenang.",
             "Meregangkan badan, menarik napas, menirukan gerak lembut.")
GEN_TUTUP = ("Mengulang kata kunci hari itu, memberi pujian &amp; stiker, menyanyikan lagu penutup, menyampaikan tugas rumah kepada orang tua.",
             "Menerima stiker, ikut lagu penutup, melambaikan tangan \u201csampai jumpa\u201d.")

# CORE[no] = [(guru, anak) x3]  -> Penyampaian materi, Permainan inti, Pengulangan
CORE = {
 1:[("Memperkenalkan diri &amp; maskot \u201cRobi si Robot\u201d, menyebut nama tiap anak sambil bernyanyi \u201cDi mana \u2026?\u201d","Menyebut/mengangkat tangan saat namanya dipanggil, menyalami Robi."),
    ("Menuang balok besar, mengajak membangun \u201cmenara persahabatan\u201d bersama.","Mengambil &amp; menumpuk balok bebas bersama teman."),
    ("Mengajak menyebut nama teman di sebelah lalu tos.","Menyebut nama teman &amp; bertos.")],
 2:[("Menunjukkan kartu warna satu per satu, menyebut lantang \u201cMERAH!\u201d, mengajak menirukan.","Melihat kartu, menirukan menyebut nama warna."),
    ("Permainan \u201cAmbil Warna\u201d: menyebut satu warna, anak mengambil balok warna itu, lalu memuji.","Mencari &amp; mengangkat balok sesuai warna yang disebut."),
    ("Menempel kartu warna di dinding, meminta anak menunjuk/berlari ke warna yang disebut.","Menunjuk/berlari ke warna yang benar.")],
 3:[("Menunjukkan mainan tombol, menekan \u2192 \u201cDING!\u201d, menjelaskan \u201caku tekan, ada bunyi\u201d.","Mengamati &amp; mendengarkan bunyi."),
    ("Bergiliran memberi tiap anak menekan tombol (mainan/aplikasi), memuji tiap bunyi. Layar maks 10\u201315 menit.","Menekan tombol, mendengar bunyi/melihat lampu menyala."),
    ("Menyembunyikan tombol lalu bertanya \u201cmana yang bikin bunyi?\u201d","Mencari &amp; menekan tombol lagi.")],
 4:[("Memegang bola besar &amp; kecil, \u201cini BESAR, ini kecil\u201d, gerak tangan lebar/sempit.","Menirukan gerak &amp; kata \u2018besar\u2019/\u2018kecil\u2019."),
    ("Permainan \u201cMasukkan Bola\u201d: bola besar ke keranjang besar, kecil ke keranjang kecil; mencontohkan.","Memasukkan bola ke keranjang sesuai ukuran."),
    ("Meminta anak mencari benda besar/kecil di kelas.","Berkeliling mengambil &amp; menunjukkan benda.")],
 5:[("Menata pos mainan (balok, boneka, bola), menjelaskan anak boleh memilih.","Memilih pos main yang disukai."),
    ("Berkeliling menemani, bertanya \u201ckamu main apa?\u201d, memuji.","Bermain bebas di pos pilihan."),
    ("Mengajak beres-beres sambil lagu \u201cBereskan Mainan\u201d.","Memasukkan mainan ke kotak (latihan memilah awal).")],
 6:[("Memegang dua kartu sama &amp; satu beda, menegaskan \u201cini SAMA!\u201d","Mengamati, menyebut \u2018sama\u2019."),
    ("Permainan \u201cCari Pasangan\u201d: menyebar kartu, anak mencari dua kartu sama.","Memasangkan dua kartu yang sama."),
    ("Memegang satu benda, minta anak cari benda serupa di kelas.","Mencari benda yang sama.")],
 7:[("Menunjukkan keranjang merah &amp; biru, memasukkan bola merah ke keranjang merah.","Mengamati contoh memilah warna."),
    ("Permainan \u201cRumah Warna\u201d: anak memilah bola ke keranjang sesuai warna, dipandu &amp; dipuji.","Memilah bola per warna ke keranjang yang benar."),
    ("Menambah warna ketiga (kuning) sebagai tantangan.","Memilah tiga warna.")],
 8:[("Menunjukkan bentuk bulat &amp; kotak, \u201cbulat masuk lubang bulat\u201d.","Meraba &amp; mengamati bentuk."),
    ("Mainan sortir bentuk: membimbing anak memasukkan tiap bentuk ke lubangnya.","Mencocokkan bentuk ke lubang yang sesuai."),
    ("Menyembunyikan satu bentuk di kotak, anak meraba menebak.","Meraba &amp; menyebut bentuk.")],
 9:[("Menunjukkan layar dua gambar, mencontohkan menyentuh gambar yang sama.","Mengamati contoh di layar."),
    ("Mendampingi 1-1 anak bergiliran menyentuh gambar sama di tablet. Layar maks 10\u201315 menit.","Menyentuh gambar yang cocok di layar."),
    ("Mematikan layar, lanjut kartu fisik mencocokkan.","Memasangkan kartu gambar.")],
 10:[("Menumpahkan mainan campur, \u201cayo pisahkan besar &amp; kecil\u201d.","Mengamati aturan memilah."),
    ("Permainan \u201cDua Kotak\u201d: anak memisahkan mainan besar &amp; kecil ke dua kotak.","Memilah mainan ke kotak yang benar."),
    ("Mengganti kriteria menjadi warna.","Memilah ulang berdasarkan warna.")],
 11:[("Memperagakan \u201cambil DULU, LALU taruh\u201d pelan sambil menyebut urutan.","Mengamati urutan dua langkah."),
    ("Permainan \u201cDua Langkah\u201d: anak mengambil bola lalu memasukkan ke ember; guru menyebut \u201cdulu\u2026 lalu\u2026\u201d.","Melakukan dua langkah berurutan."),
    ("Menambah kartu urutan (1\u20132) sebagai panduan.","Melakukan sesuai urutan kartu.")],
 12:[("Menjadi \u201crobot\u201d, meminta anak berkata \u201cmaju\u201d/\u201cberhenti\u201d.","Mengamati &amp; mencoba memberi aba-aba."),
    ("Permainan \u201cRobot\u201d: anak memerintah guru/orang tua maju\u2013berhenti menuju mainan.","Memberi perintah berurutan ke \u2018robot\u2019."),
    ("Menambah perintah \u201cbelok\u201d.","Memberi tiga macam perintah.")],
 13:[("Menyusun balok \u201cbawah dulu, baru atas\u201d sambil menyebut urutan.","Mengamati cara menyusun."),
    ("Membimbing anak menyusun menara; menyemangati saat roboh (\u201ccoba lagi\u201d).","Menumpuk balok menjadi menara."),
    ("Meminta susun mengikuti urutan warna (merah bawah, biru atas).","Menyusun balok berurutan sesuai warna.")],
 14:[("Menaruh kartu tapak kaki di lantai, mencontohkan melangkah.","Mengamati rute tapak kaki."),
    ("Permainan \u201cJejak Kaki\u201d: anak berjalan menginjak tapak sesuai urutan; guru menghitung \u201csatu, dua, lompat!\u201d.","Melangkah mengikuti urutan tapak."),
    ("Mengubah urutan tapak kaki.","Mengikuti urutan baru.")],
 15:[("Mencontohkan menekan warna berurutan di robot/aplikasi (merah lalu biru).","Mengamati contoh urutan."),
    ("Mendampingi anak menekan warna sesuai urutan contoh. Layar maks 10\u201315 menit.","Menekan warna secara berurutan."),
    ("Lanjut versi fisik: mengurutkan dua balok warna.","Menyusun balok berurutan.")],
 16:[("Menyusun \u201cmerah, biru, merah, biru\u2026\u201d sambil menunjuk &amp; menyebut.","Mengamati pola AB."),
    ("Permainan \u201cLanjutkan\u201d: guru mulai pola, anak menaruh balok berikutnya.","Melanjutkan pola merah-biru."),
    ("Membuat pola baru (kuning-hijau).","Melanjutkan pola baru.")],
 17:[("Memperagakan pola \u201ctepuk, tepuk, injak\u201d berulang.","Mengamati &amp; mendengar pola."),
    ("Mengajak menirukan pola gerak-bunyi bersama, makin cepat.","Menirukan pola tepuk-injak."),
    ("Meminta anak membuat pola tepukan sendiri.","Menciptakan pola; teman menirukan.")],
 18:[("Memutar pola bunyi sederhana di aplikasi, \u201cdengar ya\u201d.","Mendengarkan pola bunyi."),
    ("Mendampingi anak menekan tombol mengulang pola bunyi. Layar maks 10\u201315 menit.","Mengulang pola bunyi di layar."),
    ("Lanjut menyanyi pola nada tanpa layar.","Menyanyikan pola nada.")],
 19:[("Meronce manik \u201cmerah, kuning, merah, kuning\u201d di depan anak.","Mengamati pola roncean."),
    ("Membantu memegang tali; anak meronce manik besar berpola.","Memasukkan manik bergantian sesuai pola."),
    ("Menantang pola tiga warna.","Meronce pola lebih panjang.")],
 20:[("Memamerkan beberapa contoh pola dari benda.","Memilih benda untuk berpola."),
    ("Berkeliling memuji &amp; menyebut pola buatan anak.","Menyusun pola bebas sendiri."),
    ("Mengajak \u201cpawai pola\u201d, tiap anak menunjukkan polanya.","Memperlihatkan &amp; menyebut polanya.")],
 21:[("Menekan tombol \u2192 lampu menyala, \u201caku tekan, lampu nyala\u201d.","Mengamati sebab-akibat."),
    ("Mendampingi anak menekan tombol &amp; melihat akibat (nyala/bunyi/gerak). Layar maks 10\u201315 menit.","Menekan &amp; mengamati akibatnya."),
    ("Bertanya \u201ckalau tidak ditekan?\u201d untuk menegaskan sebab-akibat.","Mencoba menekan/tidak &amp; membandingkan.")],
 22:[("\u201cKALAU aku tepuk, kamu lompat\u201d, mencontohkan sekali.","Mengamati aturan \u2018kalau-maka\u2019."),
    ("Permainan \u201cKalau-Maka\u201d: guru tepuk \u2192 anak lompat; guru diam \u2192 anak diam.","Bereaksi sesuai kondisi/aturan."),
    ("Menambah aturan (angkat tangan \u2192 jongkok).","Mengikuti dua aturan.")],
 23:[("Menunjuk gambar tujuan (apel) di karpet, \u201ckita jalan ke apel\u201d.","Melihat rute tujuan."),
    ("Memandu anak berjalan mengikuti kartu arah menuju tujuan.","Berjalan mengikuti petunjuk arah."),
    ("Mengganti tujuan (pisang).","Berjalan ke tujuan baru.")],
 24:[("Memegang boneka, mencontohkan \u201cboneka, ambil bola\u201d lalu menggerakkannya.","Mengamati perintah ke boneka."),
    ("Menggerakkan boneka/robot sesuai perintah anak untuk mengambil benda.","Memberi perintah ke boneka/robot."),
    ("Meminta perintah dua langkah (\u201cambil bola, taruh di kotak\u201d).","Memberi perintah berurutan.")],
 25:[("Menunjukkan beberapa tombol berbeda, \u201cayo tebak, ini bikin apa?\u201d","Mengamati tombol-tombol."),
    ("Mendampingi anak menekan tombol berbeda &amp; menamai hasilnya. Layar maks 10\u201315 menit.","Mencoba menekan &amp; menebak hasil."),
    ("Lanjut tanpa layar: menebak bunyi alat musik.","Menebak sumber bunyi.")],
 26:[("Menyiapkan pos \u201ccari warna\u201d lalu \u201csusun pola\u201d.","Mengamati alur permainan."),
    ("Memandu tiap pos: anak mencari kartu warna lalu menyusunnya jadi pola.","Mencari warna &amp; menyusun pola (gabungan)."),
    ("Meminta anak menyebut warna &amp; pola buatannya.","Menceritakan hasil karyanya.")],
 27:[("Menata rute, \u201ckita antar robot ke rumah: maju, belok\u201d.","Melihat rute robot."),
    ("Anak memandu \u2018robot\u2019 ke tujuan; bila salah arah guru berkata \u201cOops, coba lagi ya!\u201d","Memberi &amp; memperbaiki perintah (debugging sederhana)."),
    ("Membuat rute sedikit berbeda.","Memandu ulang &amp; memperbaiki.")],
 28:[("Membuka aplikasi gabungan (warna+pola+sebab-akibat), mencontohkan.","Mengamati contoh di layar."),
    ("Mendampingi 1-1 anak bermain game ringan menerapkan konsep. Layar maks 10\u201315 menit.","Bermain terarah di layar."),
    ("Mematikan layar, mengajak gerak/bernyanyi.","Bergerak &amp; bernyanyi.")],
 29:[("Membagi kelompok kecil, menjelaskan \u201cmain bergiliran &amp; berbagi\u201d.","Duduk berkelompok."),
    ("Memfasilitasi giliran saat kelompok menyusun pola/menara bersama.","Bermain bersama, berbagi &amp; bergiliran."),
    ("Mengajak tos &amp; memuji kerja sama.","Bertos &amp; menyebut nama teman.")],
 30:[("Menghias kelas, mengulang lagu-lagu favorit.","Ikut bernyanyi gembira."),
    ("\u201cPawai Hebat\u201d: tiap anak menunjukkan satu hal yang dipelajari (warna/pola/perintah).","Unjuk kebolehan di depan teman."),
    ("Membagikan sertifikat &amp; stiker, foto bersama.","Menerima sertifikat &amp; merayakan.")],
}

def detail_block(no):
    c = CORE[no]
    seg = [
        ("1. Pembukaan (15\u2019)", *GEN_BUKA),
        ("2. Pemanasan (10\u2019)", *GEN_PANAS),
        ("3. Penyampaian Materi &amp; Contoh (20\u2019)", c[0][0], c[0][1]),
        ("4. Snack &amp; Minum (15\u2019)", *GEN_SNACK),
        ("5. Permainan Inti (20\u2019)", c[1][0], c[1][1]),
        ("6. Pengulangan/Variasi (15\u2019)", c[2][0], c[2][1]),
        ("7. Istirahat Gerak (10\u2019)", *GEN_REHAT),
        ("8. Penutup (15\u2019)", *GEN_TUTUP),
    ]
    rows = "".join(
        f"<tr><td class='detseg'>{s}</td><td>{g}</td><td>{a}</td></tr>\n" for s, g, a in seg
    )
    return f"""
<div class='detcap'>Rincian Kegiatan Pertemuan ke-{no}</div>
<table class='det avoid-break'>
  <tr><th style='width:22%'>Segmen (2 jam)</th><th style='width:39%'>Kegiatan Guru (penyampaian &amp; permainan)</th><th style='width:39%'>Kegiatan Anak</th></tr>
  {rows}
</table>
"""

rp_all = ""
current = 0
for m in M:
    if m[1] != current:
        current = m[1]
        cls, nama = TAHAP[current]
        rp_all += f'<h3 class="{cls}">{nama}</h3>\n'
    rp_all += rp_block(m) + detail_block(m[0])

struktur_all = "".join(struktur_tahap(t) for t in range(1, 7))

HTML = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Silabus Pra-Coding Anak Usia Dini (1–3 Tahun) — 30 Pertemuan @ 2 Jam</title>
<style>
  @page {{ size: A4; margin: 16mm 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: "Segoe UI", Arial, sans-serif; color:#1f2937; font-size:11px; line-height:1.5; margin:0; }}
  h1 {{ font-size:22px; color:#0f766e; margin:0 0 4px; }}
  h2 {{ font-size:15px; color:#fff; background:#0f766e; padding:6px 10px; border-radius:6px; margin:22px 0 10px; }}
  h3 {{ font-size:12.5px; margin:16px 0 6px; padding:5px 8px; border-radius:5px; }}
  .subtitle {{ color:#475569; font-size:12px; margin:0 0 2px; }}
  .cover {{ border:2px solid #0f766e; border-radius:12px; padding:22px 20px; background:linear-gradient(135deg,#f0fdfa,#ecfeff); margin-bottom:8px; }}
  .cover .badge {{ display:inline-block; background:#0f766e; color:#fff; font-size:10px; padding:3px 10px; border-radius:20px; margin-bottom:8px; letter-spacing:.5px; }}
  .meta {{ margin-top:10px; font-size:11px; color:#334155; }}
  .meta b {{ color:#0f766e; }}
  table {{ width:100%; border-collapse:collapse; margin:8px 0; font-size:10px; }}
  th, td {{ border:1px solid #cbd5e1; padding:5px 7px; text-align:left; vertical-align:top; }}
  th {{ background:#ccfbf1; color:#134e4a; font-weight:600; }}
  tr:nth-child(even) td {{ background:#f8fafc; }}
  .note {{ border-left:4px solid #f59e0b; background:#fffbeb; padding:10px 14px; border-radius:0 8px 8px 0; margin:10px 0; }}
  .note ol {{ margin:6px 0 0; padding-left:18px; }} .note li {{ margin-bottom:6px; }}
  ul.tight {{ margin:4px 0; padding-left:18px; }}
  .phase1 {{ background:#dcfce7; color:#166534; }} .phase2 {{ background:#dbeafe; color:#1e40af; }}
  .phase3 {{ background:#fef9c3; color:#854d0e; }} .phase4 {{ background:#ffedd5; color:#9a3412; }}
  .phase5 {{ background:#f3e8ff; color:#6b21a8; }} .phase6 {{ background:#fee2e2; color:#991b1b; }}
  .src {{ font-size:9.5px; color:#475569; }} .src li {{ margin-bottom:3px; }}
  .footer {{ margin-top:18px; font-size:9.5px; color:#64748b; text-align:center; border-top:1px solid #e2e8f0; padding-top:8px; }}
  .col2 {{ column-count:2; column-gap:18px; }}
  .avoid-break {{ break-inside:avoid; }}
  .page-break {{ break-before:page; }}
  .disc {{ font-size:9px; color:#94a3b8; margin-top:6px; }}
  table.rp {{ margin:8px 0 14px; }}
  table.rp td {{ font-size:10px; }}
  .rpno {{ width:5%; text-align:center; background:#f1f5f9; font-weight:600; color:#0f766e; }}
  .rplabel {{ width:26%; background:#f8fafc; font-weight:600; color:#334155; }}
  .tag {{ display:inline-block; font-size:8.5px; background:#e0f2fe; color:#075985; padding:1px 6px; border-radius:10px; }}
  table.det {{ margin:4px 0 16px; }}
  table.det td {{ font-size:9.5px; }}
  .det th {{ background:#e0f2fe; color:#075985; }}
  .detseg {{ width:22%; background:#f8fafc; font-weight:600; color:#0f766e; }}
  .detcap {{ font-size:10px; font-weight:600; color:#0f766e; margin:6px 0 2px; }}
</style>
</head>
<body>

<div class="cover">
  <span class="badge">SILABUS PELATIHAN</span>
  <h1>Pengenalan Pra-Coding untuk Anak Usia Dini (1–3 Tahun)</h1>
  <p class="subtitle"><b>Tema:</b> Belajar Berpikir Seperti Komputer Lewat Bermain (Pra-Coding &amp; Computational Thinking)</p>
  <div class="meta">
    <b>Sasaran:</b> Anak usia 1–3 tahun (batita), didampingi orang tua/guru &nbsp;•&nbsp;
    <b>Durasi:</b> 30 pertemuan @ <b>2 jam (120 menit)</b> &nbsp;•&nbsp;
    <b>Metode:</b> Unplugged (utama) + Plugged (pendukung, singkat) &nbsp;•&nbsp;
    <b>Sertifikat:</b> Certificate of Participation
  </div>
  <p class="disc">Terinspirasi dari format “Silabus Pelatihan Pengenalan Coding” Digital Talent Scholarship – Kementerian Kominfo RI, diadaptasi untuk anak usia dini dan diselaraskan dengan riset pendidikan anak usia dini (lihat Referensi).</p>
</div>

<h2>⭐ Catatan Penting (Wajib Dibaca Guru &amp; Orang Tua)</h2>
<div class="note">
  <ol>
    <li><b>Anak batita belum bisa membaca &amp; menulis.</b> Semua materi lewat <b>bermain, lagu, gambar, warna, dan gerakan</b> — bukan teks/kode. Yang diajarkan adalah <b>dasar berpikir coding</b> (urutan, pola, sebab-akibat), bukan bahasa pemrograman.</li>
    <li><b>Durasi 2 jam diisi banyak segmen pendek.</b> Fokus batita hanya 10–20 menit sekali main, maka satu pertemuan 120 menit dibagi menjadi: sapaan, beberapa sesi bermain singkat, <b>snack</b>, <b>bermain bebas</b>, dan <b>istirahat</b> — bukan duduk fokus 2 jam.</li>
    <li><b>Batasi waktu layar (screen time)</b> sesuai WHO/AAP: usia <b>1–2 th sebaiknya tanpa layar</b>; usia <b>2–3 th maksimal 5–15 menit</b> per pertemuan &amp; <b>selalu didampingi</b>. Mayoritas kegiatan (±70%) tetap <b>unplugged</b>.</li>
    <li><b>Gunakan bahasa yang sangat sederhana</b> &amp; diulang-ulang dengan nada ceria: “Ayo urutkan!”, “Mana yang sama?”, “Merah dulu, baru biru.”</li>
    <li><b>Keamanan nomor satu.</b> Mainan harus <b>besar</b> (anti tertelan); selalu ada orang dewasa; perangkat dijauhkan dari mulut &amp; air.</li>
    <li><b>Penilaian lewat pengamatan, bukan ujian</b> (😊 senang &amp; ikut · 😐 kadang ikut · 🙁 belum mau).</li>
    <li><b>Peran orang dewasa = “robot yang dijalankan anak”</b> untuk mengenalkan konsep perintah/urutan.</li>
    <li><b>“Salah itu boleh” (debugging sederhana):</b> ajarkan “Oops, coba lagi ya!” agar anak berani memperbaiki tanpa takut salah.</li>
  </ol>
</div>

<h2>Informasi Pelatihan &amp; Sertifikat</h2>
<table>
  <tr><th style="width:32%">Item</th><th>Keterangan</th></tr>
  <tr><td>Tema Pelatihan</td><td>Pengenalan Pra-Coding untuk Anak Usia Dini (1–3 Tahun)</td></tr>
  <tr><td>Sertifikat</td><td>Certificate of Participation</td></tr>
  <tr><td>Durasi</td><td>30 pertemuan @ 2 jam (120 menit) — total 60 jam</td></tr>
  <tr><td>Metode</td><td>Unplugged (utama) + Plugged (pendukung, singkat)</td></tr>
  <tr><td>Kapasitas Kelas</td><td>5–8 anak/kelas (masing-masing 1 pendamping dewasa)</td></tr>
  <tr><td>Alat Utama</td><td>Balok besar, kartu warna/gambar, boneka, mainan sortir; (opsional) robot mainan Bee-Bot/Cubetto/Code-a-pillar, tablet ScratchJr</td></tr>
</table>

<h3 class="phase1">Deskripsi Pelatihan</h3>
<p>Program bermain yang mengenalkan <b>dasar berpikir komputer</b> kepada anak usia dini melalui permainan sederhana. Anak belajar konsep <b>urutan (sequence)</b>, <b>pola (pattern)</b>, <b>sebab-akibat (cause &amp; effect)</b>, <b>mencocokkan (matching)</b>, <b>memilah (sorting)</b>, serta <b>memperbaiki kesalahan (debugging sederhana)</b> — semuanya lewat bermain. Pendekatan ini sejalan dengan riset pendidikan anak usia dini yang menunjukkan aktivitas <i>unplugged</i> paling efektif menumbuhkan <i>computational thinking</i> pada usia prasekolah.</p>

<div class="col2">
  <div class="avoid-break">
    <h3 class="phase2">Persyaratan &amp; Sarana</h3>
    <p><b>Peserta:</b> anak usia 1–3 tahun, didampingi 1 orang tua/pengasuh sepanjang kegiatan.</p>
    <p><b>Sarana Unplugged:</b> balok besar warna-warni, kartu gambar/warna besar, boneka/mainan, keranjang sortir, matras/karpet, stiker.</p>
    <p><b>Sarana Plugged (opsional, 2–3 th):</b> robot mainan (Bee-Bot/Cubetto/Code-a-pillar) atau tablet dengan aplikasi sederhana (mis. ScratchJr), tombol besar, volume aman.</p>
  </div>
  <div class="avoid-break">
    <h3 class="phase2">Sistem Penilaian (Berbasis Pengamatan)</h3>
    <p>Tidak ada tes. Guru mengisi lembar pengamatan dengan simbol 😊/😐/🙁. Yang diamati:</p>
    <ul class="tight">
      <li><b>Partisipasi</b> — mau ikut bermain</li>
      <li><b>Meniru</b> — meniru urutan/gerakan guru</li>
      <li><b>Pengenalan</b> — mengenali warna/bentuk/suara</li>
      <li><b>Sebab-akibat</b> — paham “tekan → terjadi sesuatu”</li>
      <li><b>Emosi</b> — terlihat senang/nyaman</li>
    </ul>
  </div>
</div>

<div class="page-break"></div>
<h2>Struktur 30 Pertemuan (Ringkasan)</h2>
<p>Program dibagi menjadi <b>6 tahap</b> × <b>5 pertemuan</b>. Setiap pertemuan berdurasi <b>2 jam</b>.</p>
{struktur_all}

<h2>Susunan Waktu Satu Pertemuan (2 Jam / 120 Menit)</h2>
<table>
  <tr><th style="width:60%">Kegiatan</th><th style="width:20%">Waktu</th><th style="width:20%">Sifat</th></tr>
  <tr><td>1. Penyambutan &amp; lagu pembuka</td><td>15 menit</td><td>Unplugged</td></tr>
  <tr><td>2. Pemanasan gerak / menari</td><td>10 menit</td><td>Unplugged</td></tr>
  <tr><td>3. Bermain inti (materi hari itu) — sesi 1</td><td>20 menit</td><td>Sesuai topik</td></tr>
  <tr><td>4. Snack &amp; minum</td><td>15 menit</td><td>Istirahat</td></tr>
  <tr><td>5. Bermain bebas terarah</td><td>20 menit</td><td>Unplugged</td></tr>
  <tr><td>6. Pengulangan materi — sesi 2</td><td>15 menit</td><td>Sesuai topik</td></tr>
  <tr><td>7. Istirahat gerak / relaksasi</td><td>10 menit</td><td>Unplugged</td></tr>
  <tr><td>8. Penutup: pujian, stiker, lagu penutup</td><td>15 menit</td><td>Unplugged</td></tr>
  <tr><td><b>Total</b></td><td><b>120 menit</b></td><td></td></tr>
</table>
<p><b>Rasio umum:</b> Bermain (praktik) 90% — Penjelasan 10%. Bagian layar (plugged) maksimal 5–15 menit di dalam blok 2 jam, selalu didampingi.</p>

<div class="page-break"></div>
<h2>Rencana Pembelajaran per Pertemuan (30 Pertemuan)</h2>
<p class="disc">Format mengikuti contoh Silabus DTS Kominfo — setiap pertemuan dirinci dalam 10 poin.</p>
{rp_all}

<h2>Ringkasan Metode Unplugged vs Plugged</h2>
<table>
  <tr><th style="width:20%"></th><th>Unplugged (tanpa komputer)</th><th>Plugged (komputer/tablet/robot)</th></tr>
  <tr><td>Porsi</td><td>±70% (utama)</td><td>±30% (pendukung)</td></tr>
  <tr><td>Usia 1–2 th</td><td>✅ Ya</td><td>❌ Sebaiknya tidak</td></tr>
  <tr><td>Usia 2–3 th</td><td>✅ Ya</td><td>✅ Maks 5–15 menit, didampingi</td></tr>
  <tr><td>Contoh</td><td>Balok, kartu, boneka, gerakan</td><td>Bee-Bot, Cubetto, Code-a-pillar, ScratchJr</td></tr>
</table>

<h2>Referensi &amp; Dasar Ilmiah</h2>
<ul class="src">
  <li>Zurnacı, B. (2024). <i>Educational robotics or unplugged coding activities in early childhood?</i> — Thinking Skills and Creativity (ScienceDirect). Temuan: aktivitas <b>unplugged coding memberi pemahaman computational thinking tertinggi</b>.</li>
  <li>Saygıner, Ş. &amp; Tüzün, H. (2025). <i>Investigation of the effects of unplugged coding activities developed for preschool on motivation, computational thinking and problem-solving skills.</i> — Hacettepe University.</li>
  <li>Chen, Y. L. (2026). <i>Incorporating unplugged computational thinking teaching into preschool theme-based curriculum.</i> — Computers and Children.</li>
  <li>Bers, M. U. — <i>Coding as a Playground / powerful ideas of coding</i> (DevTech, Tufts).</li>
  <li>Pedoman waktu layar: <b>WHO</b> (Guidelines for children under 5) &amp; <b>AAP</b>.</li>
  <li>Alat rujukan ramah usia dini: Bee-Bot, Cubetto, Fisher-Price Code-a-pillar, ScratchJr.</li>
</ul>
<p class="disc">Catatan: judul &amp; tahun dikutip dari hasil pencarian daring; harap verifikasi tautan sumber sebelum publikasi resmi.</p>

<div class="footer">
  Versi Silabus #2 — Anak usia 1–3 tahun · 30 pertemuan @ 2 jam · unplugged &amp; plugged · bahasa sederhana ·
  Format mengikuti contoh DTS Kominfo RI &amp; diselaraskan riset PAUD.
</div>

</body>
</html>
"""

with open("Silabus-PraCoding-Batita-30Pertemuan.html", "w", encoding="utf-8") as f:
    f.write(HTML)
print("HTML ditulis:", len(HTML), "karakter")
