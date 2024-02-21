// app.js
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authService = require('./routes/authRoutes');
const cmsUser = require('./routes/cmsUser');
const organisation = require('./routes/organisationRoutes');
const campaign = require('./routes/campaignRoutes');
const otpVerification = require('./routes/otpVerification');
const custData = require('./routes/custRoutes');

const app = express();
// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', authService);
app.use('/', cmsUser);
app.use('/', organisation);
app.use('/', campaign);
app.use('/', otpVerification);
app.use('/', custData);

// Database Connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
