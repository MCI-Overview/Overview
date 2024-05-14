// Import mongoose
const mongoose = require('mongoose');

const candidateProjectSchema = new mongoose.Schema({
    cdd_nric: { type: String, required: true },
    proj_id: { type: String, required:true }
});

// Ensure combination of proj_id and con_email is unique
candidateProjectSchema.index({ cdd_nric: 1, proj_id: 1 }, { unique: true });

// Create user model
const CandidateProject = mongoose.model('CandidateProject', candidateProjectSchema);

// Export user model
module.exports = CandidateProject;