import express from 'express'
import { sendDailyDigest } from '../utils/emailDigest.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// POST manually trigger daily digest email
router.post('/send-digest', async (req, res) => {
  try {
    await sendDailyDigest()

    res.json({
      success: true,
      message: 'Daily digest email sent successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    throw new AppError(`Failed to send digest: ${error.message}`, 500)
  }
})

export default router
