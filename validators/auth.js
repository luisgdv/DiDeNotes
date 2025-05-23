const { check } = require('express-validator');
const validateResults  = require('../utils/handleValidator');

const validateRegister = [
    check('email', 'Must be a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

const validateLogin = [
    // Validates user authentication
    // Ensures email format and minimum password length (8 chars)
    check('email', 'Must be a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateRegister, validateLogin };
