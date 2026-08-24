---
name: open-seo
description: Skill untuk OpenSEO — alternatif open source Semrush/Ahrefs (riset keyword, audit SEO, analisis kompetitor, local SEO). Run and use OpenSEO, an open source alternative to Semrush and Ahrefs with built-in AI skills for keyword research, keyword clustering, SEO audit, competitor analysis, local SEO, and link prospecting. Use when asked about "openseo", keyword research tooling, SEO data (DataForSEO), or self-hosting an SEO suite.
license: MIT
metadata:
  author: every-app/open-seo
  version: "1.0"
---

# OpenSEO

Sumber: https://github.com/every-app/open-seo (MIT). Kode tidak disimpan di repo ini — clone dulu saat dibutuhkan:

```bash
git clone --depth 1 https://github.com/every-app/open-seo.git /tmp/open-seo
```

Setelah clone, baca `README.md`, `CLAUDE.md`, dan `AGENTS.md` sebelum bekerja.

## Apa ini

Tool SEO all-in-one yang self-hosted dan pay-as-you-go (bring your own DataForSEO API key). Dirancang untuk dipakai bersama AI agent lewat MCP dan skill bawaan.

## Sub-skill bawaan (.agents/skills/ di repo sumber)

Repo ini membawa skill SEO siap pakai — setelah clone, muat SKILL.md yang relevan dari `.agents/skills/<nama>/`:

| Sub-skill | Kegunaan |
|---|---|
| `keyword-research` | Riset keyword & search volume |
| `keyword-clustering` | Kelompokkan keyword per topik/intent |
| `seo-audit` | Audit SEO teknis sebuah situs |
| `competitor-analysis`, `competitive-landscape` | Analisis kompetitor & lanskap |
| `local-seo` | SEO lokal (Google Business dsb.) |
| `link-prospecting` | Cari peluang backlink |
| `seo-coach`, `seo-project-setup` | Pendampingan strategi & setup proyek SEO |

Catatan: skill generik `seo`, `core-web-vitals`, dll. di `.claude/skills/` tetap dipakai untuk optimasi on-page; sub-skill OpenSEO unggul saat butuh data keyword/kompetitor nyata.

## Menjalankan

```bash
cd /tmp/open-seo
docker compose -f compose.yaml up -d   # self-host (lihat Dockerfile.selfhost)
```

Stack: TypeScript, Drizzle ORM, Alchemy. Butuh DataForSEO API key untuk data — jangan hardcode, pakai env.

## Aturan kerja

- Ikuti konvensi `CLAUDE.md` repo tersebut saat mengubah kodenya.
