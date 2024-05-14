const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    purpose: { type: String, required: true },
    otp: { type: String, required: true },
    created_at: { type: Date, default: Date.now, expires: '5m' } // Expires in 5 minutes
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;