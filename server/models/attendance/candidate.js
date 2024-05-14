// Import mongoose
const mongoose = require('mongoose');

const candidateEmergencySchema = new mongoose.Schema({
    em_name: { type: String, required: true },
    em_phone: { type: String, required: true },
    em_relationship: { type: String, required: true }   
});

// Define user schema for user details
const candidateDetailsSchema = new mongoose.Schema({
    cdd_name: { type: String, required: true },
    cdd_add_1: { type: String, required: true },
    cdd_add_2: { type: String, required: true },
    cdd_add_3: { type: String, required: true },
    cdd_email: { type: String, required: true, unique: true },
    cdd_phone: { type: String, required: true, unique: true },
    cdd_qualification: { type: String, required: true },
    cdd_pass:  { type: String, required: true }
});

// Define user schema
const candidateSchema = new mongoose.Schema({
    cdd_nric: { type: String, required: true, unique: true },
    cdd_password: { type: String, required: true },
    con_email: { type: String, required: true },
    candidateDetails: { type: candidateDetailsSchema, required: true },
    candidateEmergency: { type: candidateEmergencySchema, required: true }
});

// Create user model
const Candidate = mongoose.model('Candidate', candidateSchema);

// Export user model
module.exports = Candidate;