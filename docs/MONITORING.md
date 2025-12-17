# Monitoring & Error Tracking Setup

## Overview

This guide covers setting up monitoring, error tracking, and logging for production.

## Error Tracking: Sentry

### Setup

1. **Create Sentry Account:**
   - Go to https://sentry.io
   - Create free account
   - Create new project (Node.js for backend, React for frontend)

2. **Install Sentry SDK:**

**Backend:**
```bash
cd apps/api
npm install @sentry/node @sentry/profiling-node
```

**Frontend:**
```bash
cd apps/web
npm install @sentry/nextjs
```

3. **Initialize Sentry:**

**Backend (apps/api/src/index.ts):**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 1.0,
});
```

**Frontend (apps/web/sentry.client.config.ts):**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 1.0,
});
```

4. **Add Environment Variables:**
   - Backend: `SENTRY_DSN`
   - Frontend: `NEXT_PUBLIC_SENTRY_DSN`

### Usage

**Backend Error Tracking:**
```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

**Frontend Error Tracking:**
```typescript
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
}
```

## Logging

### Backend Logging

**Recommended: Winston or Pino**

```bash
npm install winston
```

**Setup (apps/api/src/utils/logger.ts):**
```typescript
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### Frontend Logging

Use console with levels:
- `console.error` - Errors
- `console.warn` - Warnings
- `console.info` - Info
- `console.debug` - Debug (dev only)

## Performance Monitoring

### Vercel Analytics

1. **Enable in Vercel Dashboard:**
   - Project Settings > Analytics
   - Enable Web Analytics

2. **Or use Next.js Analytics:**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Railway Metrics

- Built-in metrics in Railway dashboard
- CPU, Memory, Network usage
- Request logs

## Health Checks

### Backend Health Endpoint

Already implemented at `/health`:
```typescript
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    version: "1.3.0",
    timestamp: new Date().toISOString(),
  });
});
```

### Frontend Health Check

Add to `apps/web/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

## Uptime Monitoring

### Recommended Services:

1. **UptimeRobot** (Free)
   - Monitor health endpoints
   - Email/SMS alerts
   - 50 monitors free

2. **Pingdom** (Paid)
   - Advanced monitoring
   - Better analytics

3. **StatusCake** (Free tier)
   - Basic monitoring
   - Good free tier

## Database Monitoring

### Supabase:
- Built-in monitoring dashboard
- Query performance
- Connection pooling stats

### Railway:
- Database metrics in dashboard
- Connection count
- Query performance

## Alerting

### Sentry Alerts:
- Error rate thresholds
- Performance degradation
- New error types

### Uptime Monitoring:
- Downtime alerts
- Response time alerts
- SSL certificate expiration

## Best Practices

1. **Log Levels:**
   - ERROR: Critical issues
   - WARN: Potential problems
   - INFO: Important events
   - DEBUG: Development only

2. **Error Context:**
   - Include user ID (if available)
   - Include request details
   - Include stack traces

3. **Performance:**
   - Monitor slow queries
   - Track API response times
   - Monitor bundle sizes

4. **Privacy:**
   - Don't log sensitive data
   - Sanitize user input
   - Comply with GDPR

## Production Checklist

- [ ] Sentry configured (backend)
- [ ] Sentry configured (frontend)
- [ ] Logging setup
- [ ] Health checks working
- [ ] Uptime monitoring active
- [ ] Alerts configured
- [ ] Performance monitoring enabled
- [ ] Database monitoring active
- [ ] Error notifications working

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Railway Metrics](https://docs.railway.app/reference/metrics)

