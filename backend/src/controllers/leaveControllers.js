import { Leave } from "../models/leaveModel.js";
import { User } from "../models/userModel.js";
import { sendLeaveApprovedEmail, sendLeaveRejectedEmail, sendLeaveRequestEmail } from "../service/mail.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const applyLeave = async (req, res)=>{
    try {
        const {leaveType, startDate, endDate, reason} = req.body;

        if(!leaveType || !startDate || !endDate ||!reason){
            return res.status(400).json({message: "All fileds are required"})
        }

        const leave = await Leave.create({
            employee: req.user.id,
            leaveType,
            startDate,
            endDate,
            reason
        })

        const employee = await User.findById(req.user.id)
        await sendLeaveRequestEmail(leave, employee)

        res.status(201).json(new ApiResponse(201, leave, "Leave applied Successfully"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}

export const getPendingLeaves = async (req, res)=>{
    const leaves = await Leave.find({status: "pending"}).populate('employee', 'name email' )

    res.status(200).json(new ApiResponse(200, leaves, "All pending Leaves"))
}

//hr approve leaves

export const approveLeave = async (req, res)=>{
    const leave = await Leave.findById(req.params.id)

    if(!leave){
        return res.status(404).json({message: "Leave not found"})
    }

    leave.status = 'approved'
    await leave.save()

    const employee = await User.findById(leave.employee)
    await sendLeaveApprovedEmail(leave, employee)

    // res.json({message: "Leave approved"})
    res.json(new ApiResponse(200, employee, "Employee leave are approved"))
}

//hr reject leave

export const rejectLeave = async (req, res)=>{
    const leave = await Leave.findById(req.params.id)

    if(!leave){
        return res.status(404).json({message: "Leave not found"})
    }

    leave.status = "rejected"
    await leave.save()

    const employee = await User.findById(leave.employee)
    await sendLeaveRejectedEmail(leave , employee)

    res.json(new ApiResponse(200, employee, "Employee leave are rejected"))
}


//employee my leaves

export const myLeaves = async (req, res)=>{
    const leaves = await Leave.find({employee: req.user.id})
    res.status(200).json(new ApiResponse(200, leaves, "Employee all Leaves"))
}