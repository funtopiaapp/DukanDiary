import cron from 'node-cron'
import { sendDailyDigest } from '../utils/emailDigest.js'

export const initializeCronJobs = () => {
  // Daily digest at 7 PM IST (19:00)
  // IST is UTC+5:30, so 7 PM IST = 1:30 PM UTC
  // Cron format: minute hour * * *
  const dailyDigestJob = cron.schedule('30 13 * * *', async () => {
    console.log('⏰ Running scheduled daily digest job...')
    await sendDailyDigest()
  })

  console.log('✅ Cron job initialized: Daily digest at 7 PM IST')

  return { dailyDigestJob }
}

// Note: To run the cron job at a different time, use this format:
// cron.schedule('*/5 * * * *', () => {}) // Every 5 minutes
// cron.schedule('0 19 * * *', () => {}) // Every day at 7 PM IST (adjust for UTC)
// cron.schedule('0 9 * * MON', () => {}) // Every Monday at 9 AM
