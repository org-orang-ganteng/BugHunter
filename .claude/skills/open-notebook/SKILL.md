---
name: open-notebook
description: Skill untuk menjalankan & mengembangkan Open Notebook (alternatif open source Notebook LM yang privacy-focused). Run, configure, and develop Open Notebook — an open source, privacy-focused alternative to Google's Notebook LM with notebooks, sources, AI chat, transformations, and podcast generation. Use when asked about "open notebook", "notebook lm alternative", running or modifying the open-notebook app.
license: MIT
metadata:
  author: lfnovo/open-notebook
  version: "1.0"
---

# Open Notebook

Sumber: https://github.com/lfnovo/open-notebook (MIT). Kode tidak disimpan di repo ini — clone dulu saat dibutuhkan:

```bash
git clone --depth 1 https://github.com/lfnovo/open-notebook.git /tmp/open-notebook
```

## Apa ini

Alternatif open source untuk Google Notebook LM: kelola notebook, tambahkan sumber (PDF, web, audio, video), chat dengan AI berbasis sumber, buat transformasi konten, dan generate podcast. Mendukung banyak provider AI (OpenAI, Anthropic, Ollama, dll).

## Mulai dari sini

Setelah clone, baca dokumen berikut (path relatif terhadap hasil clone):

| Kebutuhan | Baca |
|---|---|
| Instalasi & mulai cepat | `docs/0-START-HERE/index.md` |
| Konfigurasi provider AI & env | `CONFIGURATION.md` |
| Arsitektur & konvensi kode | `CLAUDE.md` dan `AGENTS.md` |
| Kontribusi / development | `README.dev.md`, `CONTRIBUTING.md` |

## Menjalankan

Cara paling cepat adalah Docker Compose:

```bash
cd /tmp/open-notebook
docker compose up -d
```

Untuk development lokal, ikuti `README.dev.md` (ada `Makefile` dan `dev-init.sh`). Backend berupa API (folder `api/`) dengan database SurrealDB.

## Aturan kerja

- Ikuti konvensi di `CLAUDE.md` repo tersebut saat mengubah kodenya.
- Jangan hardcode API key; gunakan environment variables sesuai `CONFIGURATION.md`.
