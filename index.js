const app = require('express')();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const knexConfig = require('./knexfile.js');
const { Model } = require('objection');
require('dotenv').config();
const { saveInLogs, logOut } = require('./middlewares/logger.js'); // custom logger

const organization = require('./routes/organization.js');


// Knex connection
const knex = require('knex')(knexConfig.development);
Model.knex(knex);

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(saveInLogs);  // Save logs to file
app.use(logOut); // Log to terminal

// Routes
app.use('/api', organization);

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
