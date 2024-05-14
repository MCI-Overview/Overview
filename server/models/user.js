// Import mongoose
const mongoose = require('mongoose');

// Define user schema for login details
const userLoginSchema = new mongoose.Schema({
    user_email: { type: String, required: true, unique: true },
    user_full_name: { type: String, required: true },
    user_password: { type: String, required: true },
    user_phone_number: { type: String, required: true, unique: true }
});

// Define user schema for user details
const userDetailsSchema = new mongoose.Schema({
    user_nationality: { type: String, required: true},
    user_dob: { type: Date, required: true},
    user_sex: { type: String, required: true },
    user_race: { type: String, required: true },
    user_em_name: { type: String, required: true },
    user_em_contact: { type: String, required: true },
    user_em_relationship: { type: String, required: true },
    user_regadd: {
        country: { type: String },
        unit: { type: String },
        street: { type: String },
        block: { type: String },
        postal: { type: String },
        floor: { type: String }
    },
});

// Define user schema
const userSchema = new mongoose.Schema({
    user_nric: { type: String, required: true, unique: true },
    loginDetails: { type: userLoginSchema, required: true },
    userDetails: { type: userDetailsSchema, required: true }
});

// Create user model
const User = mongoose.model('User', userSchema);

// Export user model
module.exports = User;