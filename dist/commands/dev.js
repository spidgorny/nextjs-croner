"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.devCommand = devCommand;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function devCommand(args) {
    console.log('🚀 Starting Next.js dev server with cron jobs...\n');
    // Check if lib/cron/jobs file exists
    const cronJobsPaths = [
        path.resolve(process.cwd(), 'lib', 'cron', 'jobs.ts'),
        path.resolve(process.cwd(), 'lib', 'cron', 'jobs.js'),
    ];
    let cronJobsFile = null;
    for (const jobPath of cronJobsPaths) {
        if (fs.existsSync(jobPath)) {
            cronJobsFile = jobPath;
            break;
        }
    }
    if (cronJobsFile) {
        // Initialize cron jobs
        try {
            console.log('📅 Initializing cron jobs...');
            const cronModule = await Promise.resolve(`${cronJobsFile}`).then(s => __importStar(require(s)));
            if (cronModule.initCronJobs) {
                cronModule.initCronJobs();
                console.log('✓ Cron jobs initialized\n');
            }
            else {
                console.warn('⚠ No initCronJobs function found in cron jobs file\n');
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize cron jobs:');
            if (error instanceof Error) {
                console.error(error.message);
            }
            console.log('');
        }
    }
    else {
        console.log('ℹ No cron jobs file found, skipping cron initialization');
        console.log('  Run "nextjs-croner init" to create cron jobs\n');
    }
    // Start Next.js dev server with all passed arguments
    console.log('Starting Next.js development server...\n');
    const nextPath = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
    const nextDev = (0, child_process_1.spawn)(nextPath, ['dev', ...args], {
        stdio: 'inherit',
        cwd: process.cwd(),
    });
    nextDev.on('error', (error) => {
        console.error('❌ Failed to start Next.js dev server:', error);
        process.exit(1);
    });
    nextDev.on('exit', (code) => {
        process.exit(code || 0);
    });
    // Handle process termination
    process.on('SIGINT', () => {
        nextDev.kill('SIGINT');
    });
    process.on('SIGTERM', () => {
        nextDev.kill('SIGTERM');
    });
}
