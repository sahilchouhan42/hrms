import express from 'express'
import { activateEmployee, approveUser, deactivateEmployee, getAllEmployees, getPendingUsers, loginUser, regiterUser, rejectUser, verifyOtp } from '../controllers/userControllers.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import roleMiddleware from '../middlewares/roleMiddleware.js'

const router = express.Router()

router.post('/register', regiterUser)
router.post('/verify-otp', verifyOtp)
router.get('/hr/employees', authMiddleware, roleMiddleware("hr"), getAllEmployees)
router.get('/hr/pending-users', authMiddleware, roleMiddleware('hr'), getPendingUsers)
router.put('/hr/approve', authMiddleware, roleMiddleware('hr'), approveUser)
router.put('/hr/reject', authMiddleware, roleMiddleware('hr'), rejectUser)
router.put('/hr/activate', authMiddleware, roleMiddleware('hr'), activateEmployee)
router.put('/hr/deactivate', authMiddleware, roleMiddleware('hr'), deactivateEmployee)
router.post('/login', loginUser)

export default router