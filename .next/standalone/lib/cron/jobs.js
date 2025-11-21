"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = initCronJobs;
const croner_1 = require("croner");
/**
 * Initialize all cron jobs
 * Call this function once when your Next.js app starts
 */
function initCronJobs() {
    // Example: Run every minute
    // Example: Run every minute
    new croner_1.Cron('* * * * *', () => {
        console.log('Running cron job every minute');
    });
    // Example: Run every day at midnight
    new croner_1.Cron('0 0 * * *', async () => {
        console.log('Running daily job at midnight');
        // Add your job logic here
    });
    // Example: Run every Monday at 9:00 AM
    new croner_1.Cron('0 9 * * 1', { timezone: 'America/New_York' }, () => {
        console.log('Running weekly job on Monday at 9 AM EST');
    });
    console.log('✓ Cron jobs initialized');
}
