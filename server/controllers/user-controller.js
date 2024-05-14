// Import dependencies
const User = require("../models/user");
const Company = require("../models/company");
const CompanyJoinRequest = require("../models/company-join-request");

// Get user by nric
const getUser = async (req, res) => {
    const { nric } = req.params;
    try {
        const user = await User.findOne({ user_nric: nric });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get a user's companies by their nric
const getUserCompanies = async (req, res) => {
    const { nric } = req.params;
    try {
        const user = await User.findOne({ user_nric: nric });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Update user account information
const updateUser = async (req, res) => {
    const { nric } = req.params;
    const userData = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate({ user_nric: nric }, userData, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update only userDetails section
const updateUserDetails = async (req, res) => {
    const { nric } = req.params;
    const userDetails = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { user_nric: nric },
            { $set: { userDetails: userDetails } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// User request to join company
const requestJoinCompany = async (req, res) => {
    const { nric } = req.params;
    const { com_uen } = req.body;
    try {
        // Check if the company with the provided com_uen exists
        const existingCompany = await Company.findOne({ com_uen: com_uen });
        if (!existingCompany) {
            return res.status(400).json({ message: 'Company with the provided UEN does not exist.' });
        }

        // Check if a request with the same user_nric and com_uen already exists
        const existingRequest = await CompanyJoinRequest.findOne({ user_nric: nric, com_uen: com_uen });
        if (existingRequest) {
            return res.status(400).json({ message: 'A request with the same user and company already exists.' });
        }

        // If no existing request and company exists, create a new request
        const newRequest = await CompanyJoinRequest.create({
            user_nric: nric,
            com_uen: com_uen,
            request_status: "Pending"
        });
        res.json(newRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update user password
const updateUserPassword = async (req, res) => {
    const user_nric = req.params.nric;
    const { old_password, new_password_1, new_password_2 } = req.body;
    const user = await User.findOne({ user_nric });

    // Check if hashed old password matches with database
    const isPasswordMatch = await bcrypt.compare(old_password, user.loginDetails.user_password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Invalid old password' });
    }

    // CHeck if new password 1 and 2 match
    if (new_password_1 != new_password_2) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(new_password_1, 10)

    // Replace password in database
    try {
         await User.findOneAndUpdate(
            { user_nric: user_nric },
            { $set: { 'loginDetails.user_password': hashedPassword} }
        );
        
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getUser,
    getUserCompanies,
    updateUser,
    updateUserDetails,
    requestJoinCompany,
    updateUserPassword
};