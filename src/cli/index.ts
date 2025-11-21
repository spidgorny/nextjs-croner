#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initCommand } from '../commands/init';
import { buildCommand } from '../commands/build';
import { injectCommand } from '../commands/inject';

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
    'build',
    'Build and validate cron job configurations',
    (yargs) => {
      return yargs
        .option('config', {
          alias: 'c',
          type: 'string',
          description: 'Path to cron configuration file',
          default: './cron.config.js',
        })
        .option('validate', {
          alias: 'v',
          type: 'boolean',
          description: 'Validate cron patterns',
          default: true,
        });
    },
    async (argv) => {
      await buildCommand(argv);
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
  .demandCommand(1, 'You need to specify a command (init, build, or inject)')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .strict()
  .parse();
