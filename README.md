ude# BugHunter

Repo untuk menguji dan mencari bug pada website/web app menggunakan **Agent Skills** (Claude).

## Cara memanggil skill

Tidak ada sintaks khusus — cukup **deskripsikan masalahmu**. Ada tiga cara:

- **Frasa pemicu `/cloude skill` (jalan pintas):** ketik `/cloude skill` untuk minta Claude memilih sendiri skill yang cocok dengan masalahmu.
  - Kalau kamu langsung menyebut masalah → Claude pilih & jalankan skill yang sesuai.
    > *"/cloude skill — situs saya lambat di localhost:3000"*
  - Kalau hanya `/cloude skill` tanpa detail → Claude tanya dulu (lihat template di bawah), lalu jalankan.
- **Implisit (disarankan):** ceritakan masalah dengan bahasa biasa, skill yang cocok akan dipakai otomatis.
  > *"Cek bug di halaman login localhost:5173"*
- **Eksplisit:** sebut nama skill kalau ingin memaksa skill tertentu.
  > *"Pakai skill `webapp-testing` untuk test form pendaftaran"*

## Peta cepat: masalah → skill → contoh prompt

| Kalau masalahmu... | Skill dipakai | Contoh prompt siap tempel |
|---|---|---|
| Ingin mengkloning website secara legal | `clone-website` | `Clone website https://situs-saya.com ke project lokal ini` |
| Ada bug/error di web app | `webapp-testing` | `Test dan cari bug di https://situs-saya.com, kasih laporannya` |
| Fungsi frontend perlu diverifikasi | `webapp-testing` | `Pastikan tombol "Simpan" di localhost:5173 berfungsi` |
| Butuh screenshot/log browser | `webapp-testing` | `Ambil screenshot & console log halaman checkout` |
| Cek UI di layar HP (responsif) | `webapp-testing` | `Cek apakah halaman ini responsif di viewport mobile` |
| Audit menyeluruh (performa+a11y+SEO) | `web-quality-audit` | `Audit kualitas web https://situs-saya.com secara menyeluruh` |
| Situs lambat / load lama | `performance` | `Situs saya lambat, optimasi performa & load time-nya` |
| Skor Core Web Vitals jelek (LCP/INP/CLS) | `core-web-vitals` | `Perbaiki LCP dan CLS di halaman ini` |
| Aksesibilitas / dukungan screen reader | `accessibility` | `Audit aksesibilitas WCAG 2.2 halaman login` |
| Peringkat pencarian / meta tag | `seo` | `Perbaiki SEO & meta tag halaman produk` |
| Keamanan & kualitas kode | `best-practices` | `Cek kerentanan keamanan & terapkan best practice` |
| Repository besar / relasi antar-symbol | `codebase-memory` | `Petakan relasi symbol dan arsitektur repository ini` |
| Three.js / WebGL 3D | `threejs-*` | `Buat scene Three.js dengan model GLTF dan pencahayaan` |
| Animasi GSAP | `gsap-*` | `Buat animasi scroll dengan GSAP ScrollTrigger` |
| Design system / visual DNA | `design-dna` | `Turunkan design DNA dari halaman ini` |
| Motion design / animasi antarmuka | `motion-design` | `Rancang motion system untuk halaman dashboard` |

> Daftar skill terpasang ada di folder [`.claude/skills/`](.claude/skills). Tambah skill baru = tambah folder berisi `SKILL.md`, dan peta di atas bisa diperluas.

Sumber skill pihak ketiga, snapshot commit, dan status lisensinya dicatat di [`THIRD-PARTY-SKILLS.md`](.claude/skills/THIRD-PARTY-SKILLS.md). `codebase-memory` di sini adalah panduan penggunaan MCP, bukan server MCP lengkap. Skill Three.js menyatakan MIT di README sumber, tetapi repository sumber tidak menyertakan file `LICENSE`; perlakukan status itu sebagai catatan sebelum mendistribusikan ulang.

## Alur "tanya dulu kalau ambigu"

Aturan mainnya:

1. **Kalau masalah sudah jelas** (URL + apa yang dicek disebutkan) → langsung dikerjakan, tanpa banyak tanya.
2. **Kalau masih ambigu** (mis. hanya mengetik `/cloude skill`) → saya tanya dulu memakai template ini sebelum menjalankan skill:

```
1. Apa masalah / target yang mau diuji?  (mis. bug, verifikasi fungsi, cek tampilan)
2. URL atau lokasinya di mana?            (mis. https://... atau localhost:PORT)
3. Bagian spesifik mana yang disorot?     (mis. halaman login, form checkout, seluruh situs)
4. Hasil yang diharapkan seperti apa?     (mis. laporan bug, screenshot, perbaikan kode)
```

Setelah jawabanmu lengkap, skill yang sesuai langsung saya jalankan dan hasilnya saya laporkan.
