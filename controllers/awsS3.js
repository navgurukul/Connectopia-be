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
  // if key includes mind then stageLevel and if not then stageLevel is just level
  uploadFile: async (fileBuffer, campaign_id, stageLevel = null, key) => {
    try {
      // const fileExtension = key.split(".").pop();
      if (key.includes(".mind")) {
        const params = {
          Bucket: bucketName,
          Key: `${campaign_id}/${stageLevel}/${key}`,
          Body: fileBuffer,
          ContentType: "application/octet-stream",
        };
        const data = await S3.upload(params).promise();
        return data.Location;
      }

      const params = {
        Bucket: bucketName,
        Key: `${campaign_id}/${stageLevel ? stageLevel : ""}/${key}`,
        Body: fileBuffer,
      };
      const imageData = await S3.upload(params).promise();
      return imageData.Location;
    } catch (error) {
      return { error: error.message };
    }
  },

  // getPresignedUrl
  // for getting mind files urls with expiration time
  getSignedUrl: async (
    campaign_id,
    stage_id,
    level,
    key,
    expire,
    scan_sequence
  ) => {
    try {
      if (!campaign_id || !level || !stage_id || !expire) {
        return {
          error: "campaign_id, stage_id, level, and expire are required",
        };
      }

      const [hours, minutes, seconds] = expire.split(":").map(Number); // Use the calculated total seconds as expiration time

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if (scan_sequence === "fixed") {
        const params = {
          Bucket: bucketName,
          Key: `${campaign_id}/${stage_id}/${level}/${key}.mind`,
          Expires: totalSeconds,
        };
        const url = await S3.getSignedUrl("getObject", params);
        return { url };
      } else {
        const params = {
          Bucket: bucketName,
          Key: `${campaign_id}/${stage_id}/targets.mind`,
          Expires: totalSeconds,
        };
        const url = await S3.getSignedUrl("getObject", params);
        return { url };
      }
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

  deleteObjectsFromS3: async (prefix) => {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    try {
      const listedObjects = await S3.listObjectsV2(params).promise();

      if (listedObjects.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach(({ Key }) => {
          deleteParams.Delete.Objects.push({ Key });
        });

        await S3.deleteObjects(deleteParams).promise();
      }

      // Delete the folder itself
      await S3.deleteObject({
        Bucket: bucketName,
        Key: prefix,
      }).promise();

      return { message: "Folder and its contents deleted successfully" };
    } catch (error) {
      return { error: error.message };
    }
  },
};
