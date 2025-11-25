#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const init_1 = require("../commands/init");
const build_1 = require("../commands/build");
const inject_1 = require("../commands/inject");
const dev_1 = require("../commands/dev");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('init', 'Initialize nextjs-croner in your Next.js project', (yargs) => {
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
}, async (argv) => {
    await (0, init_1.initCommand)(argv);
})
    .command('dev', 'Start Next.js dev server with cron jobs', (yargs) => {
    return yargs;
}, async (argv) => {
    const args = argv._.slice(1);
    await (0, dev_1.devCommand)(args);
})
    .command('build', 'Build Next.js project and inject cron jobs', (yargs) => {
    return yargs;
}, async (argv) => {
    const args = argv._.slice(1);
    await (0, build_1.buildCommand)(args);
})
    .command('inject', 'Inject cron job initialization into .next folder', (yargs) => {
    return yargs.option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'Force injection even if already present',
        default: false,
    });
}, async (argv) => {
    await (0, inject_1.injectCommand)({
        force: argv.force,
    });
})
    .demandCommand(1, 'You need to specify a command (init, dev, build, or inject)')
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .strict()
    .parse();
