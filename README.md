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
- Node.js
- Gemini AI (free tier) - for summaries and section detection
- OpenAI Whisper API - for audio transcription fallback
- Tailwind
- youtube-caption-extractor - for YouTube transcript extraction (primary method)
- @distube/ytdl-core - for audio extraction (pure JavaScript, fallback)

## Features

- ✅ YouTube transcript extraction (primary method - works for videos with captions) ✅ **NOW WORKING!**
- ⚠️ Audio extraction + Whisper transcription fallback (implemented, but YouTube blocks extraction)
- ✅ AI-powered summaries (Gemini)
- ✅ Structured section detection
- ✅ Editable UI with inline editing
- ✅ **Web-server compatible** - No system binaries required

## Status

Day 5.5 – Transcript Extraction Fixed + Whisper Fallback (Implemented)

**Update:** Switched from `youtube-transcript` to `youtube-caption-extractor` - transcript extraction is now working! ✅

**Note:** Transcript extraction is now working using `youtube-caption-extractor`! Audio extraction fallback is implemented but YouTube blocks it (403 errors). The app works great with videos that have captions enabled.

### How It Works

1. **Primary method**: Extracts YouTube captions using `youtube-caption-extractor` (fast, free, reliable) ✅ **WORKING!**
2. **Fallback method**: Attempts to extract audio and transcribe with OpenAI Whisper API ⚠️
   - **Current limitation**: YouTube blocks audio extraction libraries (403 errors)
   - **Status**: Implemented correctly, but YouTube prevents it from working
   - **Recommendation**: Use videos with captions enabled for best results
3. Same output format regardless of source

### Cost

- **Gemini API**: Free tier (no credit card required)
- **OpenAI Whisper API**:
  - Free tier: $5 credit on signup
  - After that: ~$0.006 per minute (~$0.36/hour of audio)
  - Example: A 10-minute video costs ~$0.06

## Setup

### Backend (API)

1. Navigate to `apps/api`
2. Copy `.env.example` to `.env`
3. Add your API keys:
   - `GEMINI_API_KEY=your_key_here` (required - for summaries and section detection)
   - `OPENAI_API_KEY=your_key_here` (required for fallback - enables transcription for videos without captions)
4. Run: `npm run dev` (for hot reload) or `npm run start`

### Frontend (Web)

1. Navigate to `apps/web`
2. Run: `npm run dev`
3. Open http://localhost:3000

### API Endpoints

- `POST /transcript` - Extract transcript from YouTube URL
  - Primary: Uses YouTube captions via `youtube-caption-extractor` (fast, free, working!) ✅
  - Fallback: Extracts audio and transcribes with Whisper (blocked by YouTube 403) ⚠️
- `POST /summary` - Generate AI summary from transcript array
- `POST /sections` - Generate structured sections (title, summary, bullets) from transcript array
