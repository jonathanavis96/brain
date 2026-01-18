# Deployment Patterns

## Why This Exists

Deploying applications to production involves complex decisions around CI/CD pipelines, containerization, environment management, database migrations, rollback strategies, zero-downtime deployments, and monitoring. Teams often struggle with deployment reliability, inconsistent environments, failed migrations, and lack of rollback plans. This knowledge base documents proven deployment patterns covering CI/CD best practices, Docker containerization, environment configuration, database migration strategies, health checks, monitoring, and rollback procedures.

**Problem solved:** Without standardized deployment patterns, teams experience production outages from failed deployments, environment drift between staging and production, broken database migrations, inability to rollback quickly, and lack of visibility into deployment health. This leads to longer incident response times, fear of deploying, and reduced deployment frequency.

## When to Use It

Reference this KB file when:
- Setting up CI/CD pipelines for automated deployments
- Containerizing applications with Docker
- Managing environment variables across dev/staging/production
- Planning database migration strategies for production
- Implementing zero-downtime deployment techniques
- Setting up health checks and monitoring
- Designing rollback and disaster recovery procedures
- Troubleshooting deployment failures

**Specific triggers:**
- Need to deploy a new application to production
- Deployment failures causing downtime
- Database migrations breaking production
- Environment-specific bugs (works in dev, fails in prod)
- Need to rollback a bad deployment quickly
- Setting up monitoring and alerting for new services

## Details

### CI/CD Pipeline Patterns

**Problem:** Manual deployments are error-prone, slow, and inconsistent. Without automation, deployments become risky and infrequent.

**Solution:** Implement automated CI/CD pipelines that build, test, and deploy on every merge to main branch.

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_ENV: production
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Key principles:**
- ✅ Run tests before deploying (gate deployments on test success)
- ✅ Deploy only from main/production branch
- ✅ Use secrets management (never hardcode credentials)
- ✅ Build once, deploy everywhere (same artifact for staging/production)
- ✅ Fail fast (stop pipeline on first failure)
- ✅ Log all deployment steps for debugging

---

### Docker Containerization

**Problem:** "Works on my machine" syndrome. Different environments have different dependencies, versions, and configurations.

**Solution:** Containerize applications with Docker for consistent environments across development, staging, and production.

**Multi-stage Dockerfile (Node.js/Next.js):**

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose for local development:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Key principles:**
- ✅ Use multi-stage builds to minimize image size
- ✅ Run as non-root user for security
- ✅ Use `.dockerignore` to exclude unnecessary files
- ✅ Pin specific versions (avoid `latest` tag)
- ✅ Cache dependencies layer separately from code
- ✅ Use Alpine Linux for smaller images

---

### Environment Configuration

**Problem:** Hardcoded configuration makes applications inflexible. Different environments (dev/staging/prod) need different settings.

**Solution:** Use environment variables with validation and sensible defaults.

**Environment variable management:**

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);

// Usage:
// import { env } from '@/lib/env';
// const dbUrl = env.DATABASE_URL;
```

**`.env.example` template:**

```bash
# .env.example (commit this)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-min-32-chars-long
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3000
```

**Environment-specific files:**

```bash
.env.local          # Local overrides (gitignored)
.env.development    # Development defaults
.env.staging        # Staging configuration
.env.production     # Production configuration (use secrets manager)
```

**Key principles:**
- ✅ Validate environment variables at startup (fail fast)
- ✅ Use `NEXT_PUBLIC_` prefix only for client-safe values
- ✅ Never commit `.env.local` or `.env.production` to git
- ✅ Use secret management services in production (AWS Secrets Manager, HashiCorp Vault)
- ✅ Provide `.env.example` as documentation
- ✅ Set sensible defaults where appropriate

---

### Database Migrations in Production

**Problem:** Database migrations can break production if not handled carefully. Schema changes need to coordinate with code deployments.

**Solution:** Use backward-compatible migrations and deploy in phases.

**Safe migration strategy:**

**Phase 1: Add new column (backward compatible)**
```sql
-- Migration 001: Add new column with default
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT '';
```

Deploy code that populates `full_name` but still reads from old columns:
```typescript
// Code reads old columns, writes to both
const user = await db.user.findUnique({ where: { id } });
const fullName = user.full_name || `${user.first_name} ${user.last_name}`;
```

**Phase 2: Backfill data**
```sql
-- Migration 002: Backfill existing data
UPDATE users 
SET full_name = CONCAT(first_name, ' ', last_name) 
WHERE full_name = '';
```

**Phase 3: Remove old columns (after all code updated)**
```sql
-- Migration 003: Remove old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

**Prisma migration workflow:**

```bash
# Development: Create migration
npx prisma migrate dev --name add_full_name

# Staging: Test migration
npx prisma migrate deploy

# Production: Apply migration
npx prisma migrate deploy

# Rollback (if needed)
# Revert schema.prisma, then create rollback migration
npx prisma migrate dev --name revert_full_name
```

**Key principles:**
- ✅ Always make migrations backward compatible
- ✅ Deploy schema changes before code changes
- ✅ Test migrations on staging with production-like data
- ✅ Use transactions for atomic migrations (PostgreSQL)
- ✅ Keep migrations small and focused
- ✅ Never modify applied migrations (create new ones)
- ✅ Have rollback plan for every migration

---

### Zero-Downtime Deployments

**Problem:** Traditional deployments cause downtime during restarts. Users experience errors during deployment windows.

**Solution:** Use rolling deployments, health checks, and graceful shutdowns.

