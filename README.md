# nextjs-croner

A Next.js plugin for running cron jobs using the [croner](https://github.com/Hexagon/croner) library without external tools.

## Features

- Run cron jobs directly within your Next.js application
- No external tools or dependencies required
- Powered by croner - a robust and feature-rich cron scheduler
- TypeScript support
- Easy to configure and manage
- Works with Next.js 13+ (App Router and Pages Router)
- CLI tool for quick setup and configuration

## Installation

```bash
npm install nextjs-croner
```

## Quick Start

The easiest way to get started is using the CLI:

```bash
# Initialize cron jobs in your project
npx nextjs-croner init

# Inject initialization code into your Next.js app
npx nextjs-croner inject

# Build and validate your cron configuration (optional)
npx nextjs-croner build
```

## CLI Commands

### `init`

Initialize nextjs-croner in your Next.js project. Creates example cron job files and configuration.

```bash
npx nextjs-croner init [options]

Options:
  -d, --directory   Target directory for initialization (default: ".")
  --ts, --typescript  Use TypeScript (default: true)
  -h, --help        Show help
```

This command will:
- Create `lib/cron/jobs.ts` with example cron jobs
- Add `ENABLE_CRON=true` to `.env.local`
- Configure `next.config.js|ts` to enable standalone output mode (required for cron jobs to work in production)

### `inject`

Inject cron job initialization code into your Next.js app (layout.tsx or _app.tsx).

```bash
npx nextjs-croner inject [options]

Options:
  -t, --target      Target file to inject into (auto-detected if not specified)
  -r, --router      Next.js router type: "app" or "pages" (auto-detected if not specified)
  -f, --force       Force injection even if already present
  -h, --help        Show help
```

This command will:
- Auto-detect your Next.js router type (App Router or Pages Router)
- Add the import statement for `initCronJobs`
- Add initialization code with environment variable check

### `build`

Build and validate cron job configurations, and inject initialization into the standalone server.

```bash
npx nextjs-croner build [options]

Options:
  -c, --config      Path to cron configuration file (default: "./cron.config.js")
  -v, --validate    Validate cron patterns (default: true)
  -h, --help        Show help
```

This command will:
- Validate cron job configurations (if config file exists)
- Inject cron initialization into `.next/standalone/server.js` (if it exists)

**Important**: Run this command after `next build` to inject cron jobs into your standalone build for production deployment.

Example `cron.config.js`:

```javascript
module.exports = {
  jobs: [
    {
      name: 'daily-cleanup',
      pattern: '0 0 * * *',
      handler: () => console.log('Running daily cleanup'),
      options: { timezone: 'America/New_York' }
    }
  ]
};
```

**Production Workflow:**
```bash
next build                    # Build your Next.js app
npx nextjs-croner build       # Inject cron initialization
node .next/standalone/server.js  # Run with cron jobs enabled
```

## Usage

### Basic Setup

Create your cron jobs configuration:

```typescript
// lib/cron-jobs.ts
import { Cron } from 'croner';

export function initCronJobs() {
  // Run every minute
  Cron('* * * * *', () => {
    console.log('Running cron job every minute');
  });

  // Run every day at midnight
  Cron('0 0 * * *', () => {
    console.log('Running daily job at midnight');
  });
}
```

### With Next.js App Router

Initialize your cron jobs in your root layout or a server component:

```typescript
// app/layout.tsx
import { initCronJobs } from '@/lib/cron-jobs';

// Initialize cron jobs once when the server starts
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  initCronJobs();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### With Next.js Pages Router

Initialize in `_app.tsx`:

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { initCronJobs } from '@/lib/cron-jobs';

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  initCronJobs();
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

## Cron Pattern Examples

```typescript
// Every minute
'* * * * *'

// Every hour
'0 * * * *'

// Every day at midnight
'0 0 * * *'

// Every Monday at 9:00 AM
'0 9 * * 1'

// Every 15 minutes
'*/15 * * * *'

// Every weekday at 8:00 AM
'0 8 * * 1-5'
```

See the [croner documentation](https://github.com/Hexagon/croner) for more pattern examples and advanced features.

## Configuration

### Environment Variables

Create a `.env.local` file to control when cron jobs run:

```bash
# Enable cron jobs in development
ENABLE_CRON=true
```

By default, you might want to only run cron jobs in production to avoid multiple instances during development.

## Advanced Usage

### Job with Error Handling

```typescript
import { Cron } from 'croner';

Cron('0 * * * *', async () => {
  try {
    // Your job logic here
    await someAsyncOperation();
  } catch (error) {
    console.error('Cron job failed:', error);
  }
});
```

### Named Jobs

```typescript
import { Cron } from 'croner';

const job = Cron('0 0 * * *', { name: 'daily-cleanup' }, () => {
  console.log('Running daily cleanup');
});

// Later, you can stop the job
job.stop();
```

### Jobs with Timezone

```typescript
import { Cron } from 'croner';

Cron('0 9 * * *', { timezone: 'America/New_York' }, () => {
  console.log('Running at 9 AM Eastern Time');
});
```

## Best Practices

1. **Environment Control**: Use environment variables to control when jobs run
2. **Error Handling**: Always wrap job logic in try-catch blocks
3. **Logging**: Log job execution for monitoring and debugging
4. **Idempotency**: Design jobs to be idempotent (safe to run multiple times)
5. **Resource Management**: Be mindful of resource usage in frequently running jobs
6. **Single Instance**: In production with multiple servers, consider using a distributed lock mechanism

## API Reference

This package uses [croner](https://github.com/Hexagon/croner) under the hood. Refer to the croner documentation for the complete API reference.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/yourusername/nextjs-croner/issues).
