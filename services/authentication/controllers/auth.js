import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Blacklist from "../models/BlackList.js";

import getBuffer from "../utils/buffer.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { serializeUser } from "../utils/serialize.js";
import sendMail from "../utils/mailer.js";



export const registerUser = TryCatch(async (req, res) => {
    const { name, email, password, phoneNumber, role, bio } = req.body;

    if (!name || !email || !password || !phoneNumber || !role)
        throw new ErrorHandler(400, "Please fill all details");

    let existingUser = await User.findOne({ email });

    if (existingUser?.isVerified)
        throw new ErrorHandler(409, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    const userData = {
        name,
        email,
        password: hashedPassword,
        phone_number: phoneNumber,
        role,
        bio,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
        isVerified: false
    };


    if (role === "jobseeker") {
        if (!req.file)
            throw new ErrorHandler(
                400,
                "Resume required"
            );

        const buffer = getBuffer(req.file);

        const { data } = await axios.post(
            `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
            { buffer }
        );

        userData.resume = data.url;
        userData.resume_public_id = data.public_id;
    }

    else if (role !== "recruiter") {
        throw new ErrorHandler(
            400,
            "Invalid role"
        );
    }


    let user;

    if (existingUser && !existingUser.isVerified) {
        Object.assign(existingUser, userData);
        user = await existingUser.save();
    }

    else {
        user = await User.create(userData);
    }


    await sendMail(user.email, otp);

    res.status(201).json({
        success: true,
        message: "OTP sent successfully",
        email: user.email
    });

});



export const verifyOTP = TryCatch(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        throw new ErrorHandler(
            400,
            "Email and OTP required"
        );

    const user = await User.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!user)
        throw new ErrorHandler(
            400,
            "Invalid or expired OTP"
        );

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SEC,
        { expiresIn: "15d" }
    );

    res.json({
        success: true,
        message: "Email verified",
        token,
        user: serializeUser(user)
    });

});



export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new ErrorHandler(
            400,
            "Please fill all details"
        );

    const user = await User.findOne({ email });

    if (!user)
        throw new ErrorHandler(
            400,
            "Invalid credentials"
        );

    if (!user.isVerified)
        throw new ErrorHandler(
            401,
            "Verify email first"
        );

    const match = await bcrypt.compare(
        password,
        user.password
    );

    if (!match)
        throw new ErrorHandler(
            400,
            "Invalid credentials"
        );

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SEC,
        { expiresIn: "15d" }
    );

    res.json({
        success: true,
        message: "Login successful",
        token,
        user: serializeUser(user)
    });

});



export const logoutUser = TryCatch(async (req, res) => {

    const token =
        req.headers.authorization?.split(" ")[1]
        || req.cookies?.token;

    if (!token)
        throw new ErrorHandler(
            400,
            "No token found"
        );

    let expiresAt = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
    );

    try {
        const decoded = jwt.decode(token);

        if (decoded?.exp)
            expiresAt = new Date(
                decoded.exp * 1000
            );

    } catch (err) {
        console.log(err);
    }

    await Blacklist.updateOne(
        { token },
        {
            $setOnInsert: {
                token,
                expiresAt
            }
        },
        { upsert: true }
    );

    res.json({
        success: true,
        message: "Logout successful"
    });

});