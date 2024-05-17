// Import dependencies
import { CorsOptions } from 'cors';
const allowedOrigins = require('./allowed-origins');

// Cors
export const corsOptions: CorsOptions = {
    origin: (origin , callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by Cors'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
