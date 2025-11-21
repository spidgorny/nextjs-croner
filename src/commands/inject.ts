import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface InjectOptions {
  force: boolean;
}

function compileTypeScript(sourceCode: string): string {
  const result = ts.transpileModule(sourceCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  });
  return result.outputText;
}

function copyAndCompileDirectory(src: string, dest: string): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyAndCompileDirectory(srcPath, destPath);
    } else if (entry.name.endsWith('.ts')) {
      // Compile TypeScript to JavaScript
      const jsDestPath = destPath.replace(/\.ts$/, '.js');
      try {
        const sourceCode = fs.readFileSync(srcPath, 'utf-8');
        const compiled = compileTypeScript(sourceCode);
        fs.writeFileSync(jsDestPath, compiled);
      } catch (error) {
        console.warn(`  ⚠ Failed to compile ${entry.name}, copying as-is`);
        fs.copyFileSync(srcPath, destPath);
      }
    } else {
      // Copy non-TypeScript files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function injectCommand(options: InjectOptions): Promise<void> {
  console.log('💉 Injecting cron job initialization into .next folder...\n');

  const standaloneServerPath = path.resolve(process.cwd(), '.next', 'standalone', 'server.js');

  // Check if standalone server exists
  if (!fs.existsSync(standaloneServerPath)) {
    console.log('ℹ No standalone server found at .next/standalone/server.js');
    console.log('  Run "next build" first, or ensure output: "standalone" is set in next.config\n');
    return;
  }

  // Check if lib/cron folder exists
  const cronSourceDir = path.resolve(process.cwd(), 'lib', 'cron');
  if (!fs.existsSync(cronSourceDir)) {
    console.log('⚠ No cron folder found at lib/cron');
    console.log('  Run "nextjs-croner init" first to create the cron jobs file\n');
    return;
  }

  // Copy and compile lib/cron to .next/standalone/lib/cron
  const cronDestDir = path.resolve(process.cwd(), '.next', 'standalone', 'lib', 'cron');
  console.log('📁 Compiling and copying lib/cron to .next/standalone/lib/cron...');
  copyAndCompileDirectory(cronSourceDir, cronDestDir);
  console.log('✓ Compiled and copied cron folder\n');

  console.log('📦 Injecting cron initialization into standalone server...\n');

  // Read the server file
  let content = fs.readFileSync(standaloneServerPath, 'utf-8');

  // Check if already injected
  if (content.includes('initCronJobs') && !options.force) {
    console.log('⚠ Cron initialization already present in standalone server');
    console.log('  Use --force to inject anyway\n');
    return;
  }

  // Prepare the injection code with relative path to the copied cron folder
  const injectionCode = `
// Initialize cron jobs
(async () => {
  try {
    const { initCronJobs } = await import('./lib/cron/jobs.js');
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
  console.log('  Import path: ./lib/cron/jobs');
  console.log('\nCron jobs will now run when:');
  console.log('  • NODE_ENV is "production", OR');
  console.log('  • ENABLE_CRON environment variable is "true"\n');
}
