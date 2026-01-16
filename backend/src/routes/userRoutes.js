import express from 'express'
import { approveUser, getPendingUsers, loginUser, regiterUser, rejectUser, verifyOtp } from '../controllers/userControllers.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import roleMiddleware from '../middlewares/roleMiddleware.js'

const router = express.Router()

router.post('/register', regiterUser)
router.post('/verify-otp', verifyOtp)
router.get('/hr/pending-users', authMiddleware, roleMiddleware('hr'), getPendingUsers)
router.put('/hr/approve', authMiddleware, roleMiddleware('hr'), approveUser)
router.put('/hr/reject', authMiddleware, roleMiddleware('hr'), rejectUser)
router.post('/login', loginUser)

export default router