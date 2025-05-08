const { check } = require("express-validator");
const  validateResults  = require("../utils/handleValidator");

const validateSignatureUpload = [
  check("file")
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Signature file is required");
      }

      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error("Format not allowed --> Use JPG, JPEG or PNG");
      }

      return true;
    }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateSignatureUpload };
