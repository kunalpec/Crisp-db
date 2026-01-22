import cron from 'node-cron';
import { cleanupDeprecatedPlans } from './createPlan.controller.js';

// Runs every day at 2 AM
cron.schedule('0 2 1 * *', async () => {
  console.log('🧹 Running plan cleanup job...');
  await cleanupDeprecatedPlans();
});


// ┌──────── minute (0)
// │ ┌────── hour (2 AM)
// │ │ ┌──── day of month (1st)
// │ │ │ ┌── month (every)
// │ │ │ │ ┌─ day of week (every)
// │ │ │ │ │
// 0 2 1 * *
