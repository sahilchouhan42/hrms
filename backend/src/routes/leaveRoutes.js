import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import roleMiddleware from '../middlewares/roleMiddleware.js'
import { applyLeave, approveLeave, getPendingLeaves, myLeaves, rejectLeave } from '../controllers/leaveControllers.js'


const router = express.Router()

//employee
router.post('/apply', authMiddleware, roleMiddleware("employee"), applyLeave)
router.get('/my', authMiddleware, roleMiddleware("employee"), myLeaves)

//hr
router.get('/pending', authMiddleware, roleMiddleware("hr"), getPendingLeaves)
router.put('/approve/:id', authMiddleware, roleMiddleware("hr"), approveLeave)
router.put('/reject/:id', authMiddleware, roleMiddleware("hr"), rejectLeave)

export default router