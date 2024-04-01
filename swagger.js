const swaggerAutogen = require('swagger-autogen')();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const doc = {
    info: {
        title: "Skillmuni APIs",
        description: "Manage Connectopia CMS",
    },
    host: process.env.SERVER_URL || `localhost:${PORT}`,
    basePath: "/cms",
    schemes: ['http', 'https'],
    consumes: ['application/json', 'multipart/form-data', 'application/octet-stream'], 
    produces: ['application/json'],  
    securityDefinitions: {
        apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'API key authentication'
        }
    },
    security: [
        {
            apiKey: [],
        },
    ],
};
const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/*.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
