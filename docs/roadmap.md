# Notely Roadmap

## Released

### v1.0.0 - YouTube Transcript MVP
- YouTube transcript extraction
- AI-powered section generation
- Basic UI with section cards

### v1.1.0 - UI Enhancement
- Design system with CSS variables
- Light/dark mode with system preference
- Mobile-first responsive design
- Glassmorphism effects
- Accessibility improvements

### v1.2.0 - Notes App
- Full note editor with formatting
- Manual note creation
- Tags and organization
- Multiple themes (8 total)
- YouTube integration into notes
- Vector illustrations

### v1.3.0 - Database & Auth
- SQLite database with Prisma
- User authentication (JWT)
- TanStack Query for data fetching
- Proper CRUD operations

### v1.5.0 - AI Generation & Polish
- AI note generation from prompts
- SSE streaming with thinking states
- Model fallback chain
- Note viewer (read mode)
- Pure vector icons (no emojis)
- Global search (Cmd+K)
- Quick filters (favorites, YouTube, AI)
- Keyboard shortcuts
- Markdown export
- Auto-save on navigation

### v1.6.0 - YouTube Experience Revamp
- Embedded YouTube player in-app
- Timeline sync with transcript sections
- Clickable timestamps (jump to video position)
- AI-generated timestamps and overall summary
- AI-generated intelligent tags
- Split view: video + notes side by side
- Current position indicator in sections
- Interactive video mode for saved notes
- Previous transcripts gallery page
- Consistent card heights and layouts
- Proper back navigation (history-aware)
- Record player loading animation
- YouTube note caching (skip AI for duplicates)

---

## Planned

### v1.7.0 - Refinement & Gemini Connect

**Core Focus:** Polish, UX improvements, end-to-end robustness

**Must-Have Features:**
- [ ] End-to-end flow testing and fixes
- [ ] Error handling improvements (graceful failures, clear messages)
- [ ] Loading states consistency across all pages
- [ ] Empty states for all views
- [ ] Form validation and feedback
- [ ] Keyboard navigation improvements
- [ ] Mobile touch interactions refinement
- [ ] Performance optimization (bundle size, lazy loading)

**Gemini API Connect:**
- [ ] User-provided Gemini API key
- [ ] Simple "Connect to Gemini" flow (non-technical)
- [ ] OAuth-style connection if possible (research Google AI auth)
- [ ] API key validation and testing
- [ ] Secure key storage
- [ ] Fallback when no key provided

**UX Improvements:**
- [ ] Onboarding flow for new users
- [ ] Better feedback on AI operations
- [ ] Improved navigation patterns
- [ ] Consistent button/action placement
- [ ] Better visual hierarchy

### v1.8.0 - Collaboration & Sharing

**Public Notes:**
- [ ] Share notes with public links
- [ ] Read-only public view
- [ ] Optional password protection
- [ ] Share link management (revoke, regenerate)

**Collaborative Features:**
- [ ] Real-time collaboration (research: Yjs, Liveblocks)
- [ ] Invite collaborators by email
- [ ] View/edit permissions
- [ ] Presence indicators (who's viewing)

**YouTube Share Integration (Research):**
- [ ] Investigate YouTube share intent on mobile
- [ ] "Share to Notely" from YouTube app
- [ ] Deep linking support

### v1.9.0 - PWA (Progressive Web App)

**Full PWA Implementation:**
- [ ] Service worker with offline support
- [ ] App manifest with all icon sizes
- [ ] Install prompts (A2HS)
- [ ] Splash screens
- [ ] Standalone display mode

**Platform Support:**
- [ ] Android Chrome - full install experience
- [ ] iOS Safari - Add to Home Screen
- [ ] Desktop Chrome/Edge install

**Offline Capabilities:**
- [ ] Offline note viewing
- [ ] Offline note editing with sync queue
- [ ] Background sync when online
- [ ] Cache strategies for assets

**Best Practices:**
- [ ] Lighthouse PWA audit 100%
- [ ] Push notifications (optional)
- [ ] App shortcuts
- [ ] Share target API

### v2.0.0 - Cloud & Public Beta

**Database Migration:**
- [ ] PostgreSQL setup
- [ ] Data migration scripts
- [ ] Multi-tenant architecture

**Cloud Deployment:**
- [ ] Production hosting (Vercel + Railway/Supabase)
- [ ] Environment configuration
- [ ] CI/CD pipeline
- [ ] Monitoring and logging

**Sync & Multi-Device:**
- [ ] Real-time sync across devices
- [ ] Conflict resolution
- [ ] Offline-first with cloud backup

**Beta Release:**
- [ ] Public beta launch
- [ ] User feedback collection
- [ ] Bug reporting system
- [ ] Analytics (privacy-respecting)

---

## Backlog

### AI Features
- AI chat within notes
- Context-aware suggestions
- Related notes discovery
- Smart auto-complete
- AI-powered search with embeddings

### Import/Export
- Export to PDF
- Import from Markdown
- Notion import
- Obsidian import

### Organization
- Folders/notebooks
- Templates
- Pinned notes
- Archive

### Input Methods
- Voice input (Whisper integration)
- Handwriting recognition
- Image-to-text (OCR)

### Platforms
- Browser extension
- Mobile app (React Native)
- Desktop app (Electron/Tauri)

### Advanced Features
- Full-text search with embeddings
- Version history
- Note linking/backlinks
- Graph view
- Reminders/tasks integration

---

**Philosophy:** Build incrementally, ship often, gather feedback.
