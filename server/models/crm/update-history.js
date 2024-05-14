const mongoose = require('mongoose');

const updateHistorySchema = new mongoose.Schema({
    updatedBy: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedFields: [{
        fieldName: String,
        beforeValue: mongoose.Schema.Types.Mixed,
        afterValue: mongoose.Schema.Types.Mixed
    }]
})

module.exports = updateHistorySchema;