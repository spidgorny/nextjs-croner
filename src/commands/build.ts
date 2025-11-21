import { execSync } from 'child_process';
import { injectCommand } from './inject';

export async function buildCommand(): Promise<void> {
  console.log('🔨 Running Next.js build...\n');

  try {
    // Run the official Next.js build command
    execSync('next build', { stdio: 'inherit', cwd: process.cwd() });
    
    console.log('\n✅ Next.js build complete!\n');
  } catch (error) {
    console.error('❌ Next.js build failed');
    process.exit(1);
  }

  // Run inject command to copy cron jobs and inject initialization
  await injectCommand({ force: false });
}

