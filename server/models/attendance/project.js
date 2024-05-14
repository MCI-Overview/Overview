// Import mongoose
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    proj_id: { type: String, required: true, unique: true },
    proj_title: { type: String, required: true } 
});

// Create user model
const Project = mongoose.model('Project', projectSchema);

// Export user model
module.exports = Project;