---
name: whisper
description: Skill untuk speech-to-text dengan OpenAI Whisper (transkripsi audio multibahasa, translasi ke Inggris, identifikasi bahasa). Transcribe or translate audio using OpenAI Whisper — robust multilingual speech recognition via CLI or Python API. Use when asked to "transcribe audio", "speech to text", "convert audio to text", "subtitle generation", or anything Whisper-related.
license: MIT
metadata:
  author: openai/whisper
  version: "1.0"
---

# Whisper (Speech Recognition)

Sumber: https://github.com/openai/whisper (MIT). Instal langsung via pip — tidak perlu clone.

## Apa ini

Model speech recognition serbaguna dari OpenAI: transkripsi multibahasa (termasuk Indonesia), translasi ucapan ke teks Inggris, dan identifikasi bahasa. Membutuhkan Python 3.8–3.11, PyTorch, dan `ffmpeg`.

## Instalasi

```bash
pip install -U openai-whisper   # rilis stabil
# atau versi terbaru dari GitHub:
pip install git+https://github.com/openai/whisper.git
# dependensi sistem:
sudo apt-get install -y ffmpeg
```

## Pemakaian CLI

```bash
whisper audio.mp3 --model turbo                       # transkripsi otomatis
whisper audio.mp3 --model turbo --language Indonesian # paksa bahasa
whisper audio.mp3 --model medium --task translate     # translate ke Inggris
```

Output default: `.txt`, `.srt`, `.vtt`, `.tsv`, `.json`.

## Pemakaian Python

```python
import whisper

model = whisper.load_model("turbo")
result = model.transcribe("audio.mp3")
print(result["text"])
```

## Pemilihan model

| Model | VRAM | Kecepatan | Catatan |
|---|---|---|---|
| tiny/base | ~1 GB | tercepat | draft cepat, akurasi rendah |
| small/medium | 2–5 GB | sedang | keseimbangan bagus |
| turbo | ~6 GB | cepat | rekomendasi default (hanya transkripsi) |
| large | ~10 GB | lambat | akurasi terbaik, wajib untuk translate terbaik |

## Aturan kerja

- Unduhan model tersimpan di `~/.cache/whisper` — bisa besar (ratusan MB–GB).
- Detail model & batasan: `model-card.md` di repo sumber.
