# Content Management System (CMS) Backend

## Description
This repository contains the backend codebase for a Content Management System (CMS) built using the Model-View-Controller (MVC) architecture. The CMS is designed to manage and organize campaign data efficiently.

## Features
- **Campaign Management**: Upload and manage campaign data seamlessly through the CMS dashboard.
- **Game Integration**: Play games associated with campaigns during their duration to engage users.
- **User Interaction**: Provide a user-friendly interface for interacting with campaign data and playing games.
- **Data Processing**: Efficiently process and store campaign-related data for analysis and reporting purposes.
- **Scalability**: Designed to scale with growing campaign data and user interactions.

## Technologies
- **Node.js**: JavaScript runtime environment for building scalable network applications.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **Sequelize**: Promise-based Node.js ORM for SQL databases, used for interacting with the database.
- **Multer**: Middleware for handling multipart/form-data, used for file uploads.
- **bcrypt**: Library for hashing passwords.
- **jsonwebtoken**: Library for generating and verifying JSON Web Tokens (JWT) for authentication.
- **dotenv**: Zero-dependency module for loading environment variables from a .env file.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.
- **aws-sdk**: SDK for interacting with Amazon Web Services (AWS), used for file storage.
- **@msgpack/msgpack**: Library for efficient serialization of JSON-like data, used for message packing.
- **@tensorflow/tfjs**: TensorFlow.js library for machine learning in JavaScript, used for machine learning functionalities.
- **archiver**: Library for creating and extracting compressed files, used for file archiving.
- **mathjs**: Extensive math library for JavaScript and Node.js, used for mathematical operations.
- **moment**: Library for parsing, validating, manipulating, and displaying dates and times.
- **moment-timezone**: Timezone support for moment.js, used for timezone manipulation.

## Usage
### Uploading Campaign Data
1. Access the CMS dashboard.
2. Navigate to the campaign management section.
3. Use the provided interface to upload campaign data.
4. Ensure all required fields are filled accurately.
5. Submit the campaign data for processing.

### Playing a Game During Campaign Duration
1. Access the game section within the CMS.
2. Check for ongoing campaigns available for gameplay.
3. Select a campaign to participate in.
4. Follow the instructions provided to start playing the game associated with the campaign.
5. Enjoy playing the game during the campaign duration.

## Getting Started
1. Clone the repository: `git clone https://github.com/yourusername/yourrepository.git`
2. Install dependencies: `npm install`
3. Set up environment variables: Create a `.env` file and add necessary environment variables.
4. Start the server: `npm start`


