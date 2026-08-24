---
name: ai-job-search
description: Skill untuk framework lamaran kerja berbasis AI (evaluasi lowongan, tailoring CV, surat lamaran, persiapan interview). AI job application framework built on Claude Code — evaluate postings, tailor CVs, write cover letters, prep interviews, scrape job portals, track outcomes. Use when asked about job search automation, CV tailoring, cover letters, interview prep, or the /scrape /apply /interview workflow.
license: MIT
metadata:
  author: MadsLorentzen/ai-job-search
  version: "1.0"
---

# AI Job Search

Sumber: https://github.com/MadsLorentzen/ai-job-search (MIT). Framework ini didesain untuk di-fork/clone dan diisi profil pribadi — clone dulu saat dibutuhkan:

```bash
git clone --depth 1 https://github.com/MadsLorentzen/ai-job-search.git /tmp/ai-job-search
```

Setelah clone, baca `README.md`, `SETUP.md`, dan `CLAUDE.md` sebelum bekerja.

## Apa ini

Framework pencarian kerja yang berjalan lokal: scrape lowongan, ranking kecocokan, tailoring CV per lowongan, tulis surat lamaran, persiapan interview, dan pelacakan hasil. Terbukti dipakai pembuatnya sampai mendapat kontrak kerja.

## Alur kerja utama (.claude/commands/ di repo sumber)

| Command | Kegunaan |
|---|---|
| `setup.md` | Setup profil awal (CV, preferensi, portal) |
| `apply.md` | Evaluasi lowongan → tailor CV → surat lamaran |
| `rank.md` | Ranking lowongan hasil scrape berdasar kecocokan |
| `interview.md` | Persiapan interview untuk lowongan tertentu |
| `expand.md`, `add-portal.md` | Tambah sumber/portal lowongan baru |
| `outcome.md`, `html-report.md` | Catat hasil & laporan funnel |
| `gmail-sync.md`, `notion-sync.md` | Sinkronisasi eksternal |

Sub-skill pencarian portal ada di `.agents/skills/` (`linkedin-search`, `jobindex-search`, dll. — sebagian spesifik Denmark; gunakan `add-portal` untuk portal lokal seperti JobStreet/Glints).

## Cara pakai

1. Isi profil: folder `cv/` dan `documents/` (data pribadi tetap lokal, jangan di-commit bila sensitif).
2. Ikuti `SETUP.md` untuk konfigurasi awal.
3. Jalankan alur: scrape (folder `job_scraper/`) → rank → apply → interview.

## Aturan kerja

- Jangan pernah mengarang pengalaman/kualifikasi di CV atau surat lamaran — hanya pakai data profil user.
