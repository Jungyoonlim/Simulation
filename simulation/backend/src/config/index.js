require('dotenv').config();

const config = {
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET
};

module.exports = config; 
