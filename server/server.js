// Load env variables
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const secretKey = process.env.JWT_SECRET;

// Import dependencies
const express = require("express");
const cors = require("cors"); // Required because react and express run in different domains
const connectToDb = require("./config/db-config");
const corsOptions = require('./config/cors-options');

// Import controllers
const companyController = require("./controllers/company-controller");
const userController = require("./controllers/user-controller");
const accountController = require("./controllers/account-controller").accountController;
const middlewareController = require("./controllers/middleware-controller");
const mcidbController = require("./controllers/mcidb-controller");
const attendanceController = require("./controllers/attendance-controller");

// Create an express app
const app = express();

// Configure express app
app.use(express.json());
app.use(cors(corsOptions));

// Connect to db
connectToDb();

// Middleware functions
const authenticateUser = middlewareController.authenticateUser; // Check if user is logged in
const checkUserAccess = middlewareController.checkUserAccess; // Only user can access rheir own data
const isAdmin = middlewareController.isAdmin; // Check if user is an admin of company

// Routing
app.get('/', (req, res) => {
    res.json({ hello:"WORLDDDDD\n\nDDDD!!!" });
})

// Company Routes
app.get('/company/all', companyController.getAllCompanies); // Get all companies
app.post('/company/create', authenticateUser, companyController.createCompany); // Create a company
app.get('/company/:uen', authenticateUser, companyController.getCompanyByUen); // Find a company by uen
app.put('/company/:uen/update', authenticateUser, companyController.updateCompanyByUen); // Update a company by uen

// User Routes
app.get('/user/:nric', authenticateUser, checkUserAccess, userController.getUser); // Get user by NRIC
app.get('/user/:nric/companies', authenticateUser, checkUserAccess, userController.getUserCompanies); // Get a user's companies by their NRIC
app.put('/user/:nric/update', authenticateUser, checkUserAccess, userController.updateUser); // Update user account information
app.put('/user/:nric/update/userdetails', authenticateUser, checkUserAccess, userController.updateUserDetails); // Update user account information
app.put('/user/:nric/update/password', authenticateUser, checkUserAccess, userController.updateUserPassword); // Update user password

// Account Routes
app.post('/account/login', accountController.login); // Login users
app.post('/account/signup', accountController.signup); // Signup users
app.post('/account/verify-otp', accountController.verifyOTP); // Verify otp to get token
app.get('/account/resend-otp', accountController.resendOTP); // Resend otp

// Join company endpoint
app.post('/user/:nric/joinrequest', authenticateUser, checkUserAccess, userController.requestJoinCompany); // User request join access
app.get("/company/:uen/joinrequest/view", authenticateUser, isAdmin, companyController.viewJoinRequest); // View pending request
app.get('/company/:uen/joinrequest/viewrejected', authenticateUser, isAdmin, companyController.viewRejectedJoinRequest); // View rejected requests
app.put('/company/:uen/joinrequest/accept', authenticateUser, isAdmin, companyController.acceptJoinRequest); // Accept join req
app.put('/company/:uen/joinrequest/reject', authenticateUser, isAdmin, companyController.rejectJoinRequest); // Reject join req
app.put('/company/:uen/joinrequest/restore', authenticateUser, isAdmin, companyController.restoreJoinRequest); // Restore join req

// Attendance module
app.post('/people/attendance/checkadmin', attendanceController.checkAdmin);
app.post('/people/attendance/user/login');
app.post('/people/getprojects', mcidbController.getProjects);
app.post('/attendance/update/project');
app.post('/attendance/import/candidates');
app.post('/attendance')

// Start server
app.listen(process.env.PORT);
