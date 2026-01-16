import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    otp:{
        type: String
    }, 
    otpExpiry:{
        type: Date
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    role:{
        type: String,
        enum:['employee', 'admin', 'hr'],
        default: "employee"
    },
    status:{
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // approvalToken:{
    //     type: String
    // }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema)

