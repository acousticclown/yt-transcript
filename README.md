# Notely

> **v1.2.0** - AI-Powered Notes Application with YouTube Transcript Integration

Notely is a modern, personal-first notes application with AI-powered features and YouTube transcript integration. Create smart notes manually or import from YouTube videos with automatic structuring, multilingual support, and a beautiful, playful UX.

## Features

### Notes & Editor
- ✅ **Rich note editor** - Create notes with title, tags, sections, and content
- ✅ **AI-powered actions** - Simplify, expand, regenerate, or translate text
- ✅ **Multilingual support** - English, Hindi, and Hinglish
- ✅ **Formatting toolbar** - Bold, italic, headings, lists, code, quotes, and more
- ✅ **Undo/Redo** - Full history support with keyboard shortcuts
- ✅ **Tags & organization** - Tag notes for easy filtering

### YouTube Integration
- ✅ **YouTube transcript extraction** - Fast, reliable caption extraction
- ✅ **AI-powered structuring** - Automatically break content into sections
- ✅ **Section summaries** - Generate concise summaries with key points

### Design & UX
- ✅ **Modern design** - Warm color palette with glassmorphism effects
- ✅ **Multiple themes** - 8 themes (4 light, 4 dark) with creative names
- ✅ **Mobile-first** - Responsive design with bottom navigation
- ✅ **Smooth animations** - Framer Motion powered transitions
- ✅ **Dark mode** - Full dark mode support with system preference

### Technical
- ✅ **Local storage** - Save notes as JSON files
- ✅ **Markdown export** - Export notes as Markdown
- ✅ **AI model fallback** - Automatic fallback between Gemini models

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, TypeScript, Express
- **AI:** Google Gemini (free tier) - summaries, structuring, inline actions
- **YouTube:** `youtube-caption-extractor` - transcript extraction

## Quick Start

### Prerequisites
- Node.js 20+
- Gemini API key (free, no credit card required)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/yt-transcript.git
cd yt-transcript

# Backend
cd apps/api
cp .env.example .env  # Add your GEMINI_API_KEY
npm install
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
│   └── api/           # Node.js backend
├── packages/
│   └── prompts/       # AI prompts (versioned as code)
└── docs/              # Documentation
```

## Versions

- **v1.0.0** - YouTube transcript extraction with AI structuring
- **v1.1.0** - UI enhancement with design system, dark mode, mobile optimization
- **v1.2.0** - Full notes app with editor, themes, and YouTube integration

## License

MIT License

---

**Built with intention, one day at a time.** ✨
