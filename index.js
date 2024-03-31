const app = require('express')();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const knexConfig = require('./knexfile.js');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { Model } = require('objection');
require('dotenv').config();
const { saveInLogs, logOut } = require('./middlewares/logger.js'); // custom logger

const organization = require('./routes/organization.js');
const campaignUser = require('./routes/campaign_user.js');
const customer = require('./routes/customer_data.js');
const campaign = require('./routes/campaign.js');
const cmsUser = require('./routes/cms_user.js');
const stage = require('./routes/stage.js');
const sms = require('./routes/sms.js');



// Knex connection
const knex = require('knex')(knexConfig.development);
Model.knex(knex);

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(saveInLogs);  // Save logs to file
app.use(logOut); // Log to terminal

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/cms', organization);
app.use('/cms', campaignUser);
app.use('/cms', customer);
app.use('/cms', campaign);
app.use('/cms', cmsUser);
app.use('/cms', stage);
app.use('/cms', sms);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message,
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌎 Server is running at http://localhost:${PORT} 🚀`);
});
