const express = require("express");

const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const knexConfig = require("./knexfile.js");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { Model } = require("objection");
require("dotenv").config();
const { saveInLogs, logOut } = require("./middlewares/logger.js"); // custom logger
const app = express();
const environment = process.env.NODE_ENV || "development";

// routes import
const routes = require("./routes/index.js");

// Knex connection
const knex = require("knex")(
  environment === "development" ? knexConfig.development : knexConfig.production
);
Model.knex(knex);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(saveInLogs); // Save logs to file
app.use(logOut); // Log to terminal

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/cms", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  // console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL;
app.listen(PORT, () => {
  console.log(`🌎 Server is running at ${SERVER_URL ? SERVER_URL : `http://127.0.0.1:${PORT}`} 🚀`);
});
