import cron from 'node-cron';
import { cleanupDeprecatedPlans } from './Plan.controller.js';
import { autoDeactivateCompaniesJob } from './ChildCompany.controller.js';

// Runs on the 1st of every month at 2 AM
cron.schedule('0 2 1 * *', async () => {
  console.log('🧹 Running monthly maintenance jobs...');

  try {
    await cleanupDeprecatedPlans();
    console.log('✅ Plan cleanup completed');

    await autoDeactivateCompaniesJob();
    console.log('✅ Company auto-deactivation completed');
  } catch (error) {
    console.error('❌ Maintenance job failed:', error);
  }
});
 