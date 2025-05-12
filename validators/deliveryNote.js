// Validates delivery note creation
// Handles both material and hours formats with specific requirements
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");


const deliveryNoteValidator = [
     check("clientId").notEmpty().withMessage("Client ID is required"),
     check("projectId").notEmpty().withMessage("Project ID is required"),
     check("format ")
    .notEmpty().withMessage("Format is required")
    .isIn(["material", "hours"]).withMessage("Invalid format --> {'material' or 'hours'}"),
  check("description").optional().isString(),
  check("workdate").optional().isString(),

  check("material")
    .custom((value, { req }) => {
      if (req.body.format === "material" && (!Array.isArray(value) || value.length === 0)) {
        throw new Error("You must provide at least one material");
      }
      return true;
    }),

  check("workers")
    .custom((value, { req }) => {
      if (req.body.format === "hours" && (!Array.isArray(value) || value.length === 0)) {
        throw new Error("You must provide at least one worker with hours");
      }
      return true;
    }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { deliveryNoteValidator };