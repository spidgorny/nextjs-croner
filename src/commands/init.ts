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
  new Cron('* * * * *', () => {
    console.log('Running cron job every minute');
  });

  // Example: Run every day at midnight
  new Cron('0 0 * * *', async () => {
    console.log('Running daily job at midnight');
    // Add your job logic here
  });

  // Example: Run every Monday at 9:00 AM
  new Cron('0 9 * * 1', { timezone: 'America/New_York' }, () => {
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

  // Modify next.config.js or next.config.mjs to enable standalone output
  await configureNextConfig(targetDir, ext);

  console.log('\n✅ Initialization complete!');
  console.log('\nNext steps:');
  console.log('1. Edit lib/cron/jobs.ts to add your cron jobs');
  console.log('2. Run "nextjs-croner inject" to add initialization code to your app');
  console.log('3. Start your Next.js development server\n');
}

async function configureNextConfig(targetDir: string, ext: string): Promise<void> {
  // Try to find next.config file
  const possibleConfigs = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'next.config.cjs',
  ];

  let configFile: string | null = null;
  for (const config of possibleConfigs) {
    const configPath = path.join(targetDir, config);
    if (fs.existsSync(configPath)) {
      configFile = configPath;
      break;
    }
  }

  if (!configFile) {
    // Create a new next.config file
    const newConfigFile = path.join(targetDir, ext === 'ts' ? 'next.config.ts' : 'next.config.js');
    const content =
      ext === 'ts'
        ? `import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
};

export default config;
`
        : `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
`;

    fs.writeFileSync(newConfigFile, content);
    console.log(`✓ Created ${path.basename(newConfigFile)} with standalone output enabled`);
    return;
  }

  // Read existing config file
  let content = fs.readFileSync(configFile, 'utf-8');
  const fileName = path.basename(configFile);

  // Check if output is already set
  if (content.includes('output:') || content.includes('output =')) {
    if (content.includes("output: 'standalone'") || content.includes('output: "standalone"')) {
      console.log(`⚠ Standalone output already configured in ${fileName}`);
      return;
    } else {
      console.log(`⚠ Custom output configuration found in ${fileName}`);
      console.log('  Please manually add "output: \'standalone\'" to your Next.js config');
      return;
    }
  }

  // Try to add output: 'standalone' to the config
  const isESM = configFile.endsWith('.mjs') || configFile.endsWith('.ts');

  if (isESM) {
    // Handle ES modules (export default)
    if (content.includes('export default')) {
      // Try to find the config object
      const exportMatch = content.match(/export default\s+({[\s\S]*?});?\s*$/m);
      if (exportMatch) {
        const configObj = exportMatch[1];
        // Check if it's an empty object or has properties
        if (configObj.trim() === '{}') {
          content = content.replace(
            /export default\s+{/,
            "export default {\n  output: 'standalone',"
          );
        } else {
          // Add after opening brace
          content = content.replace(
            /export default\s+{/,
            "export default {\n  output: 'standalone',"
          );
        }
        fs.writeFileSync(configFile, content);
        console.log(`✓ Added standalone output to ${fileName}`);
      } else {
        console.log(`⚠ Could not parse ${fileName}`);
        console.log('  Please manually add "output: \'standalone\'" to your Next.js config');
      }
    }
  } else {
    // Handle CommonJS (module.exports)
    if (content.includes('module.exports')) {
      const exportsMatch = content.match(/module\.exports\s*=\s*({[\s\S]*?});?\s*$/m);
      if (exportsMatch) {
        const configObj = exportsMatch[1];
        if (configObj.trim() === '{}') {
          content = content.replace(
            /module\.exports\s*=\s*{/,
            "module.exports = {\n  output: 'standalone',"
          );
        } else {
          content = content.replace(
            /module\.exports\s*=\s*{/,
            "module.exports = {\n  output: 'standalone',"
          );
        }
        fs.writeFileSync(configFile, content);
        console.log(`✓ Added standalone output to ${fileName}`);
      } else {
        console.log(`⚠ Could not parse ${fileName}`);
        console.log('  Please manually add "output: \'standalone\'" to your Next.js config');
      }
    }
  }
}
