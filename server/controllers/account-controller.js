// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const secretKey = process.env.JWT_SECRET;
const emailLogin = process.env.OTP_LOGIN;
const emailSecret = process.env.OTP_SECRET;

// Import dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require('../models/user');
const OTP = require('../models/otp');

// Function to create and save encrypted OTP into the OTP model DB
const createAndSaveOTP = async (email) => {
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const hashedOTP = await bcrypt.hash(otp, 10);
    const newOTP = new OTP({
        user_email: email,
        purpose: 'account',
        otp: hashedOTP
    });
    await newOTP.save();
    return otp;
};

// Function to send OTP via Google SMTP
const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailLogin,
            pass: emailSecret
        }
    });

    const mailOptions = {
        from: emailLogin,
        to: email,
        subject: 'OTP for account verification',
        text: `Your OTP is ${otp}. Please use this to verify your account.`
    };

    await transporter.sendMail(mailOptions);
};

// Controller functions
const accountController = {
    login: async (req, res) => {
        try {
            const { user_nric, user_password, user_phone_number } = req.body;
            const user = await User.findOne({ user_nric });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            // Check if user_phone_number matches
            if (user.loginDetails.user_phone_number !== user_phone_number) {
                return res.status(400).json({ message: 'Invalid phone number' });
            }
    
            const isPasswordMatch = await bcrypt.compare(user_password, user.loginDetails.user_password);
            if (!isPasswordMatch) {
                return res.status(400).json({ message: 'Invalid password' });
            }
    
            const otp = await createAndSaveOTP(user.loginDetails.user_email);
            await sendOTP(user.loginDetails.user_email, otp);
    
            res.status(200).json({ message: 'OTP sent to your email for verification' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    signup: async (req, res) => {
        try {
            const { user_email, user_full_name, user_password, user_phone_number, user_nric, ...userDetails } = req.body;
            const existingEmail = await User.findOne({ 'loginDetails.user_email': user_email });
            const existingNric = await User.findOne({ user_nric });
    
            if (existingEmail && existingNric) {
                return res.status(400).json({ message: 'User with this email and NRIC already exists' });
            } else if (existingEmail) {
                return res.status(400).json({ message: 'User with this email already exists' });
            } else if (existingNric) {
                return res.status(400).json({ message: 'User with this NRIC already exists' });
            }
    
            const newUser = new User({
                user_nric,
                loginDetails: {
                    user_email,
                    user_full_name,
                    user_password: await bcrypt.hash(user_password, 10),
                    user_phone_number
                },
                userDetails
            });
    
            await newUser.save();
            const otp = await createAndSaveOTP(user_email);
            await sendOTP(user_email, otp);
    
            res.status(200).json({ message: 'User created successfully. Proceed to otp verification.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    resendOTP: async (req, res) => {
        try {
            const { user_email, purpose } = req.body;

            // Delete existing OTP for the given email and purpose
            await OTP.deleteOne({ user_email, purpose });

            // Create and save a new OTP
            const otp = await createAndSaveOTP(user_email);

            // Send the new OTP
            await sendOTP(user_email, otp);

            res.status(200).json({ message: 'OTP resent successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { user_nric, otp } = req.body;
            const user = await User.findOne({ user_nric });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
    
            const otpData = await OTP.findOne({ user_email: user.loginDetails.user_email, purpose: 'account' });
            if (!otpData) {
                return res.status(400).json({ message: 'OTP not found or expired. Please request a new OTP.' });
            }
    
            const isMatch = await bcrypt.compare(otp, otpData.otp);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect OTP' });
            }
    
            await OTP.deleteOne({ user_email: user.loginDetails.user_email, purpose: 'account' });
    
            const token = jwt.sign({ user_nric }, secretKey, { expiresIn: '5h' });
            res.status(200).json({ message: 'OTP verified successfully', token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = {
    accountController
};