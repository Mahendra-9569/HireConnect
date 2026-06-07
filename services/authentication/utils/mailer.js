import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();

console.log("USER:", `"${smtpUser}"`); 
console.log("PASS:", `"${smtpPass}"`);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

const sendMail = async (email, otp) => {
    await transporter.sendMail({
        from: `"HireHeaven" <${smtpUser}>`, 
        to: email?.trim(),
        subject: "Verify Account",
        html: `
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
        `
    });
};

export default sendMail;