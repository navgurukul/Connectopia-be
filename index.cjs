// app.js
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const authService = require('./routes/authService');
const cmsUser = require('./routes/cmsUser');
const organisation = require('./routes/organisationRoutes');
const campaign = require('./routes/campaignRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authService);
app.use('/api/cmsUser', cmsUser);
app.use('/api/organisation', organisation);
app.use('/api/campaign', campaign);


// Database Connection
sequelize
  .sync()
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
