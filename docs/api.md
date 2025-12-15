# API Flow Documentation

This document describes the API endpoints and data flow in YT-Transcript.

## Overview

The API follows a simple pipeline:
1. Extract transcript from YouTube
2. Clean transcript (deterministic, no AI)
3. Generate structured sections using AI
4. Save or export notes

---

## Endpoints

### POST /transcript

**Purpose:** Extract transcript from a YouTube video URL.

**Input:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Output:**
```json
{
  "transcript": [
    {
      "text": "Hello world",
      "start": 0.0,
      "duration": 2.5
    }
  ],
  "language": "unknown",
  "source": "youtube_captions" | "whisper"
}
```

**Flow:**
1. Try YouTube captions first (fast, free, reliable)
2. If captions unavailable, fallback to audio extraction + Whisper transcription
3. Return transcript in consistent format regardless of source

**Error Response:**
```json
{
  "error": "This video doesn't have captions, and YouTube is blocking audio extraction. Try a video with captions enabled."
}
```

---

### POST /summary

**Purpose:** Generate a plain text summary from transcript chunks.

**Input:**
```json
{
  "transcript": [
    {
      "text": "Hello world",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

**Output:**
```json
{
  "summary": "This video explains..."
}
```

**Flow:**
1. Clean transcript (join chunks, remove extra whitespace)
2. Send to Gemini AI for summarization
3. Return plain text summary

---

### POST /sections

**Purpose:** Generate structured sections (title, summary, bullets) from transcript.

**Input:**
```json
{
  "transcript": [
    {
      "text": "Hello world",
      "start": 0.0,
      "duration": 2.5
    }
  ]
}
```

**Output:**
```json
{
  "sections": [
    {
      "title": "Introduction",
      "summary": "The speaker introduces...",
      "bullets": [
        "Point 1",
        "Point 2"
      ]
    }
  ]
}
```

**Flow:**
1. Clean transcript (deterministic, no AI)
2. Send to Gemini AI for section detection
3. Parse JSON response (strip markdown code blocks if present)
4. Return structured sections

---

### POST /save

**Purpose:** Save notes to local JSON file.

**Input:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "sections": [
    {
      "title": "Introduction",
      "summary": "...",
      "bullets": ["..."]
    }
  ]
}
```

**Output:**
```json
{
  "id": "uuid-here"
}
```

**Flow:**
1. Validate URL and sections
2. Generate UUID for note
3. Save to `apps/api/data/{id}.json`
4. Return note ID

**Storage Format:**
```json
{
  "id": "uuid",
  "url": "https://...",
  "createdAt": "2025-12-16T...",
  "sections": [...]
}
```

---

### POST /export/markdown

**Purpose:** Export sections as Markdown file.

**Input:**
```json
{
  "sections": [
    {
      "title": "Introduction",
      "summary": "...",
      "bullets": ["..."]
    }
  ]
}
```

**Output:**
Markdown file download (`notes.md`)

**Format:**
```markdown
# Notes

## Introduction

The speaker introduces...

- Point 1
- Point 2
```

---

### POST /ai/inline

**Purpose:** Inline AI actions for contextual text improvement (simplify, expand, add example).

**Input:**
```json
{
  "action": "simplify" | "expand" | "example",
  "text": "Text to process..."
}
```

**Output:**
```json
{
  "text": "Rewritten text..."
}
```

**Flow:**
1. Takes existing text and action type
2. Sends to Gemini AI with specific instruction
3. Returns replacement text only (no markdown, no emojis)

**Actions:**
- `simplify` - Rewrite in simpler, clearer language
- `expand` - Expand with more detail, without adding new topics
- `example` - Add a short real-world example

**Use Cases:**
- Applied to section summaries
- Applied to individual bullet points
- Appears on hover (contextual, not intrusive)

---

### POST /ai/regenerate-section

**Purpose:** Regenerate one section surgically (title, summary, bullets) without affecting other sections.

**Input:**
```json
{
  "section": {
    "title": "Introduction",
    "summary": "...",
    "bullets": ["..."]
  },
  "transcript": "Full cleaned transcript text..."
}
```

**Output:**
```json
{
  "title": "Regenerated title",
  "summary": "Regenerated summary",
  "bullets": ["Bullet 1", "Bullet 2"]
}
```

**Flow:**
1. Takes current section and full transcript
2. Sends to Gemini AI with regeneration prompt
3. Returns regenerated section (title, summary, bullets)
4. Only affects the requested section

**Use Cases:**
- Fix AI mistakes in one section
- Polish notes iteratively
- Regenerate without affecting other sections

---

## Data Flow

```
YouTube URL
    ↓
POST /transcript
    ↓
Transcript chunks (with timestamps)
    ↓
POST /sections
    ↓
Structured sections (title, summary, bullets)
    ↓
[Optional] POST /save → Local JSON file
[Optional] POST /export/markdown → Markdown download
[Optional] POST /ai/inline → Contextual text improvement
[Optional] POST /ai/regenerate-section → Regenerate one section
```

---

## Error Handling

All endpoints return user-friendly error messages:
- No stack traces
- Clear, actionable messages
- Consistent error format: `{ "error": "message" }`

---

## Notes

- Transcript extraction prefers YouTube captions (fast, free)
- Audio extraction fallback is available but may be blocked by YouTube (403)
- AI processing uses Google Gemini (free tier)
- All prompts are stored in `packages/prompts/` (versioned as code)

