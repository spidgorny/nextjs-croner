import * as fs from 'fs';
import * as path from 'path';

interface InjectOptions {
  target?: string;
  router?: 'app' | 'pages';
  force: boolean;
}

export async function injectCommand(options: InjectOptions): Promise<void> {
  console.log('💉 Injecting cron job initialization...\n');

  const cwd = process.cwd();
  let targetFile: string | null = null;
  let routerType: 'app' | 'pages' | null = null;

  // Determine target file and router type
  if (options.target) {
    targetFile = path.resolve(cwd, options.target);
    if (!fs.existsSync(targetFile)) {
      console.error(`❌ Target file not found: ${targetFile}\n`);
      process.exit(1);
    }
    // Infer router type from file path or explicit option
    if (options.router) {
      routerType = options.router;
    } else if (targetFile.includes('/app/')) {
      routerType = 'app';
    } else if (targetFile.includes('/pages/')) {
      routerType = 'pages';
    }
  } else {
    // Auto-detect
    const appLayout = path.join(cwd, 'app', 'layout.tsx');
    const appLayoutJs = path.join(cwd, 'app', 'layout.js');
    const pagesApp = path.join(cwd, 'pages', '_app.tsx');
    const pagesAppJs = path.join(cwd, 'pages', '_app.js');

    if (options.router === 'app' || (!options.router && fs.existsSync(appLayout))) {
      targetFile = appLayout;
      routerType = 'app';
    } else if (!options.router && fs.existsSync(appLayoutJs)) {
      targetFile = appLayoutJs;
      routerType = 'app';
    } else if (options.router === 'pages' || (!options.router && fs.existsSync(pagesApp))) {
      targetFile = pagesApp;
      routerType = 'pages';
    } else if (!options.router && fs.existsSync(pagesAppJs)) {
      targetFile = pagesAppJs;
      routerType = 'pages';
    }
  }

  if (!targetFile || !routerType) {
    console.error('❌ Could not find target file.');
    console.log('\nPlease specify the target file explicitly:');
    console.log('  nextjs-croner inject --target app/layout.tsx');
    console.log('  nextjs-croner inject --target pages/_app.tsx\n');
    process.exit(1);
  }

  console.log(`Target: ${path.relative(cwd, targetFile)}`);
  console.log(`Router: ${routerType}\n`);

  // Read the file
  let content = fs.readFileSync(targetFile, 'utf-8');

  // Check if already injected
  if (content.includes('initCronJobs') && !options.force) {
    console.log('⚠ Cron job initialization already present in file.');
    console.log('  Use --force to inject anyway\n');
    return;
  }

  const importPath = '@/lib/cron/jobs';

  // Prepare injection code
  const importStatement = `import { initCronJobs } from '${importPath}';\n`;
  const initCode = `\n// Initialize cron jobs
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  initCronJobs();
}\n`;

  // Add import at the top
  if (!content.includes(importStatement)) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, importStatement.trim());
      content = lines.join('\n');
    } else {
      content = importStatement + content;
    }
    console.log('✓ Added import statement');
  }

  // Add initialization code
  if (!content.includes('initCronJobs()')) {
    if (routerType === 'app') {
      // For App Router, add before the export default function
      const exportMatch = content.match(/export default function \w+/);
      if (exportMatch && exportMatch.index !== undefined) {
        content = content.slice(0, exportMatch.index) + initCode + content.slice(exportMatch.index);
      } else {
        console.log('⚠ Could not find export default function, adding at end of file');
        content += initCode;
      }
    } else {
      // For Pages Router, add after imports
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('type ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '') {
          continue;
        } else {
          break;
        }
      }
      lines.splice(insertIndex, 0, initCode);
      content = lines.join('\n');
    }
    console.log('✓ Added initialization code');
  }

  // Write back to file
  fs.writeFileSync(targetFile, content);

  console.log('\n✅ Injection complete!');
  console.log('\nCron jobs will now run when:');
  console.log('  • NODE_ENV is "production", OR');
  console.log('  • ENABLE_CRON environment variable is "true"\n');
}
