# API Server (Backend)

Node.js backend for YT-Transcript.

## Development

```bash
npm install
npm run dev    # Development with hot reload
```

## Production

```bash
npm run start
```

## Environment Variables

Copy `.env.example` to `.env` and add your API keys:
- `GEMINI_API_KEY` - Required for AI summaries and section detection
- `OPENAI_API_KEY` - Required for Whisper transcription fallback
