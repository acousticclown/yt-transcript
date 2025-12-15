# Day 5.5 - Audio Extraction + Whisper Fallback

## Problem
YouTube transcript libraries (`youtube-transcript`) only work when videos have captions available. Many videos don't have captions, limiting our app's usefulness.

## Solution
Implement a fallback system:
1. **Primary**: Try YouTube captions (fast, free) - already implemented
2. **Fallback**: Extract audio → transcribe with Whisper (works on any video)

## Implementation Plan

### Step 1: Audio Extraction
- Use `@distube/ytdl-core` or `yt-dlp` to extract audio from YouTube videos
- Download audio as temporary file (MP3/WAV)
- Clean up after transcription

### Step 2: Whisper Integration
- Use OpenAI Whisper API (free tier) or local Whisper model
- Transcribe audio to text with timestamps
- Convert to same format as YouTube transcript (array of {text, start, duration})

### Step 3: Fallback Logic
- Try YouTube captions first
- If that fails (empty or error), fall back to audio extraction + Whisper
- Return same format regardless of source

## Why This Matters
- **Works on every video** - not limited by caption availability
- **More reliable** - doesn't depend on YouTube's caption system
- **Still free** - Whisper is open-source, can run locally or use API

## Trade-offs
- **Slower** - audio download + transcription takes longer
- **More processing** - requires audio extraction step
- **More dependencies** - need audio extraction libraries

## Success Criteria
- Video without captions → successfully transcribes via Whisper
- Video with captions → uses captions (faster path)
- Same output format regardless of source
- Clear error messages if both methods fail

