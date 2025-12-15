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
- YouTube transcript extraction (primary method)

## Features
- ✅ YouTube transcript extraction (works for videos with captions)
- ⏸️ Audio extraction fallback (temporarily disabled - will work on any video when re-enabled)
- ✅ AI-powered summaries (Gemini)
- ✅ Structured section detection
- ✅ Editable UI with inline editing
- ✅ **100% free** - No paid APIs required (uses local Whisper model)

## Status
Day 5.5 – Audio Extraction + Whisper Fallback (Temporarily Disabled)

**Note:** Audio extraction fallback is temporarily disabled to keep deployment simple. Currently works with videos that have captions. Fallback will be re-enabled when we find a pure JavaScript solution.

## Setup

### Backend (API)
1. Navigate to `apps/api`
2. Copy `.env.example` to `.env`
3. Add your Gemini API key: `GEMINI_API_KEY=your_key_here`
4. Run: `bun run dev` (for hot reload) or `bun run start`

### Frontend (Web)
1. Navigate to `apps/web`
2. Run: `npm run dev`
3. Open http://localhost:3000

### API Endpoints
- `POST /transcript` - Extract transcript from YouTube URL (works for videos with captions)
- `POST /summary` - Generate AI summary from transcript array
- `POST /sections` - Generate structured sections (title, summary, bullets) from transcript array

