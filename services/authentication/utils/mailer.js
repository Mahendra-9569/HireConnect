import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
});

async function sendMail(to, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Verify Your Account",
        html: `
        <div style="font-family: Arial;">
            <h2>Account Verification</h2>
            <p>Your OTP is:</p>
            <h1 style="color:green">${otp}</h1>
            <p>This OTP expires in 10 minutes</p>
        </div>
        `
    });
}

export default sendMail;