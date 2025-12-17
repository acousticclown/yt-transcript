# Notely

> **v1.6.0** - AI-Powered Notes Application with YouTube Transcript Integration

Notely is a modern, personal-first notes application with AI-powered features and YouTube transcript integration. Create smart notes manually, generate with AI, or import from YouTube videos with automatic structuring, multilingual support, and a beautiful, playful UX.

## Features

### Notes & Editor
- **Rich note editor** - Create notes with title, tags, sections, and content
- **Beautiful note viewer** - Clean read-only view, click anywhere to edit
- **AI-powered actions** - Simplify, expand, regenerate, or translate text
- **Multilingual support** - English, Hindi, and Hinglish
- **Formatting toolbar** - Bold, italic, headings, lists, code, quotes, and more
- **Undo/Redo** - Full history support with keyboard shortcuts
- **Tags & organization** - Tag notes for easy filtering
- **Auto-save** - Changes saved automatically on navigation

### AI Generation
- **AI note generator** - Create full notes from text prompts
- **SSE streaming** - Real-time generation with thinking states
- **Model fallback** - Automatic fallback (gemini-2.5-flash → gemini-2.5-flash-lite)
- **Structured output** - Title, content, sections, and tags

### YouTube Integration
- **YouTube transcript extraction** - Fast, reliable caption extraction
- **AI-powered structuring** - Automatically break content into sections with timestamps
- **Embedded video player** - Watch videos directly in-app
- **Timeline sync** - Visual timeline with clickable section markers
- **Interactive mode** - Video + notes side by side with timestamp navigation
- **Overall summary** - AI-generated video summary
- **Smart tags** - AI-generated relevant tags
- **Caching** - Skip AI for already transcribed videos

### Design & UX
- **Modern design** - Warm color palette with glassmorphism effects
- **Multiple themes** - 8 themes (4 light, 4 dark) with creative names
- **Pure vector icons** - Consistent design system, no emojis
- **Mobile-first** - Responsive design with bottom navigation
- **Smooth animations** - Framer Motion powered transitions
- **Dark mode** - Full dark mode support with system preference

### Search & Filtering
- **Global search** - Cmd+K to search all notes
- **Quick filters** - Favorites, YouTube imports, AI generated
- **Tag filtering** - Filter by tags
- **Keyboard shortcuts** - Cmd+K (search), Cmd+N (new note)

### Data & Export
- **SQLite database** - Persistent storage with Prisma ORM
- **Markdown export** - Download or copy notes as Markdown
- **User authentication** - Session-based JWT auth

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, TanStack Query
- **Backend:** Node.js, TypeScript, Express, Prisma, SQLite
- **AI:** Google Gemini (@google/genai SDK) - generation, structuring, inline actions
- **YouTube:** `youtube-caption-extractor` - transcript extraction

## Quick Start

### Prerequisites
- Node.js 20+
- Gemini API key (free from [Google AI Studio](https://aistudio.google.com/))

### Setup

```bash
# Clone the repo
git clone https://github.com/acousticclown/yt-transcript.git
cd yt-transcript

# Backend
cd apps/api
cp .env.example .env  # Add your GEMINI_API_KEY
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
notely/
├── apps/
│   ├── web/           # Next.js frontend
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   └── lib/       # Utilities, hooks, API client
│   └── api/           # Node.js backend
│       ├── src/       # Express routes
│       └── prisma/    # Database schema
├── packages/
│   └── prompts/       # AI prompts (versioned as code)
└── docs/              # Documentation
```

## API Endpoints

### Notes
- `GET /api/notes` - List all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### AI
- `POST /api/ai/generate-note` - Generate note from prompt
- `POST /api/ai/generate-note/stream` - SSE streaming generation
- `POST /api/ai/inline` - Inline actions (simplify, expand, example)

### YouTube
- `POST /transcript` - Extract transcript from URL
- `POST /sections` - Generate sections from transcript

## Versions

- **v1.0.0** - YouTube transcript extraction with AI structuring
- **v1.1.0** - UI enhancement with design system, dark mode, mobile optimization
- **v1.2.0** - Full notes app with editor, themes, and YouTube integration
- **v1.3.0** - SQLite database, authentication, TanStack Query
- **v1.5.0** - AI generation with streaming, note viewer, vector icons, search
- **v1.6.0** - YouTube revamp: embedded player, timestamps, timeline, caching

## License

MIT License

---

**Built with intention, one day at a time.**
