// Manages JWT token generation for user authentication
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1 hour' }
    );
};

module.exports = { generateToken };
