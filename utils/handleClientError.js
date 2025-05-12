// Handles client-side validation errors and formats error responses
const { validationResult } = require("express-validator");

const handleClientError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    return res.status(422).json({
      message: "validation eroor",
      errors: extractedErrors
    });
  }
};

module.exports = handleClientError;
