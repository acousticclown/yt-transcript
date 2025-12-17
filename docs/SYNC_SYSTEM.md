# Multi-Device Sync System

## Overview

Notely implements a robust multi-device sync system that allows users to access and edit their notes across multiple devices, with offline support and conflict resolution.

## Architecture

### Components

1. **Server-Side Sync API** (`/api/sync`)
   - Status endpoint
   - Pull endpoint (get changes from server)
   - Push endpoint (send changes to server)

2. **Client-Side Sync Queue**
   - LocalStorage-based queue for offline changes
   - Automatic sync when online
   - Conflict detection and resolution

3. **Version Control**
   - Each note has a version number
   - Last-write-wins conflict resolution
   - Device tracking for debugging

## How It Works

### Sync Flow

1. **Pull Phase:**
   - Client requests changes since last sync
   - Server returns updated notes
   - Client merges with local cache

2. **Push Phase:**
   - Client sends queued changes
   - Server applies changes with conflict resolution
   - Server returns results (created, updated, conflicts)

3. **Conflict Resolution:**
   - Version-based: Higher version wins
   - Last-write-wins: Most recent update wins
   - Conflicts are reported to client

### Offline Support

1. **Offline Changes:**
   - Changes are queued in localStorage
   - Queue persists across page reloads
   - Changes are synced when online

2. **Online Detection:**
   - Automatic sync when connection restored
   - Periodic sync every 5 minutes
   - Manual sync available

## API Endpoints

### GET /api/sync/status

Get sync status and counts.

**Response:**
```json
{
  "totalNotes": 42,
  "notesSinceSync": 5,
  "lastSyncAt": "2024-01-01T00:00:00.000Z",
  "serverTime": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/sync/pull

Pull changes from server.

**Request:**
```json
{
  "lastSyncAt": "2024-01-01T00:00:00.000Z",
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "notes": [...],
  "serverTime": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/sync/push

Push changes to server.

**Request:**
```json
{
  "notes": [...],
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "created": ["note-id-1"],
  "updated": ["note-id-2"],
  "conflicts": [
    {
      "noteId": "note-id-3",
      "reason": "Server version is newer"
    }
  ],
  "serverTime": "2024-01-01T12:00:00.000Z"
}
```

## Client Usage

### Basic Sync

```typescript
import { useSync } from "@/lib/hooks";

function MyComponent() {
  const { sync, isSyncing, pendingChanges } = useSync();

  return (
    <button onClick={sync} disabled={isSyncing}>
      {isSyncing ? "Syncing..." : `Sync (${pendingChanges} pending)`}
    </button>
  );
}
```

### Offline Queue

```typescript
import { useSyncQueue } from "@/lib/hooks";

function NoteEditor() {
  const { addToQueue } = useSyncQueue();

  const handleSave = (note: Note) => {
    // Save locally
    // Add to sync queue
    addToQueue("update", note);
  };
}
```

## Conflict Resolution Strategy

### Last-Write-Wins

- Each note has a `version` field
- Higher version number wins
- Server increments version on each update
- Client version must be >= server version to update

### Conflict Detection

1. **Version Mismatch:**
   - Client version < server version = conflict
   - Server version is kept, client update rejected

2. **Concurrent Edits:**
   - Multiple devices edit same note
   - Last update wins (based on timestamp)

3. **Conflict Reporting:**
   - Conflicts are returned in push response
   - Client can handle conflicts (show notification, merge, etc.)

## Database Schema

### Sync Fields

```prisma
model Note {
  version      Int      @default(1)
  lastSyncedAt DateTime?
  deviceId     String?
  
  @@index([userId, updatedAt])
}
```

## Best Practices

1. **Sync Frequency:**
   - Auto-sync every 5 minutes
   - Sync on app focus
   - Sync on network reconnect

2. **Offline Queue:**
   - Limit queue size (prevent storage issues)
   - Prioritize important changes
   - Show sync status to user

3. **Conflict Handling:**
   - Notify user of conflicts
   - Allow manual conflict resolution
   - Keep conflict history

4. **Performance:**
   - Batch sync operations
   - Only sync changed notes
   - Use incremental sync

## Troubleshooting

### Sync Not Working

1. Check network connection
2. Verify authentication token
3. Check browser console for errors
4. Verify API endpoints are accessible

### Conflicts Not Resolving

1. Check version numbers
2. Verify device IDs
3. Check server logs
4. Review conflict resolution logic

### Offline Queue Not Syncing

1. Check localStorage quota
2. Verify queue is not corrupted
3. Check online/offline detection
4. Review sync hook implementation

## Future Enhancements

- [ ] Real-time sync (WebSockets)
- [ ] Merge conflict resolution (3-way merge)
- [ ] Conflict history and resolution UI
- [ ] Selective sync (sync only selected notes)
- [ ] Sync progress indicator
- [ ] Conflict preview before resolution

## Resources

- [Offline-First Architecture](https://offlinefirst.org/)
- [Conflict-Free Replicated Data Types](https://crdt.tech/)
- [LocalStorage Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

