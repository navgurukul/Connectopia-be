const AWS = require("aws-sdk");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;

const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION_NAME,
};
const S3 = new AWS.S3(awsConfig);

module.exports = {
  // uploadS3 and uploadToS3, loadS3, handleUpload and handleUploadAndInsert
  uploadFile: async (fileBuffer, campaign_id, level = null, key) => {
    try {
      // const fileExtension = key.split(".").pop();
      if (key.includes(".mind")) {
        const params = {
          Bucket: bucketName,
          Key: `${campaign_id}/${level}/${key}`,
          Body: fileBuffer,
          ContentType: "application/octet-stream",
        };
        const data = await S3.upload(params).promise();
        return data.Location;
      }

      const params = {
        Bucket: bucketName,
        Key: `${campaign_id}/${level ? level : ""}/${key}`,
        Body: fileBuffer,
      };
      const imageData = await S3.upload(params).promise();
      return imageData.Location;
    } catch (error) {
      return { error: error.message };
    }
  },

  // getPresignedUrl
  getSignedUrl: async (campaign_id, stage_id, level, key) => {
    try {
      if (!campaign_id || !level || !stage_id) {
        return { error: "campaign_id, stage_id, and level are required" };
      }
      const params = {
        Bucket: bucketName,
        Key: `${campaign_id}/${stage_id}/${level}/${key}.mind`, // Adjusted the Key format
        Expires: 3600, // 1 hour
      };
      const url = await S3.getSignedUrl("getObject", params);
      return { url };
    } catch (error) {
      return { error: error.message };
    }
  },

  deleteFile: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }
      const params = {
        Bucket: bucketName,
        Key: name,
      };
      const data = await S3.deleteObject(params).promise();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getFile: async (req, res) => {
    try {
      const { name } = req.params;
      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }
      const params = {
        Bucket: bucketName,
        Key: name,
      };
      const data = await S3.getObject(params).promise();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
