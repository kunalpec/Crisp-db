import cron from 'node-cron';
import { cleanupAbandonedChats } from './chatCleanup.js';

// run every 1 minute
cron.schedule('*/30 * * * *', async () => {
  try {
    await cleanupAbandonedChats();
  } catch (err) {
    console.error('Chat cleanup cron failed:', err);
  }
});
