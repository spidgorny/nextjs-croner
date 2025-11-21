import * as fs from 'fs';
import * as path from 'path';

interface InitOptions {
  directory: string;
  typescript: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log('🚀 Initializing nextjs-croner...\n');

  const targetDir = path.resolve(process.cwd(), options.directory);
  const ext = options.typescript ? 'ts' : 'js';

  // Create cron jobs directory
  const cronDir = path.join(targetDir, 'lib', 'cron');
  if (!fs.existsSync(cronDir)) {
    fs.mkdirSync(cronDir, { recursive: true });
    console.log('✓ Created directory: lib/cron');
  }

  // Create example cron job file
  const exampleFile = path.join(cronDir, `jobs.${ext}`);
  if (fs.existsSync(exampleFile)) {
    console.log(`⚠ File already exists: lib/cron/jobs.${ext}`);
    return;
  }
  const content = options.typescript
    ? `import { Cron } from 'croner';

/**
 * Initialize all cron jobs
 * Call this function once when your Next.js app starts
 */
export function initCronJobs(): void {
  // Example: Run every minute
  Cron('* * * * *', () => {
    console.log('Running cron job every minute');
  });

  // Example: Run every day at midnight
  Cron('0 0 * * *', async () => {
    console.log('Running daily job at midnight');
    // Add your job logic here
  });

  // Example: Run every Monday at 9:00 AM
  Cron('0 9 * * 1', { timezone: 'America/New_York' }, () => {
    console.log('Running weekly job on Monday at 9 AM EST');
  });

  console.log('✓ Cron jobs initialized');
}
`
    : `const { Cron } = require('croner');

/**
 * Initialize all cron jobs
 * Call this function once when your Next.js app starts
 */
function initCronJobs() {
  // Example: Run every minute
  Cron('* * * * *', () => {
    console.log('Running cron job every minute');
  });

  // Example: Run every day at midnight
  Cron('0 0 * * *', async () => {
    console.log('Running daily job at midnight');
    // Add your job logic here
  });

  // Example: Run every Monday at 9:00 AM
  Cron('0 9 * * 1', { timezone: 'America/New_York' }, () => {
    console.log('Running weekly job on Monday at 9 AM EST');
  });

  console.log('✓ Cron jobs initialized');
}

module.exports = { initCronJobs };
`;

  fs.writeFileSync(exampleFile, content);
  console.log(`✓ Created example file: lib/cron/jobs.${ext}`);

  // Create .env.local with cron configuration
  const envFile = path.join(targetDir, '.env.local');
  const envContent = '\n# Enable cron jobs in development\nENABLE_CRON=true\n';

  if (fs.existsSync(envFile)) {
    const existing = fs.readFileSync(envFile, 'utf-8');
    if (!existing.includes('ENABLE_CRON')) {
      fs.appendFileSync(envFile, envContent);
      console.log('✓ Added ENABLE_CRON to .env.local');
    } else {
      console.log('⚠ ENABLE_CRON already exists in .env.local');
    }
  } else {
    fs.writeFileSync(envFile, envContent);
    console.log('✓ Created .env.local with ENABLE_CRON');
  }

  console.log('\n✅ Initialization complete!');
  console.log('\nNext steps:');
  console.log('1. Edit lib/cron/jobs.ts to add your cron jobs');
  console.log('2. Run "nextjs-croner inject" to add initialization code to your app');
  console.log('3. Start your Next.js development server\n');
}
