# Day 5.5 - Audio Extraction + Whisper Fallback (Temporarily Disabled)

## Problem
YouTube transcript libraries (`youtube-transcript`) only work when videos have captions available. Many videos don't have captions, limiting our app's usefulness.

## Solution (Planned)
Implement a fallback system:
1. **Primary**: Try YouTube captions (fast, free) - ✅ implemented
2. **Fallback**: Extract audio → transcribe with Whisper (works on any video) - ⏸️ temporarily disabled

## Current Status
**Audio extraction fallback is temporarily disabled** because:
- Requires system binary (`yt-dlp`) which doesn't work on all web servers
- Need to find a pure JavaScript solution that works with Bun
- Want to keep deployment simple and serverless-friendly

**Current behavior:**
- Videos with captions: ✅ Works perfectly
- Videos without captions: Returns clear error message
- Fallback will be re-enabled when we find a pure JS solution

## Implementation Plan

### Step 1: Audio Extraction
- Use `@distube/ytdl-core` or `yt-dlp` to extract audio from YouTube videos
- Download audio as temporary file (MP3/WAV)
- Clean up after transcription

### Step 2: Whisper Integration
- Use @xenova/transformers to run Whisper locally (completely free, no API needed)
- Transcribe audio to text with timestamps
- Convert to same format as YouTube transcript (array of {text, start, duration})
- Model downloads automatically on first use (one-time setup)

### Step 3: Fallback Logic
- Try YouTube captions first
- If that fails (empty or error), fall back to audio extraction + Whisper
- Return same format regardless of source

## Why This Matters
- **Works on every video** - not limited by caption availability
- **More reliable** - doesn't depend on YouTube's caption system
- **Completely free** - Uses local Whisper model via @xenova/transformers (no API costs)
- **Privacy-first** - Audio never leaves your server
- **No rate limits** - Process as many videos as needed

## Trade-offs
- **Slower** - audio download + transcription takes longer
- **More processing** - requires audio extraction step
- **More dependencies** - need audio extraction libraries
- **Deployment consideration** - yt-dlp must be installed on the server
  - Works on: Railway, Render, Fly.io, Docker containers, VPS
  - Limited on: Vercel (serverless), some PaaS platforms
  - Solution: Use platforms that support system binaries or containerize

## Success Criteria
- Video without captions → successfully transcribes via Whisper
- Video with captions → uses captions (faster path)
- Same output format regardless of source
- Clear error messages if both methods fail

