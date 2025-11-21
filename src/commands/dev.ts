import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export async function devCommand(args: string[]): Promise<void> {
  console.log('🚀 Starting Next.js dev server with cron jobs...\n');

  // Check if lib/cron/jobs file exists
  const cronJobsPaths = [
    path.resolve(process.cwd(), 'lib', 'cron', 'jobs.ts'),
    path.resolve(process.cwd(), 'lib', 'cron', 'jobs.js'),
  ];

  let cronJobsFile: string | null = null;
  for (const jobPath of cronJobsPaths) {
    if (fs.existsSync(jobPath)) {
      cronJobsFile = jobPath;
      break;
    }
  }

  if (cronJobsFile) {
    // Initialize cron jobs
    try {
      console.log('📅 Initializing cron jobs...');
      const cronModule = require(cronJobsFile);
      if (cronModule.initCronJobs) {
        cronModule.initCronJobs();
        console.log('✓ Cron jobs initialized\n');
      } else {
        console.warn('⚠ No initCronJobs function found in cron jobs file\n');
      }
    } catch (error) {
      console.error('❌ Failed to initialize cron jobs:');
      if (error instanceof Error) {
        console.error(error.message);
      }
      console.log('');
    }
  } else {
    console.log('ℹ No cron jobs file found, skipping cron initialization');
    console.log('  Run "nextjs-croner init" to create cron jobs\n');
  }

  // Start Next.js dev server with all passed arguments
  console.log('Starting Next.js development server...\n');

  const nextPath = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const nextDev = spawn(nextPath, ['dev', ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  nextDev.on('error', (error) => {
    console.error('❌ Failed to start Next.js dev server:', error);
    process.exit(1);
  });

  nextDev.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
  });
}
