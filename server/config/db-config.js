// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// Import dependencies
const mongoose = require("mongoose");

// Function for db connection
async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to db!");
    } catch (err) {
        console.log(err);
    }
}

// Export functions
module.exports = connectToDb;