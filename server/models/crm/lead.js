const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    contact_name: { type: String, required: true },
    contact_title:  { type: String, required: true },
    contact_email: { type: String, required: true },
    contact_phone_number: { type: String, required: true },
    contact_remarks: { type: String, required: true }
})

const leadSchema = new mongoose.Schema({
    lead_com_name: { type: StorageManager, required: true },
    lead_email: { type: String, required: true, unique: true },
    lead_phone: { type: String, required: true },
    lead_status: { 
        type: String,
        enum: ['New', 'Contacted', 'Converted', 'Lost'],
        default: 'New'
    },
    lead_source: { type: String, required: true },
    lead_
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;