# Database & Scalability Plan

## Current Phase: v1.3.0 - Local Persistence

### Stack
- **ORM:** Prisma (type-safe, schema-first)
- **Database:** SQLite (local, zero-config)
- **Location:** `apps/api/prisma/`

### Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now())
  notes     Note[]
  tags      Tag[]
}

model Note {
  id         String    @id @default(uuid())
  title      String
  content    String    @default("")
  language   String    @default("english")
  source     String    @default("manual") // manual | youtube
  youtubeUrl String?
  isFavorite Boolean   @default(false)
  color      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  sections   Section[]
  tags       Tag[]     @relation("NoteToTag")
}

model Section {
  id       String   @id @default(uuid())
  title    String
  summary  String
  bullets  String   // JSON string array
  language String   @default("english")
  order    Int
  
  noteId   String
  note     Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
}

model Tag {
  id     String  @id @default(uuid())
  name   String
  color  String?
  
  userId String
  user   User    @relation(fields: [userId], references: [id])
  notes  Note[]  @relation("NoteToTag")
  
  @@unique([userId, name])
}
```

---

## Scalability Roadmap

### Phase 1: SQLite (Current)
- ✅ Zero config, works locally
- ✅ Single file database
- ✅ Perfect for personal use
- ❌ Single user only
- ❌ No cloud sync

### Phase 2: PostgreSQL (Cloud)
- **Provider Options:**
  - Supabase (free: 500MB, 50K users/month)
  - Neon (free: 512MB, auto-suspend)
  - PlanetScale (free: 5GB, 1B reads/month)
  - Railway (free: $5 credit)

- **Migration:** Just change `DATABASE_URL` in `.env`
- **Same Prisma schema works**

### Phase 3: Multi-User + Auth
- Add authentication (Supabase Auth / NextAuth)
- User-scoped data
- Sharing & collaboration

### Phase 4: Real-time Sync
- Supabase Realtime or Pusher
- Cross-device sync
- Offline-first with sync queue

---

## API Endpoints (v1.3.0)

### Notes
- `GET /notes` - List all notes
- `GET /notes/:id` - Get single note with sections
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/favorite` - Toggle favorite

### Sections
- `POST /notes/:id/sections` - Add section
- `PUT /sections/:id` - Update section
- `DELETE /sections/:id` - Delete section
- `PUT /notes/:id/sections/reorder` - Reorder sections

### Tags
- `GET /tags` - List all tags
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

### YouTube Integration
- `POST /youtube/import` - Import YouTube video as note

---

## File Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db (SQLite file)
├── src/
│   ├── routes/
│   │   ├── notes.ts
│   │   ├── sections.ts
│   │   ├── tags.ts
│   │   └── youtube.ts
│   ├── lib/
│   │   └── prisma.ts
│   └── index.ts
└── .env
```

---

## Environment Variables

```bash
# SQLite (Phase 1)
DATABASE_URL="file:./dev.db"

# PostgreSQL (Phase 2+)
DATABASE_URL="postgresql://user:pass@host:5432/notely?schema=public"
```

---

## Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio
```

