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
- Gemini AI (free tier)
- Tailwind

## Status
Day 5 – Minimal Playful Editor UI

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
- `POST /transcript` - Extract transcript from YouTube URL
- `POST /summary` - Generate AI summary from transcript array
- `POST /sections` - Generate structured sections (title, summary, bullets) from transcript array

### Features
- ✅ YouTube transcript extraction
- ✅ AI-powered summaries
- ✅ Structured section detection
- ✅ Editable UI with inline editing
- ✅ CORS enabled for frontend-backend communication

