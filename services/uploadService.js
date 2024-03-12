// Define upload function

const AWS = require('aws-sdk');
const multer = require("multer");
const Sequelize = require('sequelize');
const storage = multer.memoryStorage();
const CampaignConfig = require('../models/campaignConfig'); // Assuming you have a model for CampaignConfig
const Campaign = require('../models/campaign');
require('dotenv').config();

//--------------AWS S3 bucket configuration--------
const bucketName = process.env.BUCKET_NAME;
const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION_NAME,
};
const S3 = new AWS.S3(awsConfig);

function upload(type) {
    console.log(type,"type");
    switch (type) {
      case 'mind':
        return multer({
          storage: storage,
          limits: { fileSize: 10 * 1024 * 1024 }, // 30MB for .mind files
        }).single('image'); // Assuming 'file' as the field name for .mind files
      case 'image':
        return multer({
          storage: storage,
          limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for images
          fileFilter: function (req, file, cb) {
            const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];
            if (allowedMimes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(new Error("Only jpeg, jpg, png, and svg files are allowed"), false);
            }
          }
        }).single('image'); // Assuming 'image' as the field name for images
      case 'gif':
        return multer({
          storage: storage,
          limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for gifs
          fileFilter: function (req, file, cb) {
            if (file.mimetype === "image/gif") {
              cb(null, true);
            } else {
              cb(new Error("Only gif files are allowed"), false);
            }
          }
        }).single('image'); // Assuming 'gif' as the field name for gifs
      default:
        throw new Error("Invalid type");
    }
  }

  
 module.exports = { upload };