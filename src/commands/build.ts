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
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    console.log('\nTip: Create a cron.config.js file or specify a different path with --config\n');
    process.exit(1);
  }

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
}
