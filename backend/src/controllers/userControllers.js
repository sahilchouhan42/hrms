import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendOTPEmail from "../service/mail.js";

export const regiterUser = async (req, res)=>{
    try {
        const {name, email, password, role} = req.body

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
            role,
            otp: hashedOtp,
            otpExpiry: otpExpiry,
            isVerified: false
        })

        sendOTPEmail(email, otp)

        console.log(`OTP is ${otp}`)

        res.status(201).json({message: "User registered successfully", status: 201, user:{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }})

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})   
    }
}


