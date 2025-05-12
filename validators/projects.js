// Validates project creation and updates
// Ensures required fields: name, codes, client ID, address
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const projectValidator = [
  check("name").notEmpty().withMessage("Project name is required"),
  check("projectCode").notEmpty().withMessage("Project code is required"),
  check("code").notEmpty().withMessage("Internal project code is required"),
  check("clientId").notEmpty().withMessage("Client ID is required"),
  check("address.street").notEmpty().withMessage("Street is required"),
  check("address.number").isInt({ min: 1 }).withMessage("Number must be a positive integer"),
  check("address.postal").isInt().withMessage("Postal code must be numeric"),
  check("address.city").notEmpty().withMessage("City is required"),
  check("address.province").notEmpty().withMessage("Province is required"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { projectValidator };
