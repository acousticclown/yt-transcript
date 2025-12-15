# YT-Transcript

YT-Transcript is a personal-first, open-source web app that converts YouTube videos into clean transcripts, structured notes, and editable summaries.

## Features

- ✅ **YouTube transcript extraction** - Fast, reliable caption extraction
- ✅ **AI-powered summaries** - Generate concise summaries using Gemini AI
- ✅ **Structured section detection** - Automatically break content into logical sections
- ✅ **Editable note blocks** - Inline editing for titles, summaries, and bullets
- ✅ **Local saving** - Save notes as JSON files
- ✅ **Markdown export** - Export notes as Markdown files
- ✅ **Inline AI actions** - Simplify, expand, or add examples to text (contextual, on hover)
- ✅ **Partial regeneration** - Regenerate one section at a time without affecting others
- ✅ **Smooth animations** - Subtle, premium feel with Framer Motion
- ✅ **Drag & drop reordering** - Reorder sections to organize thoughts
- ✅ **Focus mode** - Distraction-free editing by dimming other sections
- ✅ **Dark mode** - System-based dark theme support
- ✅ **Visual polish** - Clear hierarchy, typography discipline, intentional design
- ✅ **Section-level language switching** - Switch each section to English, Hindi, or Hinglish independently

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, TypeScript
- **AI:** Google Gemini (free tier) - for summaries and section detection
- **Transcription:** OpenAI Whisper API (fallback) - for videos without captions
- **YouTube:** `youtube-caption-extractor` - for transcript extraction

## Philosophy

- **Incremental development** - Build day-by-day, feature-by-feature
- **Free tools first** - Use free tiers and open-source tools
- **Replaceable AI providers** - AI logic is modular and swappable
- **Playful but focused UX** - Delightful without being distracting
- **Personal-first** - Built for daily use, open-source for community

## Status

**Week 2 In Progress** 🚀

**Week 1 MVP Complete** ✅
- Transcript extraction (primary method working)
- AI-powered structuring
- Editable UI
- Save and export

**Week 2 Progress** ✅
- Day 8: UX Polish & Micro-Playfulness ✅
- Day 9: Playful Animations with Framer Motion ✅
- Day 10: Inline AI Actions ✅
- Day 11: Partial Regeneration ✅
- Day 12: Drag, Reorder & Focus Mode ✅
- Day 13: Visual Hierarchy, Themes & Finishing Touches ✅

**Week 3 Progress** (In Progress)
- Day 14: Language Foundations & Hinglish Philosophy ✅
- Day 15: Section-Level Language Switching ✅

**Note:** Audio extraction fallback is implemented but YouTube often blocks it (403 errors). The app works best with videos that have captions enabled.

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- API keys:
  - Gemini API key (free tier, no credit card required)
  - OpenAI API key (optional, for fallback transcription)

### Backend (API)

1. Navigate to `apps/api`
2. Copy `.env.example` to `.env`
3. Add your API keys:
   ```bash
   GEMINI_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here  # Optional, for fallback
   ```
4. Install dependencies: `npm install`
5. Run: `npm run dev` (for hot reload) or `npm run start`

### Frontend (Web)

1. Navigate to `apps/web`
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. Open http://localhost:3000

## Usage

1. Paste a YouTube URL in the input field
2. Click "Generate" to extract transcript and generate structured notes
3. Edit sections inline (titles, summaries, bullets)
4. Click "Save Notes" to save locally
5. Click "Export Markdown" to download as `.md` file

## API Endpoints

See [docs/api.md](./docs/api.md) for detailed API documentation.

- `POST /transcript` - Extract transcript from YouTube URL
- `POST /summary` - Generate AI summary from transcript
- `POST /sections` - Generate structured sections
- `POST /save` - Save notes to local storage
- `POST /export/markdown` - Export notes as Markdown
- `POST /ai/inline` - Inline AI actions (simplify, expand, example)
- `POST /ai/regenerate-section` - Regenerate one section surgically

## Cost

- **Gemini API:** Free tier (no credit card required)
- **OpenAI Whisper API:** 
  - Free tier: $5 credit on signup
  - After that: ~$0.006 per minute (~$0.36/hour of audio)
  - Example: A 10-minute video costs ~$0.06

## Project Structure

```
yt-transcript/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/           # Node.js backend
├── packages/
│   └── prompts/       # AI prompts (versioned as code)
├── docs/              # Documentation
│   ├── api.md         # API flow documentation
│   ├── roadmap.md     # Feature roadmap
│   └── vision.md      # Product vision
└── README.md
```

## Roadmap

See [docs/roadmap.md](./docs/roadmap.md) for planned features.

## Contributing

This is an open-source project. Contributions are welcome!

## License

[Add your license here]

---

**Built with intention, one day at a time.** 🚀
