// Validates personal and company data
// Handles NIF validation and Spanish postal codes
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatePersonaData = [
  check("name").exists().notEmpty().withMessage("Name is required"),
  check("surname").exists().notEmpty().withMessage("Surname is required"),
  check("nif")
    .exists().notEmpty().withMessage("NIF is required")
    .isLength({ min: 9, max: 9 }).withMessage("NIF must be 9 characters"),
  (req, res, next) => validateResults(req, res, next)
];

const validateCompanyData = [
  check("companyName").exists().notEmpty().withMessage("Company name is required"),
  check("cif").exists().notEmpty().withMessage("CIF is required"),
  check("address").exists().notEmpty().withMessage("Address is required"),
  check("number").optional().isNumeric().withMessage("Number must be numeric"),
  check("postal").optional().isPostalCode('ES').withMessage("Postal code is not valid"),
  check("city").optional().isString().withMessage("City must be text"),
  check("province").optional().isString().withMessage("Province must be text"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatePersonaData, validateCompanyData };
