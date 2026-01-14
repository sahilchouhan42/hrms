import express from 'express'
import { regiterUser, verifyOtp } from '../controllers/userControllers.js'

const router = express.Router()

router.post('/register', regiterUser)
router.post('/verify-otp', verifyOtp)

export default router