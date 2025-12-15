# MVP Data Contract

This document defines the core data shapes for the YT-Transcript MVP.

## Why This Matters

- **UI becomes trivial** - Components map directly to entities
- **AI outputs become predictable** - Structured, deterministic formats
- **Editing becomes block-based** - Foundation for playful UX later

---

## Core Entities

### Video

The root entity representing a YouTube video.

```typescript
{
  id: string
  url: string
  title: string
  transcript: string
}
```

**Fields:**
- `id` - Unique identifier
- `url` - YouTube video URL
- `title` - Video title
- `transcript` - Raw transcript text

---

### Section

A logical section within a video transcript (detected or user-defined).

```typescript
{
  id: string
  title: string
  summary: string
  bullets: string[]
}
```

**Fields:**
- `id` - Unique identifier
- `title` - Section heading/topic
- `summary` - Brief summary of the section
- `bullets` - Array of key points/bullet items

---

### NoteBlock

An editable block of content in the final notes output.

```typescript
{
  id: string
  content: string
  editable: boolean
}
```

**Fields:**
- `id` - Unique identifier
- `content` - The text content of the note block
- `editable` - Whether the user can edit this block

---

## Relationships

- A **Video** contains multiple **Sections**
- **Sections** can be transformed into **NoteBlocks**
- **NoteBlocks** are the final editable output units

