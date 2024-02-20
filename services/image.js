// services/awsS3Service.js
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
  },

  async checkKeyInDB(campaignid, pageno, key) {
    try {
      const existingKey = await CampaignConfig.findOne({
        where: {
          campaignid,
          pageno,
          key: {
            [Sequelize.Op.like]: `${key}%`
          }
        }
      });
      return !!existingKey;
    } catch (error) {
      console.error("Error checking key in database:", error);
      throw error;
    }
  },

  async updateExistingKeyInDB(campaignid, pageno, key, scantype, fileExtension) {
    try {
      const updatedKey = await CampaignConfig.update({
        key: `${key}.${fileExtension}`,
        scantype
      }, {
        where: {
          campaignid,
          pageno,
          key: {
            [Sequelize.Op.like]: `${key}%`
          }
        }
      });
      return updatedKey;
    } catch (error) {
      console.error("Error updating key in database:", error);
      throw error;
    }
  },

  async insertNewKeyInDB(campaignid, pageno, compositeKey, scantype) {
    try {
      const newKey = await CampaignConfig.create({
        campaignid,
        pageno,
        key: compositeKey,
        scantype
      });
      return newKey;
    } catch (error) {
      console.error("Error inserting new key in database:", error);
      throw error;
    }
  },

  async fetchKeysFromDB1(campaignid, scantype) {
    try {
      const keysData = await CampaignConfig.findAll({
        attributes: ['key', 'pageno'],
        where: { campaignid, scantype }
      });

      return keysData.map(row => ({ key: row.key, pageno: row.pageno }));
    } catch (error) {
      throw error;
    }
  },

  async fetchKeysFromDB2(campaignid) {
    try {
      const keysData = await Campaign.findAll({
        where: { campaignid }
      });

      return keysData.map(row => ({ key: row.key, pageno: row.pageno }));
    } catch (error) {
      throw error;
    }
  },

  async getPresignedUrl(campaignid, pageno, key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: `${campaignid}/${pageno}/${key}`,
        Expires: 3600  // URL will be valid for 1 hour
      };

      // Logic to generate presigned URL using S3
      const url = await S3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      throw error;
    }
  },

  async deleteObjectsFromS3Folder(folderName) {
    try {
      // List objects in the folder
      const listedObjects = await S3.listObjectsV2({ Bucket: bucketName, Prefix: folderName + '/' }).promise();

      if (listedObjects.Contents.length > 0) {
        // Objects need to be deleted individually
        await S3.deleteObjects({
          Bucket: bucketName,
          Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
        }).promise();

        if (listedObjects.IsTruncated) {
          // Repeat the process if the list is incomplete due to truncation
        }
      }
    } catch (S3Err) {
      console.error(S3Err);
      throw new Error('Error deleting objects from S3 folder: ' + S3Err);
    }
  },

  async loadGifToS3(fileData, campaignid, pageno, compositeKey, scantype) {
    try {
      const params = {
        Bucket: bucketName,
        Key: `${campaignid}/${pageno}/${compositeKey}`,
        Body: fileData,
      };
      const data = await S3.upload(params).promise();

      // Now insert the key into the database
      await this.insertKeyIntoDB(campaignid, pageno, compositeKey, scantype);

      return data;
    } catch (error) {
      console.error("Error uploading GIF to S3:", error);
      throw error;
    }
  },

  async checkKeyInDB(campaignid, pageno, compositeKey) {
    try {
      const count = await CampaignConfig.count({
        where: {
          campaignid,
          pageno,
          key: compositeKey
        }
      });
      return count > 0;
    } catch (error) {
      console.error("Error checking key in the database:", error);
      throw error;
    }
  },

  async insertKeyIntoDB(campaignid, pageno, compositeKey, scantype) {
    try {
      await CampaignConfig.create({
        campaignid,
        pageno,
        key: compositeKey,
        scantype
      });
    } catch (error) {
      console.error("Error inserting key into the database:", error);
      throw error;
    }
  },



};