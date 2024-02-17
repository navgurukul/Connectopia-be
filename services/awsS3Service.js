// services/awsS3Service.js
const AWS = require('aws-sdk');
const multer = require("multer");
const storage = multer.memoryStorage();
const { CampaignConfig } = require('../models'); // Assuming you have a model for CampaignConfig

//--------------AWS S3 bucket configuration--------
const bucketName = process.env.BUCKET_NAME;
const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION_NAME,
};
const S3 = new AWS.S3(awsConfig);

module.exports = {
  async uploadToS3(fileData, campaignid, pageno, compositeKey) {
    try {
      const params = {
        Bucket: bucketName,
        Key: `${campaignid}/${pageno}/${compositeKey}`,
        Body: fileData,
      };
      const data = await S3.upload(params).promise();
      console.log('File uploaded to S3:', data);
      return data;
    } catch (err) {
      console.error('Error uploading to S3:', err);
      throw err;
    }
  },

  async upload(type) {
    switch (type) {
      case 'mind':
        return multer({
          storage: storage,
          limits: { fileSize: 10 * 1024 * 1024 }, // 30MB for .mind files
        });
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
        });
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
        });
      default:
        throw new Error("Invalid type");
    }
  },

  async deleteImage(campaignid, pageno, key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: `${campaignid}/${pageno}/${key}.jpg`,
      };
      await S3.deleteObject(params).promise();
    } catch (err) {
      console.error('Error deleting image from S3:', err);
      throw err;
    }
  },

  async deleteImageData(campaignid, pageno, key) {
    try {
      await CampaignConfig.destroy({
        where: {
          campaignid,
          pageno,
          key,
        }
      });
      return 'Successfully deleted image data from AWS RDS.';
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Database error: ' + error);
    }
  }


};