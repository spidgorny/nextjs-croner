# nextjs-croner

A Next.js plugin for running cron jobs using the [croner](https://github.com/Hexagon/croner) library without external tools.

## Features

- Run cron jobs directly within your Next.js application
- No external tools or dependencies required
- Powered by croner - a robust and feature-rich cron scheduler
- TypeScript support
- Easy to configure and manage
- Works with Next.js 13+ (App Router and Pages Router)

## Installation

```bash
npm install nextjs-croner
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
