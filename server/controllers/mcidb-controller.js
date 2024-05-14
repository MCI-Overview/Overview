// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const secretKey = process.env.JWT_SECRET;

// Import dependencies
const axios = require('axios');

const getProjects = async (req, res, next) => {
    try {
        // Get the email from the request query parameters
        const user_email = req.body.user_email;

        // Make a POST request to the PHP API
        const response = await axios.post('https://mci.com.sg/eforms/loa/api/get-projects.php', {
            email: user_email
        });

        // Return the response from the PHP API
        res.json(response.data);
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export
module.exports = {
    getProjects
}
