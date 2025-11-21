import * as fs from 'fs';
import * as path from 'path';
import { Cron } from 'croner';

interface BuildOptions {
  config: string;
  validate: boolean;
}

export async function buildCommand(options: BuildOptions): Promise<void> {
  console.log('🔨 Building cron job configurations...\n');

  const configPath = path.resolve(process.cwd(), options.config);

  // Check if config file exists
  if (fs.existsSync(configPath)) {
    try {
      // Load the config file
      const config = require(configPath);
      const jobs = config.jobs || config.default?.jobs || [];

      if (!Array.isArray(jobs)) {
        console.error('❌ Config must export a "jobs" array');
        process.exit(1);
      }

      console.log(`Found ${jobs.length} cron job(s)\n`);

      // Validate each job
      let hasErrors = false;
      jobs.forEach((job: any, index: number) => {
        const jobName = job.name || `Job #${index + 1}`;
        console.log(`Validating: ${jobName}`);

        // Check required fields
        if (!job.pattern) {
          console.error(`  ❌ Missing "pattern" field`);
          hasErrors = true;
          return;
        }

        if (!job.handler && !job.task && !job.fn) {
          console.error(`  ❌ Missing handler function (use "handler", "task", or "fn")`);
          hasErrors = true;
          return;
        }

        // Validate cron pattern
        if (options.validate) {
          try {
            // Try to create a Cron instance to validate the pattern
            const testCron = new Cron(job.pattern, { paused: true }, () => {});
            testCron.stop();
            console.log(`  ✓ Pattern: ${job.pattern}`);
          } catch (error) {
            console.error(`  ❌ Invalid cron pattern: ${job.pattern}`);
            if (error instanceof Error) {
              console.error(`     ${error.message}`);
            }
            hasErrors = true;
            return;
          }
        }

        // Show options if present
        if (job.options) {
          const opts = [];
          if (job.options.timezone) opts.push(`timezone: ${job.options.timezone}`);
          if (job.options.maxRuns) opts.push(`maxRuns: ${job.options.maxRuns}`);
          if (job.options.catch) opts.push('error handling: enabled');
          if (opts.length > 0) {
            console.log(`  Options: ${opts.join(', ')}`);
          }
        }

        console.log('');
      });

      if (hasErrors) {
        console.error('❌ Build failed with errors\n');
        process.exit(1);
      }

      console.log('✅ Build successful! All cron jobs are valid.\n');
    } catch (error) {
      console.error('❌ Error loading config file:');
      if (error instanceof Error) {
        console.error(error.message);
      }
      console.log('');
      process.exit(1);
    }
  } else {
    console.log('ℹ No config file found, skipping validation\n');
  }

  // Inject cron initialization into standalone server if it exists
  await injectIntoStandaloneServer();
}

async function injectIntoStandaloneServer(): Promise<void> {
  const standaloneServerPath = path.resolve(process.cwd(), '.next', 'standalone', 'server.js');

  // Check if standalone server exists
  if (!fs.existsSync(standaloneServerPath)) {
    console.log('ℹ No standalone server found at .next/standalone/server.js');
    console.log('  Run "next build" first, or ensure output: "standalone" is set in next.config\n');
    return;
  }

  console.log('📦 Injecting cron initialization into standalone server...\n');

  // Read the server file
  let content = fs.readFileSync(standaloneServerPath, 'utf-8');

  // Check if already injected
  if (content.includes('initCronJobs')) {
    console.log('⚠ Cron initialization already present in standalone server\n');
    return;
  }

  // Find the cron jobs file
  const cronJobsPaths = [
    path.resolve(process.cwd(), 'lib', 'cron', 'jobs.js'),
    path.resolve(process.cwd(), 'lib', 'cron', 'jobs.ts'),
  ];

  let cronJobsFile: string | null = null;
  for (const jobPath of cronJobsPaths) {
    if (fs.existsSync(jobPath)) {
      cronJobsFile = jobPath;
      break;
    }
  }

  if (!cronJobsFile) {
    console.log('⚠ No cron jobs file found at lib/cron/jobs.js or lib/cron/jobs.ts');
    console.log('  Run "nextjs-croner init" first to create the cron jobs file\n');
    return;
  }

  // Determine the relative path from .next/standalone to the cron jobs file
  const relativePath = path.relative(
    path.dirname(standaloneServerPath),
    cronJobsFile.replace('.ts', '.js')
  );

  // Prepare the injection code
  const injectionCode = `
// Initialize cron jobs
(async () => {
  try {
    const { initCronJobs } = require('./${relativePath.replace(/\\/g, '/')}');
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
      initCronJobs();
      console.log('✓ Cron jobs initialized');
    }
  } catch (error) {
    console.error('Failed to initialize cron jobs:', error);
  }
})();
`;

  // Append the injection code to the end of the file
  content += injectionCode;

  // Write back to the file
  fs.writeFileSync(standaloneServerPath, content);

  console.log('✓ Injected cron initialization into .next/standalone/server.js');
  console.log(`  Import path: ./${relativePath.replace(/\\/g, '/')}\n`);
}
