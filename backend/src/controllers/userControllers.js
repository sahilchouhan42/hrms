import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendOTPEmail, { sendApprovedEmail, sendHrApprovalEmail, sendRejectedEmail } from "../service/mail.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const regiterUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body

        //validation
        if(!name||!email||!password){
            return res.status(401).json({message: "All fields are required"})
        }

        //exist user
        const existUser = await User.findOne({email})
        if(existUser){
            return res.status(402).json({message: "User is already registered"})
        }

        //create password-hashed password
        const salt =  await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //otp generate
        const otp = Math.floor(100000 + Math.random()*900000).toString()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const otpExpiry =  Date.now()+ 5*60*60*1000

        //
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            otp: hashedOtp,
            otpExpiry: otpExpiry,
            isVerified: false,
            status:'pending'
        })

        sendOTPEmail(email, otp)

        console.log(`OTP is ${otp}`)

        res.status(201).json(new ApiResponse(201, user, "User registered successfully"))

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})   
    }
}

export const verifyOtp = async (req, res)=>{
    try {
        const {email, otp} = req.body;

        //validation
        if(!email||!otp){
            return res.status(403).json({message: "Email and OTP are required"})
        }

        //find user
        const user = await User.findOne({email})
        if(!user){
            return res.status(403).json({message: "user not found"})
        }

        //user already verified
        if(user.isVerified){
            return res.status(403).json({message: "user already verified"})
        }

        //otp expiry check
        if(user.otpExpiry<Date.now()){
            return res.status(400).json({message: "OTP expired"})
        }

        //match otp
        const isOtpValid = await bcrypt.compare(otp, user.otp)
        if(!isOtpValid){
            return res.status(400).json({message: "OTP invalid"})
        }

        //verify user
        user.otp = null;
        user.otpExpiry=null;
        user.isVerified = true;

        // const approvalToken = crypto.randomBytes(32).toString("hex")
        // user.approvalToken = approvalToken
        await user.save()

        await sendHrApprovalEmail(user)
        res.status(200).json(new ApiResponse(201, "OTP Verified, plz ask hr to approve"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}

export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body;

        //validation
        if(!email||!password){
            return res.status(400).json({message: "Email and Password are required"})
        }

        //find user
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "User not found"})
        }

        //verified user only
        if(!user.isVerified){
            return res.status(400).json({message: "Please verify first"})
        }

        //password match
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"})
        }

        //approval status
        if(user.status!=='approved'){
            return res.status(403).json({message: "Your account is not approved by HR"})
        }

        if(!user.isActive){
            return res.status(403).json({message: "Your account has been deactivated. Please contact HR."})
        }

        //token generation
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: "7d"})

        // res.status(200).json({status: 200, message: "Login Successfull", token: token, user:{
        //     id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     role: user.role
        // }})

        res.status(200).json(new ApiResponse(200,{token: token, user:{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }}, "Login Successfull"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}

export const getPendingUsers = async(req, res)=>{
    const users = await User.find({status: 'pending'}).select('-password')
    res.status(200).json(new ApiResponse(200, users, "All Pending Users"))
}

export const approveUser = async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email});

    user.status = 'approved'
    await sendApprovedEmail(user)
    await user.save()

    res.json({message: "user approved successfully"})
}

export const rejectUser = async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email})

    user.status = "rejected"
    await sendRejectedEmail()
    await user.save()
    
    res.json({message: "User rejected successfully"})
}

export const getAllEmployees = async (req, res)=>{
    try {
        const employees = await User.find({role: 'employee'}, {password: 0})

        return res.status(200).json(new ApiResponse(200, employees, "All employees data"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}

export const deactivateEmployee = async (req, res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        console.log(user)
        if(!user){
            return res.status(403).json({message: "User not found"})
        }

        if(user.role!=='employee'){
            return res.status(400).json({message: "Only employees can be deactivated"})
        }

        user.isActive = false
        await user.save()

        res.status(200).json(new ApiResponse(200, "User is deactivated"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}


export const activateEmployee = async (req, res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email})

        if(!user){
            return res.status(403).json({message: "User not found"})
        }

        if(user.role!=='employee'){
            return res.status(400).json({message: "Only employees can be deactivated"})
        }

        user.isActive = true    
        await user.save()

        res.status(200).json(new ApiResponse(200, "User is activated"))
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}