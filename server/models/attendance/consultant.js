// Import mongoose
const mongoose = require('mongoose');

const consultantDetailsSchema = new mongoose.Schema({
    con_name: { type: String, required: true },
    con_phone: { type: String, required: true },
    con_status: { type: String, required: true },
    con_designation: { type: String, required: true },
    con_regno: { type: String },
    con_role: { type: String, required: true }
});

const consultantSchema = new mongoose.Schema({
    con_email: { type: String, required: true, unique: true },
    con_password: { type: String, required: true },
    consultantDetails: { type: consultantDetailsSchema, required: true }
});

// Create user model
const Consultant = mongoose.model('Consultant', consultantSchema);

// Export user model
module.exports = Consultant;