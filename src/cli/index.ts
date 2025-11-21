#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initCommand } from '../commands/init';
import { buildCommand } from '../commands/build';
import { injectCommand } from '../commands/inject';
import { devCommand } from '../commands/dev';

yargs(hideBin(process.argv))
  .command(
    'init',
    'Initialize nextjs-croner in your Next.js project',
    (yargs) => {
      return yargs
        .option('directory', {
          alias: 'd',
          type: 'string',
          description: 'Target directory for initialization',
          default: '.',
        })
        .option('typescript', {
          alias: 'ts',
          type: 'boolean',
          description: 'Use TypeScript',
          default: true,
        });
    },
    async (argv) => {
      await initCommand(argv);
    }
  )
  .command(
    'dev',
    'Start Next.js dev server with cron jobs',
    (yargs) => {
      return yargs;
    },
    async (argv) => {
      const args = argv._.slice(1) as string[];
      await devCommand(args);
    }
  )
  .command(
    'build',
    'Build Next.js project and inject cron jobs',
    (yargs) => {
      return yargs;
    },
    async () => {
      await buildCommand();
    }
  )
  .command(
    'inject',
    'Inject cron job initialization into .next folder',
    (yargs) => {
      return yargs
        .option('force', {
          alias: 'f',
          type: 'boolean',
          description: 'Force injection even if already present',
          default: false,
        });
    },
    async (argv) => {
      await injectCommand({
        force: argv.force,
      });
    }
  )
  .demandCommand(1, 'You need to specify a command (init, dev, build, or inject)')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .strict()
  .parse();
