// Import mongoose
const mongoose = require('mongoose');

const projectConsultantSchema = new mongoose.Schema({
    proj_id: { type: String, required: true },
    con_email: { type: String, required: true }
});

// Ensure combination of proj_id and con_email is unique
projectConsultantSchema.index({ proj_id: 1, con_email: 1 }, { unique: true });

// Create user model
const ProjectConsultant = mongoose.model('ProjectConsultant', projectConsultantSchema);

// Export user model
module.exports = ProjectConsultant;