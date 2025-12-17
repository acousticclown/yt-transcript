# Environment Variables Template

## Frontend (apps/web/.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Backend (apps/api/.env)

```bash
# Database
DATABASE_URL=file:./data/dev.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Optional: OpenAI API (for Whisper fallback)
OPENAI_API_KEY=your-openai-api-key

# Optional: Gemini API (fallback if user doesn't provide)
GEMINI_API_KEY=your-gemini-api-key
```

## Production Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway)
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=generate-a-secure-random-string-min-32-chars
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## Generating Secure Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

