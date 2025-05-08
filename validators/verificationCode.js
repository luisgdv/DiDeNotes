const { body } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorVerificationCode = [
  body('code')
    .isNumeric().withMessage('Code must be numeric')
    .isLength({ min: 6, max: 6 }).withMessage('Code must be exactly 6 digits'),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorVerificationCode };
