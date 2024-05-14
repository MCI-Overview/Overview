const mongoose = require('mongoose');
const moment = require('moment-timezone');

const companyJoinRequestSchema = new mongoose.Schema({
    user_nric: { type: String, required: true },
    com_uen: { type: String, required: true },
    request_date: { type: Date, default: Date.now, required: true },
    request_status: { type: String, required: true }
});

// Create a compound index on user_nric and com_uen to ensure uniqueness    
companyJoinRequestSchema.index({ user_nric: 1, com_uen: 1 }, { unique: true });

const CompanyJoinRequest = mongoose.model('CompanyJoinRequest', companyJoinRequestSchema);

module.exports = CompanyJoinRequest;