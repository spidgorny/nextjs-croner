import { spawn } from 'child_process';
import * as path from 'path';
import { injectCommand } from './inject';

export async function buildCommand(args: string[]): Promise<void> {
  console.log('🔨 Running Next.js build...\n');

  const nextPath = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const nextBuild = spawn(nextPath, ['build', ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  return new Promise((resolve, reject) => {
    nextBuild.on('error', (error) => {
      console.error('❌ Failed to start Next.js build:', error);
      reject(error);
    });

    nextBuild.on('exit', async (code) => {
      if (code !== 0) {
        console.error('❌ Next.js build failed');
        process.exit(1);
      }

      console.log('\n✅ Next.js build complete!\n');

      // Run inject command to copy cron jobs and inject initialization
      try {
        await injectCommand({ force: false });
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      nextBuild.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      nextBuild.kill('SIGTERM');
    });
  });
}
