const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const sequelize = require('./config/database');
// const authService = require('./routes/authRoutes');
const organisation = require('./routes/organisationRoutes');
const cmsUser = require('./routes/cmsUser');
const campaign = require('./routes/campaignRoutes');
// const otpVerification = require('./routes/otpVerification');
// const custData = require('./routes/custRoutes');

//new schemas
// const Stage = require('./models/stage');
// const Customer = require('./models/customerData');
// const CMS = require('./models/cmsUser');

const StageConfig = require('./models/stageConfig');

const app = express();
// Middleware
app.use(bodyParser.json());

// Routes
// app.use('/', authService);
app.use('/', organisation);
app.use('/', cmsUser);
app.use('/', campaign);
// app.use('/', otpVerification);
// app.use('/', custData);

// Database Connection

sequelize
  // .authenticate()
  .sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// // HTTPS Options
// const httpsOptions = {
//   key: fs.readFileSync('D:\\Skillmuni.in SSL Certificate file\\skillmuni_key.pem'), 
//   cert: fs.readFileSync('D:\\Skillmuni.in SSL Certificate file\\skillmuni_certificate.crt'),
//   passphrase: 'Tgc@0987'
// };

// // Start HTTPS Server
// const PORT_HTTPS = process.env.PORT || 8080;
// const server = https.createServer(httpsOptions, app).listen(PORT_HTTPS, () => {
//   console.log(`Server running on https://localhost:${PORT_HTTPS}/`);
// });

// Start HTTP Server (optional, you may remove this if you only want HTTPS)
const PORT_HTTP = process.env.PORT || 3000;
app.listen(PORT_HTTP, () => {
  console.log(`Server is running on port ${PORT_HTTP}`);
});
