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

## Setup

### Backend (API)
1. Navigate to `apps/api`
2. Copy `.env.example` to `.env`
3. Add your Gemini API key: `GEMINI_API_KEY=your_key_here`
4. **Install yt-dlp** (required for audio extraction fallback):
   - macOS: `brew install yt-dlp`
   - Linux: `pip install yt-dlp` or use your package manager
   - Windows: `pip install yt-dlp` or download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
5. Run: `bun run dev` (for hot reload) or `bun run start`
6. **Note**: First Whisper transcription will download the model (~75MB) - this is one-time only

### Frontend (Web)
1. Navigate to `apps/web`
2. Run: `npm run dev`
3. Open http://localhost:3000

### API Endpoints
- `POST /transcript` - Extract transcript from YouTube URL (tries captions first, falls back to audio + Whisper)
- `POST /summary` - Generate AI summary from transcript array
- `POST /sections` - Generate structured sections (title, summary, bullets) from transcript array

