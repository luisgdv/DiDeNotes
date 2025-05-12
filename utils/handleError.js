// Provides standardized HTTP error handling functionality for the API
const handleHttpError = (res, message = "ERROR", code = 500) => {
    res.status(code).json({ error: message });
};
  
module.exports = { handleHttpError };
  