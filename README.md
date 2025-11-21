# nextjs-croner

<div align="center">

**Run background jobs and cron schedules directly within your Next.js application.**

A lightweight plugin that simplifies cron job management in Next.js by leveraging the battle-tested [croner](https://github.com/Hexagon/croner) library.

[Installation](#installation) • [Quick Start](#quick-start) • [CLI Commands](#cli-commands) • [Examples](#usage)

</div>

---

## Why nextjs-croner?

Building production-grade applications often requires scheduling recurring tasks—sending emails, syncing data, cleaning up resources, or running background jobs. Most solutions require external infrastructure or complex tooling.

**nextjs-croner** brings a simpler approach: schedule and run cron jobs directly within your Next.js application without requiring external services. Perfect for:

- ✅ Scheduled maintenance tasks
- ✅ Periodic data synchronization  
- ✅ Email campaigns and notifications
- ✅ Cache invalidation and cleanup
- ✅ Reporting and analytics aggregation
- ✅ Serverless and containerized deployments

## Features

- 🚀 **No Additional Infrastructure** - Run cron jobs directly in your Next.js app (powered by [croner](https://github.com/Hexagon/croner))
- ⚡ **Lightweight & Fast** - Minimal dependencies, built on the robust [croner](https://github.com/Hexagon/croner) library
- 🔒 **Type-Safe** - Full TypeScript support out of the box
- 📦 **CLI Integration** - Seamless `npx nextjs-croner` commands that replace your `next dev` and `next build` workflow
- 🎯 **Works Everywhere** - App Router, Pages Router, and standalone builds
- 🌍 **Timezone Support** - Built-in timezone handling for global applications
- 🔄 **Easy to Manage** - Simple, declarative cron job configuration

## Requirements

- **Next.js 13.0+** (with `output: 'standalone'` configuration for production)
- **Node.js 18.17.0+**
- Next.js standalone build mode (required for production deployments)

> **Note:** Standalone builds are essential for cron jobs to work in production environments. The `nextjs-croner init` command automatically configures this in your `next.config.ts/js`.

## Installation

```bash
npm install nextjs-croner croner
```

Or with yarn:

```bash
yarn add nextjs-croner croner
```

Or with pnpm:

```bash
pnpm add nextjs-croner croner
```

## Quick Start

Get up and running in 3 steps:

### 1. Initialize Your Project

```bash
npx nextjs-croner init
```

This command:
- Creates `lib/cron/jobs.ts` with example cron jobs
- Updates `next.config.ts` to enable standalone output mode
- Adds `ENABLE_CRON=true` to `.env.local` for development

### 2. Define Your Cron Jobs

Edit `lib/cron/jobs.ts` and add your scheduled tasks:

```typescript
import { Cron } from 'croner';

export function initCronJobs() {
  // Example: Run every minute
  new Cron('* * * * *', () => {
    console.log('This runs every minute');
  });

  // Example: Run daily at midnight
  new Cron('0 0 * * *', () => {
    console.log('Running daily task at midnight');
  });
}
```

### 3. Replace Your Dev/Build Workflow

Instead of using `next dev` and `next build`, use nextjs-croner commands:

```bash
# Development (with hot reload and cron jobs)
npx nextjs-croner dev

# Production build (with cron injection)
npx nextjs-croner build
```

That's it! Your cron jobs are now running.

## CLI Commands

nextjs-croner provides a set of commands that replace and enhance your standard `next dev` and `next build` workflow.

### `npx nextjs-croner dev [options]`

**Replaces:** `next dev`

Starts your Next.js development server with cron jobs enabled and hot-code reloading.

```bash
npx nextjs-croner dev [options]

# Pass Next.js dev server options
npx nextjs-croner dev --port 3001 --hostname 0.0.0.0
```

**What happens:**
1. ✅ Initializes your cron jobs from `lib/cron/jobs.ts`
2. ✅ Starts the Next.js development server with full hot-reload support
3. ✅ Forwards all arguments to the Next.js dev server
4. ✅ Respects the `ENABLE_CRON` environment variable (automatically enabled in dev mode)

**Key difference from `next dev`:**
- Automatically loads and initializes your cron jobs when the server starts
- Logs cron initialization status for debugging
- Forwards all arguments transparently to the underlying `next dev` command

---

### `npx nextjs-croner build [options]`

**Replaces:** `next build` (for production deployments with cron jobs)

Builds your Next.js application for production and injects cron job initialization into the standalone server.

```bash
npx nextjs-croner build [options]

# Pass Next.js build options
npx nextjs-croner build --debug --no-lint
```

**What happens:**
1. ✅ Compiles your TypeScript cron jobs to ES modules
2. ✅ Runs the Next.js production build
3. ✅ Injects cron initialization code into `.next/standalone/server.js`
4. ✅ Validates that standalone output is properly configured
5. ✅ Prepares everything for deployment

**Production workflow:**
```bash
# Build your app with cron jobs
npx nextjs-croner build

# Run the standalone server (cron jobs included)
node .next/standalone/server.js

# Or with environment variable to enable cron
ENABLE_CRON=true node .next/standalone/server.js
```

---

### `npx nextjs-croner init [options]`

Initialize nextjs-croner in a new or existing Next.js project.

```bash
npx nextjs-croner init [options]

Options:
  -d, --directory <dir>   Target directory (default: ".")
  --ts, --typescript      Use TypeScript (default: true)
```

**What it does:**
- Creates `lib/cron/jobs.ts` with example cron jobs
- Updates `next.config.ts` to enable standalone output (`output: 'standalone'`)
- Adds `ENABLE_CRON=true` to `.env.local`
- Sets up proper folder structure

---

### `npx nextjs-croner inject [options]`

Manually inject cron job initialization into the `.next/standalone/server.js` file.

```bash
npx nextjs-croner inject [options]

Options:
  -f, --force   Force injection even if already present (default: false)
```

**What it does:**
- Copies `lib/cron` folder to `.next/standalone/lib/cron`
- Compiles TypeScript cron jobs to JavaScript (ES modules)
- Injects initialization code into the standalone server
- Respects the `ENABLE_CRON` environment variable at runtime

> **Note:** This is automatically called by `npx nextjs-croner build`, so you typically don't need to run it manually.

## Usage Examples

### Basic Setup

Create your cron jobs in `lib/cron/jobs.ts`:

```typescript
import { Cron } from 'croner';

export function initCronJobs() {
  // Run every minute
  new Cron('* * * * *', () => {
    console.log('Running cron job every minute');
  });

  // Run every day at midnight
  new Cron('0 0 * * *', () => {
    console.log('Running daily job at midnight');
  });
}
```

### With Error Handling

```typescript
import { Cron } from 'croner';

export function initCronJobs() {
	new Cron('0 * * * *', async () => {
		try {
			// Your job logic here
			await syncDatabaseCache();
			console.log('✓ Cache sync completed');
		} catch (error) {
			console.error('❌ Cache sync failed:', error);
			// Send alert to monitoring service
		}
	});
}
```

### With Timezone Support

```typescript
import { Cron } from 'croner';

// Run every day at 9:00 AM Eastern Time
new Cron('0 9 * * *', { timezone: 'America/New_York' }, () => {
  console.log('Running at 9 AM ET');
});

// Run every day at 6:00 PM UTC
new Cron('0 18 * * *', { timezone: 'UTC' }, () => {
  console.log('Running at 6 PM UTC');
});
```

### Named Jobs with Control

```typescript
import { Cron } from 'croner';

const dailyCleanup = Cron('0 2 * * *', { name: 'daily-cleanup' }, () => {
  console.log('Running daily cleanup...');
});

// You can stop the job later if needed
// dailyCleanup.stop();
```

### Multiple Jobs

```typescript
import { Cron } from 'croner';

export function initCronJobs() {
  // Sync user data every 30 minutes
  new Cron('*/30 * * * *', async () => {
    await syncUserData();
  });

  // Send email digests every morning at 8 AM
  new Cron('0 8 * * *', async () => {
    await sendEmailDigests();
  });

  // Clean up old sessions every hour
  new Cron('0 * * * *', async () => {
    await cleanupOldSessions();
  });

  // Generate daily reports at midnight
  new Cron('0 0 * * *', async () => {
    await generateDailyReports();
  });
}
```

## Cron Pattern Reference

```typescript
// Every minute
'* * * * *'

// Every hour
'0 * * * *'

// Every day at midnight
'0 0 * * *'

// Every day at noon
'0 12 * * *'

// Every Monday at 9:00 AM
'0 9 * * 1'

// Every 15 minutes
'*/15 * * * *'

// Every 6 hours
'0 */6 * * *'

// Every weekday (Monday-Friday) at 8:00 AM
'0 8 * * 1-5'

// Every 1st of the month at midnight
'0 0 1 * *'
```

See the [croner documentation](https://github.com/Hexagon/croner) for more pattern examples and advanced features.

## Environment Variables

Control when cron jobs run using environment variables:

```bash
# .env.local
ENABLE_CRON=true        # Enable cron jobs in development
NODE_ENV=production     # Production mode
```

**Default behavior:**
- ✅ In production (`NODE_ENV=production`) - cron jobs always run
- ✅ In development (`ENABLE_CRON=true`) - cron jobs run when explicitly enabled
- ❌ In development (without flag) - cron jobs are disabled

## Best Practices

### 1. **Environment-Aware Execution**
```typescript
export function initCronJobs() {
  // Only run CPU-intensive jobs in production
  if (process.env.NODE_ENV === 'production') {
    Cron('0 2 * * *', async () => {
      await expensiveAnalyticsCalculation();
    });
  }
}
```

### 2. **Always Add Error Handling**
```typescript
Cron('0 * * * *', async () => {
  try {
    await criticalDatabaseSync();
  } catch (error) {
    console.error('Sync failed:', error);
    // Notify ops/monitoring service
    await notifyOps('Database sync failed', error);
  }
});
```

### 3. **Design for Idempotency**
```typescript
// Good: Idempotent operation (safe to run multiple times)
Cron('0 0 * * *', async () => {
  await db.updateTable.update({ 
    updatedAt: new Date() 
  }, { 
    where: { status: 'pending' } 
  });
});

// Avoid: Non-idempotent operation
// Cron('0 0 * * *', async () => {
//   await emailUser(); // Could send duplicate emails!
// });
```

### 4. **Add Comprehensive Logging**
```typescript
Cron('*/5 * * * *', async () => {
  const startTime = Date.now();
  try {
    console.log('[CRON] Starting cache refresh...');
    await refreshCache();
    const duration = Date.now() - startTime;
    console.log(`[CRON] Cache refresh completed in ${duration}ms`);
  } catch (error) {
    console.error('[CRON] Cache refresh failed:', error);
  }
});
```

### 5. **Be Mindful of Resource Usage**
```typescript
// ✅ Good: Reasonable frequency
Cron('0 * * * *', async () => {
  await syncData();
});

// ❌ Avoid: Too frequent without reason
// Cron('* * * * *', async () => {
//   await expensiveOperation(); // Runs 1440 times per day!
// });
```

### 6. **Monitor Long-Running Jobs**
```typescript
Cron('0 */6 * * *', async () => {
  const timeout = setTimeout(() => {
    console.error('[CRON] Job timeout after 5 minutes');
  }, 5 * 60 * 1000);

  try {
    await longRunningOperation();
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    console.error('[CRON] Job failed:', error);
  }
});
```

### 7. **Distributed Systems Note**
If running multiple instances in production, consider:
- Using a distributed lock mechanism to prevent duplicate job execution
- Or accepting that some jobs may run on multiple instances and designing them to be idempotent
- Consider using external cron services for critical jobs

## API Reference

This package uses [croner](https://github.com/Hexagon/croner) under the hood. Refer to the croner documentation for the complete API reference.

Key croner methods:
- `Cron(pattern, handler)` - Create a cron job
- `Cron(pattern, options, handler)` - Create a cron job with options
- `job.stop()` - Stop a running job
- `job.nextRun()` - Get the next run time

For more information, visit the [croner documentation](https://github.com/Hexagon/croner#api).

## Troubleshooting

### Cron jobs not running in production

**Problem:** Cron jobs work in development but not after deploying

**Solutions:**
1. Ensure `ENABLE_CRON=true` is set in your production environment
2. Verify that `output: 'standalone'` is configured in `next.config.ts`
3. Check that `npx nextjs-croner build` was used instead of `next build`
4. Confirm the `.next/standalone/server.js` file exists and contains the injection code

```bash
# Check if injection was successful
grep "initCronJobs" .next/standalone/server.js
```

### Module not found errors

**Problem:** `Cannot find module './lib/cron/jobs'`

**Solutions:**
1. Ensure you ran `npx nextjs-croner init` to create the jobs file
2. Verify the file exists at `lib/cron/jobs.ts` or `lib/cron/jobs.js`
3. Check that the file was properly compiled to ES modules

### Cron jobs running multiple times

**Problem:** Jobs are executing more than expected

**Causes:**
- Multiple server instances running without distributed locking
- Job is not idempotent and previous execution didn't complete

**Solutions:**
1. Design your jobs to be idempotent
2. Implement distributed locking for critical jobs
3. Use external cron services for mission-critical jobs

### Development environment issues

**Problem:** Cron jobs not running in development

**Solution:** Ensure `ENABLE_CRON=true` is set in `.env.local`:

```bash
# .env.local
ENABLE_CRON=true
```

### TypeScript compilation errors

**Problem:** `Error: Cannot find module 'croner'` or TypeScript errors

**Solutions:**
1. Ensure croner is installed: `npm install croner`
2. Check that `tsconfig.json` is properly configured
3. Run `npm run build` to verify compilation

## FAQ

**Q: Will cron jobs run when using `next dev` instead of `npx nextjs-croner dev`?**
A: No. The `npx nextjs-croner dev` command specifically initializes cron jobs. Using `next dev` directly will not load them.

**Q: Can I use nextjs-croner with serverless deployments (Vercel, Netlify)?**
A: Not recommended for frequently-running jobs. Serverless environments start/stop instances dynamically. For serverless, consider using external cron services or cloud-native scheduling (AWS EventBridge, Google Cloud Scheduler).

**Q: How do I prevent duplicate job execution in a multi-instance setup?**
A: Implement distributed locking using Redis, a database, or a distributed lock service. Make sure your jobs are designed to be idempotent as a fallback.

**Q: Can I use this with Next.js API Routes?**
A: Yes! You can call API routes from your cron jobs using `fetch()`:

```typescript
Cron('0 * * * *', async () => {
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync`, {
    method: 'POST'
  });
});
```

**Q: What happens if a cron job takes longer than the next scheduled run?**
A: Croner queues the next execution. The jobs run sequentially, not in parallel.

**Q: Can I modify cron jobs after the app has started?**
A: Yes, if you keep a reference to the job object and call `.stop()` on it. However, this is not recommended for production environments.

## TODO / Roadmap

We're actively working on expanding nextjs-croner with the following features:

### Planned Features

- [ ] **Job Persistence** - Store job results and execution history in a database
- [ ] **Web Dashboard** - Visual interface to monitor, manage, and trigger cron jobs
- [ ] **Distributed Locking** - Built-in support for Redis/Database-backed distributed locks to prevent duplicate execution
- [ ] **Retry Logic** - Automatic retry mechanism with exponential backoff for failed jobs
- [ ] **Job Webhooks** - Send notifications to external services on job start, success, or failure
- [ ] **Metrics & Monitoring** - Export job execution metrics for Prometheus or other monitoring tools
- [ ] **Job Queuing** - Support for job queues with priority levels
- [ ] **Scheduled Job Editor** - CLI or web interface to edit cron patterns without code changes
- [ ] **Database Drivers** - Official support for popular databases (PostgreSQL, MongoDB, MySQL)
- [ ] **Vercel Deployment Guide** - Best practices and examples for deploying on Vercel
- [ ] **Job Testing Utilities** - Testing helpers and mocks for easier cron job testing
- [ ] **Multi-timezone Scheduling** - Enhanced support for scheduling across multiple timezones
- [ ] **Health Checks** - Built-in health check endpoint to verify cron job system status

### Contributions Welcome

Have an idea for a feature? We'd love to hear it! Please open an issue or submit a pull request to help improve nextjs-croner.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/yourusername/nextjs-croner/issues).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

