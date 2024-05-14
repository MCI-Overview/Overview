// Import dependencies
const allowedOrigins = require('./allowed-origins');

// Cors
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by Cors'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Export function
module.exports = corsOptions;