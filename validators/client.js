// Validates client creation and updates
// Checks required fields: name, CIF, and complete address
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const clientValidator = [
  check("name").notEmpty().withMessage("Name is required"),
  check("cif").notEmpty().withMessage("CIF is required"),
  check("address.street").notEmpty().withMessage("Street is required"),
  check("address.number").isInt({ min: 1 }).withMessage("Number must be a positive integer"),
  check("address.postal").isInt().withMessage("Postal code must be numeric"),
  check("address.city").notEmpty().withMessage("City is required"),
  check("address.province").notEmpty().withMessage("Province is required"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { clientValidator };
