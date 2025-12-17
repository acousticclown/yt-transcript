# Notely API Documentation

Base URL: `http://localhost:3001`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully"
}
```

#### POST /api/auth/login
Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/verify
Verify a JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "user-123",
  "email": "john@example.com",
  "name": "John Doe"
}
```

---

## Notes

### GET /api/notes
List all notes for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "note-123",
    "title": "My Note",
    "content": "Note content...",
    "language": "english",
    "source": "manual",
    "youtubeUrl": null,
    "isFavorite": false,
    "color": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "tags": ["work", "ideas"],
    "sections": []
  }
]
```

### GET /api/notes/:id
Get a single note by ID.

**Response:** `200 OK`
```json
{
  "id": "note-123",
  "title": "My Note",
  "content": "Note content...",
  "language": "english",
  "source": "youtube",
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "isFavorite": true,
  "tags": ["youtube"],
  "sections": [
    {
      "id": "section-1",
      "title": "Introduction",
      "summary": "Overview of the topic...",
      "bullets": ["Point 1", "Point 2"],
      "language": "english"
    }
  ]
}
```

### POST /api/notes
Create a new note.

**Request:**
```json
{
  "title": "New Note",
  "content": "Main content...",
  "tags": ["tag1", "tag2"],
  "language": "english",
  "source": "manual",
  "sections": [
    {
      "title": "Section 1",
      "summary": "Summary text",
      "bullets": ["Point 1", "Point 2"],
      "language": "english"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "note-456",
  "message": "Note created"
}
```

### PUT /api/notes/:id
Update an existing note.

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["new-tag"],
  "sections": []
}
```

**Response:** `200 OK`
```json
{
  "id": "note-123",
  "message": "Note updated"
}
```

### DELETE /api/notes/:id
Delete a note.

**Response:** `200 OK`
```json
{
  "message": "Note deleted"
}
```

### POST /api/notes/:id/favorite
Toggle favorite status.

**Response:** `200 OK`
```json
{
  "isFavorite": true
}
```

---

## Tags

### GET /api/tags
List all tags for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "tag-1",
    "name": "work",
    "color": "#FF5733",
    "noteCount": 5
  }
]
```

### POST /api/tags
Create a new tag.

**Request:**
```json
{
  "name": "new-tag",
  "color": "#3498DB"
}
```

### PUT /api/tags/:id
Update a tag.

### DELETE /api/tags/:id
Delete a tag.

---

## AI Endpoints

### POST /api/ai/generate-note
Generate a complete note from a text prompt.

**Request:**
```json
{
  "prompt": "Create notes about React hooks best practices"
}
```

**Response:** `200 OK`
```json
{
  "note": {
    "title": "React Hooks Best Practices",
    "content": "Overview of React hooks...",
    "tags": ["react", "hooks", "javascript"],
    "sections": [
      {
        "id": "section-0",
        "title": "useState Best Practices",
        "summary": "Guidelines for using useState...",
        "bullets": ["Keep state minimal", "Use multiple states"],
        "language": "english"
      }
    ]
  }
}
```

### POST /api/ai/generate-note/stream
Generate a note with SSE streaming.

**Response:** Server-Sent Events stream
```
data: {"type":"thinking","step":"analyzing","message":"Understanding your request..."}

data: {"type":"thinking","step":"structuring","message":"Planning note structure..."}

data: {"type":"chunk","content":"{ \"title\": \"..."}

data: {"type":"complete","data":{...}}
```

### POST /api/ai/inline
Perform inline text actions.

**Request:**
```json
{
  "text": "Complex technical explanation...",
  "action": "simplify"
}
```

**Actions:** `simplify`, `expand`, `example`

**Response:** `200 OK`
```json
{
  "result": "Simplified text..."
}
```

### POST /api/ai/transform-language
Transform text to a different language.

**Request:**
```json
{
  "text": "Hello world",
  "targetLanguage": "hindi",
  "tone": "casual"
}
```

**Response:** `200 OK`
```json
{
  "result": "नमस्ते दुनिया"
}
```

---

## YouTube Endpoints

### POST /transcript
Extract transcript from a YouTube video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:** `200 OK`
```json
{
  "transcript": "Full transcript text...",
  "videoId": "dQw4w9WgXcQ"
}
```

### POST /sections
Generate sections from a transcript.

**Request:**
```json
{
  "transcript": "Full transcript text..."
}
```

**Response:** `200 OK`
```json
{
  "sections": [
    {
      "title": "Introduction",
      "summary": "Overview...",
      "bullets": ["Point 1", "Point 2"]
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error
