// logger.js

const morgan = require('morgan');
const emoji = require('node-emoji');
const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

// Directory to store log files (outside current directory)
const logDirectory = path.join(__dirname, '../logs'); // Change the path as per your requirement

// Ensure the log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Define a custom log format with emojis
const emojiLogFormat = ':date[iso] :remote-addr :method :url :status :response-time ms :emoji';

// Register custom token for emojis
morgan.token('emoji', (req, res) => {
  const { statusCode } = res;
  // Determine emoji based on HTTP status code
  let statusEmoji;
  if (statusCode >= 200 && statusCode < 300) {
    statusEmoji = emoji.get('white_check_mark');
  } else if (statusCode >= 400 && statusCode < 500) {
    statusEmoji = emoji.get('x');
  } else if (statusCode >= 500) {
    statusEmoji = emoji.get('warning');
  } else {
    statusEmoji = '';
  }
  return statusEmoji;
});

// Create a rotating write stream for logs
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // Rotate daily
  path: logDirectory,
  compress: 'gzip', // Compress rotated files using gzip
});

// Log to terminal and file in real-time
const saveInLogs = morgan(emojiLogFormat, {
  stream: accessLogStream // Output to rotating file stream
});

const logOut = morgan(emojiLogFormat, {
  stream: process.stdout // Output to stdout (terminal)
});

// Export both middleware instances
module.exports = {
  saveInLogs,
  logOut
};
