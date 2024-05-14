// Import dependencies
const Company = require("../models/company");
const CompanyJoinRequest = require("../models/company-join-request");

// Company functions
const getAllCompanies = async (req, res) => {
    // Find companies
    const company = await Company.find();

    // Respond companies
    res.json({
        company: company
    })
}

const createCompany = async (req, res) => {
    // Get data from req
    const user_nric = req.user;
    const com_uen = req.body.com_uen;
    const com_name = req.body.com_name;
    const com_type = req.body.com_type;
    const com_status = req.body.com_status;
    const com_regadd = req.body.com_regadd;
    const com_regdate = req.body.com_regdate;
    const com_ssic1 = req.body.com_ssic1;
    const com_ssic2 = req.body.com_ssic2;

    // Create a company
    const company = await Company.create({
        com_uen: com_uen,
        com_name: com_name,
        com_type: com_type,
        com_status: com_status,
        com_regadd: com_regadd,
        com_regdate: com_regdate,
        com_ssic1: com_ssic1,
        com_ssic2: com_ssic2,
        employees: [{ user_nric: user_nric, role: 'admin'}]
    })

    // Respond with a company
    res.json({
        company: company
    })
}

const getCompanyByUen = async (req, res) => {
    // Get uen from url param
    const uen = req.params.uen;

    // Query the database for the company with the specified UEN
    const company = await Company.findOne({ com_uen: uen });
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    // Return the company data
    res.json(company);
}

const updateCompanyByUen = async (req, res) => {
    const uen = req.params.uen;
    const update = {
        com_name: req.body.com_name,
        com_type: req.body.com_type,
        com_status: req.body.com_status,
        com_regadd: req.body.com_regadd,
        com_regdate: req.body.com_regdate,
        com_ssic1: req.body.com_ssic1,
        com_ssic2: req.body.com_ssic2
    };

    // Find the company by its UEN
    const company = await Company.findOne({ com_uen: uen });
    if (!company) {
        return res.status(404).json({ message: 'Company not found' });
    }

    // Update the company with the specified UEN
    const updatedCompany = await Company.findOneAndUpdate({ com_uen: uen }, update, { new: true });
    // Return the updated company data
    res.json(updatedCompany);
}

const viewJoinRequest = async (req, res) => {
    const { uen } = req.params;

    try {
        // Find all join requests with status "pending" for the company
        const joinRequests = await CompanyJoinRequest.find({ com_uen: uen, request_status: "pending" });
        res.json(joinRequests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const viewRejectedJoinRequest = async (req, res) => {
    const { uen } = req.params;

    try {
        // Find all join requests with status "rejected" for the company
        const joinRequests = await CompanyJoinRequest.find({ com_uen: uen, request_status: "rejected" });
        res.json(joinRequests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const acceptJoinRequest = async (req, res) => {
    const { uen } = req.params;
    const { user_nric, user_role } = req.body;

    try {
        // Find the join request to be accepted
        const joinRequest = await CompanyJoinRequest.findOneAndUpdate(
            { user_nric: user_nric, com_uen: uen, request_status: "pending" },
            { $set: { request_status: "accepted" } },
            { new: true }
        );

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found or already accepted.' });
        }

        // Find the company by com_uen and update the employees array
        const updatedCompany = await Company.findOneAndUpdate(
            { com_uen: uen },
            { $push: { employees: { user_nric: user_nric, role: user_role } } },
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        res.json({ message: 'Join request accepted successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const rejectJoinRequest = async (req, res) => {
    const { uen } = req.params;
    const { user_nric } = req.body;

    try {
        // Find the join request to be rejected
        const joinRequest = await CompanyJoinRequest.findOneAndUpdate(
            { user_nric: user_nric, com_uen: uen },
            { $set: { request_status: "rejected" } },
            { new: true }
        );

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found.' });
        }

        res.json(joinRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const restoreJoinRequest = async (req, res) => {
    const { uen } = req.params;
    const { user_nric } = req.body;

    try {
        // Find the join request to be rejected
        const joinRequest = await CompanyJoinRequest.findOneAndUpdate(
            { user_nric: user_nric, com_uen: uen },
            { $set: { request_status: "pending" } },
            { new: true }
        );

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found.' });
        }

        res.json(joinRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//Export all functions
module.exports = {
    getAllCompanies: getAllCompanies,
    createCompany: createCompany,
    getCompanyByUen: getCompanyByUen,
    updateCompanyByUen: updateCompanyByUen,
    viewJoinRequest: viewJoinRequest,
    viewRejectedJoinRequest: viewRejectedJoinRequest,
    acceptJoinRequest: acceptJoinRequest,
    rejectJoinRequest: rejectJoinRequest,
    restoreJoinRequest: restoreJoinRequest
}