// Import dependencies
const mongoose = require("mongoose");

// Employee schema
const employeeSchema = new mongoose.Schema({
    user_nric: { type: String, required: true },
    role: { type: String, required: true },
    title: { type: String, required: true },
    manager: { type: String },
});

// Company db schema
const companySchema = new mongoose.Schema({
    com_uen: { type: String, required: true, unique: true },
    com_name: { type: String, required: true },
    com_type: { type: String, required: true },
    com_status: { type: String, required: true },
    com_regdate: { type: Date, required: true },
    com_ssic1: { type: String, required: true },
    com_ssic2: { type: String, required: true },
    com_regadd: {
        country: { type: String, required: true },
        unit: { type: String, required: true },
        street: { type: String, required: true },
        block: { type: String, required: true },
        postal: { type: String, required: true },
        floor: { type: String, required: true },
        type: { type: String, required: true },
        building: { type: String, required: true }
    },
    employees: [employeeSchema] // List of employees
});

// Create model using schema
const Company = mongoose.model("Company", companySchema);

// Export model
module.exports = Company;
