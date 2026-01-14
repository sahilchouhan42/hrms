import nodemailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import {fileURLToPath} from 'url'

//_dirname fixed for es module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.resolve(__dirname, "../views/email/otp.ejs")

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