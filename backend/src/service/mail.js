import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import {fileURLToPath} from 'url'

//_dirname fixed for es module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.resolve(__dirname, "../views/email/otp.ejs")
const hrApprovalTemplate = path.resolve(__dirname, "../views/email/hrApproval.ejs")
const approvedTemplate = path.resolve(__dirname, "../views/email/approved.ejs")
const rejectedTemplate = path.resolve(__dirname, "../views/email/rejected.ejs")

// console.log(process.env.EMAIL_USER)
// console.log(process.env.EMAIL_PASS)

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
})

async function sendOTPEmail(email, otp){
    const html = await ejs.renderFile(templatePath, {otp})

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to:email,
        subject: "OTP Verification",
        html:html
    })
}

export default sendOTPEmail

export const sendHrApprovalEmail = async (user)=>{
    const html = await ejs.renderFile(hrApprovalTemplate, {
        name: user.name,
        email: user.email
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "aman@test.com",
        subject:"New Employee Approval Required",
        html
    })
}

export async function sendApprovedEmail(user){
    const html = await ejs.renderFile(approvedTemplate, {
        name: user.name
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Account Approved",
        html
    })
}

export async function sendRejectedEmail(user){
    const html = await ejs.renderFile(rejectedTemplate, {
        name: user.name
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Account Rejected",
        html
    })
}
