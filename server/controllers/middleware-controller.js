// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const secretKey = process.env.JWT_SECRET;

// Import dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), secretKey);
        req.user = decoded;

        const { user_nric } = decoded;
        const user = await User.findOne({ user_nric });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }
};

const checkUserAccess = (req, res, next) => {
    const { nric } = req.params;
    if (req.user.user_nric !== nric) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    const { uen } = req.params;
    const { user_nric } = req.user;

    // Find the company by UEN
    Company.findOne({ com_uen: uen }, (err, company) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check if the user is an admin in the company
        const isAdmin = company.employees.some(employee => {
            return employee.user_nric === user_nric && employee.role === 'admin';
        });

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin access required' });
        }

        // User is an admin, proceed to the next middleware or route handler
        next();
    });
};

// Export
module.exports = {
    authenticateUser,
    checkUserAccess,
    isAdmin
}
