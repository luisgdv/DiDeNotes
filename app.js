//main entry point for your Express application
// Import required dependencies
const express = require('express');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")
const morganBody = require("morgan-body");

// Load environment variables from .env file
require('dotenv').config();

// Import local modules
const routers = require('./routes');
const dbConnect = require('./config/mongo.js');
const loggerStream = require("./utils/handleLogger");

// Initialize Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json()); 

// Enable CORS for all routes
app.use(cors());

// Debug middleware to log request body (currently commented out)
app.use((req, res, next) => {
    //console.log("Cuerpo de la solicitud:", req.body);  
    next();
});

// Configure morgan-body logger
// Only logs requests with status code >= 500
// Streams logs to custom logger (Slack webhook)
morganBody(app, {
    noColors: true,
    skip: function (req, res) {
        return res.statusCode < 500;
    },
    stream: loggerStream
});

// Set up Swagger UI for API documentation
app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)

// Mount all routes under /api prefix
app.use('/api', routers); 

// Set up server port (use environment variable or default to 3000)
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

// Export app and server for testing purposes
module.exports = { app, server};

// Initialize database connection
dbConnect();
