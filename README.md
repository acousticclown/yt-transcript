# YT-Transcript

An open-source, personal-first YouTube Transcript and Smart Notes generator.

🚧 Work in progress.

## Vision
Turn long-form YouTube content into:
- Clean transcripts
- Structured notes
- Editable sections
- Playful learning experiences

## Tech Stack
- Next.js
- Bun
- Gemini AI (free tier) - for summaries and section detection
- Tailwind
- @xenova/transformers - local Whisper model (free, no API needed)
- yt-dlp-exec - audio extraction from YouTube (requires yt-dlp binary)

## Features
- ✅ YouTube transcript extraction (primary method)
- ✅ Audio extraction + local Whisper transcription (fallback for videos without captions)
- ✅ AI-powered summaries (Gemini)
- ✅ Structured section detection
- ✅ Editable UI with inline editing
- ✅ **100% free** - No paid APIs required (uses local Whisper model)

## Status
Day 5.5 – Audio Extraction + Whisper Fallback (Local, Free)