**Health check endpoint:**

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'ok';
  } catch (error) {
    checks.checks.database = 'error';
    checks.status = 'degraded';
  }

  try {
    // Check Redis connectivity
    await redis.ping();
    checks.checks.redis = 'ok';
  } catch (error) {
    checks.checks.redis = 'error';
    checks.status = 'degraded';
  }

  // Check memory usage
  const used = process.memoryUsage();
  const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
  checks.checks.memory = heapUsedPercent > 90 ? 'warning' : 'ok';

  const statusCode = checks.status === 'ok' ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
```

**Graceful shutdown (Node.js server):**

```javascript
// server.js
const express = require('express');
const app = express();

let server;

function startServer() {
  server = app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
}

function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    prisma.$disconnect();
    redis.quit();
    
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
```

**Rolling deployment strategy:**

```yaml
# kubernetes/deployment.yml (example)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Deploy 1 new pod at a time
      maxUnavailable: 0  # Keep all old pods until new ones ready
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**Key principles:**
- ✅ Implement health check endpoints (`/health`, `/ready`)
- ✅ Use graceful shutdown to finish in-flight requests
- ✅ Deploy new version alongside old (rolling update)
- ✅ Wait for health checks before routing traffic
- ✅ Keep old version running until new version healthy
- ✅ Use readiness probes (Kubernetes) or health checks (AWS ELB)

---

### Rollback Strategies

**Problem:** Bad deployments happen. Need to revert to previous working version quickly.

**Solution:** Tag releases, keep previous versions, automate rollback.

**Git-based rollback:**

```bash
# Tag releases for easy rollback
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3

# Rollback to previous tag
git checkout v1.2.2
./deploy.sh

# Or revert specific commit
git revert <bad-commit-hash>
git push origin main
```

**Docker image rollback:**

```bash
# Always tag images with version and commit SHA
docker build -t myapp:1.2.3 -t myapp:$(git rev-parse --short HEAD) .
docker push myapp:1.2.3

# Rollback: Deploy previous image
docker pull myapp:1.2.2
docker stop myapp-container
docker run -d --name myapp-container myapp:1.2.2
```

**Database migration rollback:**

```bash
# Keep rollback migrations ready
# migrations/
#   001_add_column.up.sql
#   001_add_column.down.sql

# Rollback with Prisma (manual)
# Edit schema.prisma to previous state
npx prisma migrate dev --name rollback_add_column

# Rollback with custom tool
./migrate.sh down 001
```

**Automated rollback triggers:**

```yaml
# CI/CD rollback on health check failure
- name: Health check after deploy
  run: |
    sleep 10
    response=$(curl -s -o /dev/null -w "%{http_code}" https://myapp.com/api/health)
    if [ $response -ne 200 ]; then
      echo "Health check failed, rolling back"
      ./rollback.sh
      exit 1
    fi
```

**Key principles:**
- ✅ Tag every release with semantic version
- ✅ Keep previous 3-5 versions readily available
- ✅ Automate rollback process (tested regularly)
- ✅ Monitor health checks post-deployment
- ✅ Have database rollback migrations prepared
- ✅ Document rollback procedure in runbook
- ✅ Practice rollbacks in staging environment

---

### Monitoring and Observability

**Problem:** Deployments succeed but application behaves incorrectly. Need visibility into application health and performance.

**Solution:** Implement logging, metrics, and alerting.

**Structured logging:**

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined,
});

// Usage:
logger.info({ userId: 123, action: 'login' }, 'User logged in');
logger.error({ error: err, userId: 123 }, 'Failed to process payment');
```

**Application metrics:**

```typescript
// lib/metrics.ts
import { Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
});

// Middleware to record metrics
export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.route?.path || 'unknown',
      status: res.statusCode,
    });
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || 'unknown' },
      duration
    );
  });
  
  next();
}
```

**Alerting rules (example):**

```yaml
# prometheus/alerts.yml
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "95th percentile latency > 1s"
```

**Key principles:**
- ✅ Use structured logging (JSON format)
- ✅ Log request IDs for tracing
- ✅ Monitor key metrics (error rate, latency, throughput)
- ✅ Set up alerts for critical issues
- ✅ Use APM tools (Datadog, New Relic, Sentry)
- ✅ Dashboard key metrics for visibility
- ✅ Log deployment events for correlation

---

## Common Mistakes to Avoid

❌ **Deploying without tests** - Always run tests in CI/CD before deploying  
❌ **No rollback plan** - Every deployment should have a tested rollback procedure  
❌ **Breaking database migrations** - Use backward-compatible migrations  
❌ **Hardcoded environment config** - Use environment variables  
❌ **No health checks** - Implement `/health` endpoint for monitoring  
❌ **Deploying at peak hours** - Schedule deployments during low traffic  
❌ **No deployment monitoring** - Watch logs and metrics during/after deploy  
❌ **Single point of failure** - Use multiple replicas/instances  
❌ **No graceful shutdown** - Handle SIGTERM to finish in-flight requests  
❌ **Testing only in dev** - Always test in staging environment first

---

## When NOT to Use It

- **Static websites** - Simple hosting (Netlify/Vercel) handles deployment automatically
- **Serverless functions** - Platform manages deployment (AWS Lambda, Vercel Functions)
- **Very early prototypes** - Manual deployment acceptable initially (but plan for automation)

**Note:** Even for simple projects, basic CI/CD (automated tests + deployment) provides significant value. Start simple and expand as needs grow.

---

## Related Patterns

- **database-patterns.md** - Schema migrations, connection pooling
- **security-patterns.md** - Secret management, HTTPS configuration
- **caching-patterns.md** - Cache invalidation during deployments
- **error-handling-patterns.md** - Production error logging and monitoring
- **testing-patterns.md** - CI/CD integration, test automation
