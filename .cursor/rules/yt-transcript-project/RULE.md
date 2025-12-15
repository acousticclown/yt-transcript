---
alwaysApply: true
---

You are working on the project "YT-Transcript".

This is an open-source, personal-first YouTube Transcript + Smart Notes web app with a playful UX.
You must always align with the following principles, architecture, and constraints.

────────────────────────────────────────
CORE PHILOSOPHY
────────────────────────────────────────
• Build incrementally, day-by-day.
• Start simple and fully working, then add intelligence and playfulness.
• Never jump ahead to future phases unless explicitly asked.
• Prefer clarity, debuggability, and simplicity over clever abstractions.
• This project is for personal use + open source community, not enterprise SaaS.

If unsure, default to the simplest working solution.

────────────────────────────────────────
PROJECT GOALS
────────────────────────────────────────
• Convert YouTube videos into:

- Clean transcripts
- Sectioned summaries
- Structured notes (topics, paragraphs, bullets)
  • Support multilingual output:
- English
- Hindi
- Hinglish (natural Indian Hinglish, not literal translation)
  • Allow users to visually edit:
- Add/remove lines
- Edit topics
- Regenerate only selected sections
  • Enable export (Markdown first, others later)
  • Provide a playful, delightful UI (animations, smooth UX)
  • AI must be transparent, controllable, and modular

────────────────────────────────────────
NON-GOALS (DO NOT BUILD UNLESS ASKED)
────────────────────────────────────────
• Authentication / user accounts
• Payments or subscriptions
• Recommendation systems
• Social features
• Heavy analytics
• Over-engineered abstractions
• One giant AI prompt that does everything

────────────────────────────────────────
ARCHITECTURE (STRICT)
────────────────────────────────────────
The system is built in clear layers:

1. YouTube ingestion
2. Transcript extraction (with fallback: audio extraction + Whisper)
3. Structuring & section detection
4. Smart notes generation
5. Playful editor UI
6. Storage & export

Each layer must:
• Be independently understandable
• Be replaceable
• Be built one at a time

Never mix multiple layers in a single step unless explicitly instructed.

Transcript Extraction Strategy:
• Primary: Use YouTube captions when available (fast, free) ✅
• Fallback (Day 5.5): Extract audio → transcribe with Whisper (works on any video) ✅
• This ensures we can process any video, not just those with captions

────────────────────────────────────────
TECH STACK (LOCKED)
────────────────────────────────────────
Frontend:
• Next.js (App Router)
• TypeScript
• Tailwind CSS
• ShadCN UI
• Framer Motion (later, for playfulness)

Backend:
• Node.js
• Simple REST APIs
• No framework-heavy solutions unless justified
• Audio extraction: @distube/ytdl-core (pure JavaScript, no system binaries) ✅
• Speech-to-text: OpenAI Whisper API (cloud-based, works on any server) ✅

AI:
• Google Gemini (free tier) - for summaries and section detection
• OpenAI Whisper API - for audio transcription fallback (~$0.006/min) ✅
• AI provider must be swappable
• Prompts are treated as versioned code

Storage:
• Phase 1: Local JSON or in-memory
• Phase 2: SQLite via Prisma (still free)
• No paid databases

────────────────────────────────────────
REPO STRUCTURE (DO NOT VIOLATE)
────────────────────────────────────────
yt-transcript/
├── apps/
│ ├── web/ # Next.js frontend
│ └── api/ # Node.js backend
├── packages/
│ └── prompts/ # All AI prompts live here
├── docs/
│ └── vision.md
└── README.md

Never place prompts inside API handlers or UI components.
Never mix frontend and backend logic.

────────────────────────────────────────
AI PROMPTING RULES
────────────────────────────────────────
• Prompts are code.
• Each AI task must have its own prompt:

- transcript cleaning
- section detection
- summarization
- language transformation
  • No giant “do everything” prompts.
  • Prompts must be readable, documented, and stored in packages/prompts.
  • Output format must be deterministic (JSON where possible).

────────────────────────────────────────
DEVELOPMENT STYLE
────────────────────────────────────────
• Prefer explicit code over magic.
• Write readable TypeScript.
• Avoid premature optimization.
• Explain WHY, not just WHAT, in comments when logic is non-obvious.
• UI should be built after data flow is working.

────────────────────────────────────────
PLAYFUL UX GUIDELINES
────────────────────────────────────────
• Playfulness should feel calm, not noisy.
• Use:

- Subtle animations
- Soft transitions
- Clear visual hierarchy
  • No gimmicks that harm usability.
  • Editing should feel block-based and forgiving.

────────────────────────────────────────
DAY-BY-DAY DISCIPLINE
────────────────────────────────────────
• Only work on the current “Day” scope.
• Do not implement future features early.
• If a feature belongs to a later phase, stop and explain instead of implementing.
• Always confirm before moving to the next day.

────────────────────────────────────────
DEFAULT BEHAVIOR
────────────────────────────────────────
If instructions are ambiguous:
• Ask for clarification
• Or choose the simplest working approach aligned with the MVP

Behave like a thoughtful senior engineer helping build a clean, long-term open-source project.
