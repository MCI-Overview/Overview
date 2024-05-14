// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const secretKey = process.env.JWT_SECRET;
const phpsecretKey = process.env.PHP_SECRET_KEY;
const phpiv = process.env.PHP_IV;

// Import dependencies
const axios = require("axios");
const jwt = require("jsonwebtoken")
const crypto = require("crypto");
const Project = require("../models/attendance/project");
const Consultant = require("../models/attendance/consultant");
const Candidate = require("../models/attendance/candidate");

// Attendance functions

// Admin login
const checkAdmin = async (req, res) => {
    try {
        const data = decodeURIComponent(req.body.data);
        const decryptedData = decryptData(data, 'AES-256-CBC', phpsecretKey, phpiv);
        
        const response = await axios.post('https://mci.com.sg/eforms/loa/api/check-admin.php', { email: decryptedData });
        const { isAdmin, email } = response.data;
    
        if (isAdmin) {
            const tokenPayload = {
                role: 'attendanceadmin',
                email: email,
            }

            // If user is admin, generate a JWT token with the email
            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '5h' });
            res.json({ token });
        } else {
            res.status(403).json({ message: 'User is not an admin' });
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ message: 'Failed to check admin status' });
    }
};

// Verify token
const verifyToken = async (req, res) => {
    const token = req.body.token;
    try {
        const decodedToken = jwt.verify(token, secretKey);
        if (decodedToken.role === 'attendanceadmin') {
            res.json({ verified: true });
        } else {
            res.json({ verified: false });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.json({ verified: false });
    }
};
  
function decryptData(data, algorithm, key, iv) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(Buffer.from(data, 'base64'));
    decryptedData = Buffer.concat([decryptedData, decipher.final()]);

    return decryptedData.toString();
}
  
module.exports = { checkAdmin, verifyToken };