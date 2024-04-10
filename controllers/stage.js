const { loadImage } = require("canvas");

const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const { uploadFile } = require("./awsS3");
const Stage = require("../models/stage.js");

// helper function
const uploadHelperTxn = async (type, req, campaign_id, level, key) => {
  let fileExtension;
  switch (req.file.mimetype) {
    case "image/gif":
      fileExtension = "gif";
      break;
    case "image/jpeg":
      fileExtension = "jpeg";
      break;
    case "image/jpg":
      fileExtension = "jpg";
      break;
    case "image/png":
      fileExtension = "png";
      break;
    case "image/svg+xml":
      fileExtension = "svg";
      break;
    default:
      return res.status(400).send("Unsupported file type.");
  }
  let compositeKey = type === "mind" ? key : `${key}.${fileExtension}`;
  const url = await uploadFile(
    req.file.buffer,
    campaign_id,
    level,
    compositeKey
  );
  return url;
};

const levelConfig = async (stageId, campaign_id) => {
  try {
    const levelData = await StageConfig.query()
      .where("campaign_id", campaign_id)
      .andWhere("stage_id", stageId)
      .orderBy("level", "asc")
      .orderBy("order", "asc");

    const singleLevel = {};

    levelData.forEach((level) => {
      const levelKey = `level-${level.level}`;
      if (!singleLevel.hasOwnProperty(levelKey)) {
        singleLevel[levelKey] = [];
      }
      singleLevel[levelKey].push(level);
    });
    return singleLevel;
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = {
  uploadImageToCampaign: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Upload image to campaign'
      #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer', default: 0}
      #swagger.parameters['level'] = {in: 'path', type: 'integer', default: 0}
      #swagger.parameters['stage_id'] = {in: 'query', type: 'integer', default: 0}
      #swagger.parameters['order'] = {in: 'path', required: true, type: 'integer', default: 0}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'level', enum: ['level', 'geenral']}
    */
    try {
      const { campaign_id, content_type, level, order } = req.params;
      const { stage_id, key } = req.query;
      const id = parseInt(campaign_id);
      const stgId = parseInt(stage_id);
      // remove space from key and limit character
      const updatedKey = key.replace(/\s+/g, "-").slice(0, 50);

      // Check if required parameters are missing
      if (!campaign_id || !level || !key || !order || !content_type) {
        return res
          .status(400)
          .json({ error: "Please provide all required details" });
      }

      // Check if no file is provided for upload
      if (!req.file) {
        return res.status(400).json({
          msg: "No file provided for upload.",
        });
      }

      const data = {
        campaign_id: id,
        order: parseInt(order),
        content_type,
        key: updatedKey,
      };
      const ifStage = await Stage.query().where("id", stgId).andWhere("campaign_id", id).first();
      if (!ifStage) {
        return res.status(200).json({ error: "Stage not found" });
      }
      // Check if the provided content type is 'level' and handle accordingly
      if (content_type === "level") {
        const ifDataExist = await StageConfig.query().where({
          campaign_id: id,
        });
        if (!ifDataExist) {
          return res.status(200).json({ error: "Stage not found" });
        }
        data.level = parseInt(level);
        data.stage_id = stgId;
      } else {
        // If content type is not 'level', assume it's 'campaign' and proceed with upload
        const ifDataExist = await CampaignConfig.query().where({
          campaign_id: id,
        });
        if (!ifDataExist) {
          return res.status(404).json({ error: "Campaign not found" });
        }
      }

      // const fileExt = req.file.originalname.split('.').pop();
      // Perform the file upload and insertion of data
      const url = await uploadHelperTxn(
        "image",
        req,
        campaign_id,
        level,
        updatedKey
      );
      data.image = url;

      const insertedData = await (content_type === "level"
        ? StageConfig.query().insert(data)
        : CampaignConfig.query().insert(data));
      res.status(200).json(insertedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  uploadQR: async (req, res) => {
    /*  
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Upload Campaign Main QR'
      #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
    */
    try {
      const { campaign_id, content_type, key } = req.params;
      const id = parseInt(campaign_id);

      // Check if required parameters are missing
      if ((!campaign_id, !content_type, !key)) {
        return res
          .status(400)
          .json({ error: "Please provide all required details" });
      }

      // Check if no file is provided for upload
      if (!req.file) {
        return res.status(400).json({
          msg: "No file provided for upload.",
        });
      }

      const data = {
        campaign_id: id,
        content_type,
        key,
        order: 0,
      };

      // If content type is not 'level', assume it's 'campaign' and proceed with upload
      const ifCampaignExist = await Campaign.query().findById(id);
      if (!ifCampaignExist) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Perform the file upload and insertion of data
      const url = await uploadHelperTxn(
        "image",
        req,
        campaign_id,
        "product",
        key
      );
      data.image = url;

      const insertedData = await CampaignConfig.query().insert(data);
      res.status(200).json(insertedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateImageToCampaign: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Update image to campaign'
      #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
      #swagger.parameters['content_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'level', enum: ['level', 'geenral']}
    */
    try {
      const { content_id, content_type } = req.params;
      const cid = parseInt(content_id);
      if (!content_id || !content_type) {
        return res.status(400).json({ error: "please content ID" });
      }
      if (!req.file) {
        return res.status(400).json({
          msg: "No file provided for upload.",
        });
      }

      let ifData;
      let level;
      if (content_type === "level") {
        ifData = await StageConfig.query().where("id", cid).first();
        if (!ifData) {
          return res.status(404).json({ error: "Stage not found" });
        }
        level = ifData.level;
      } else {
        ifData = await CampaignConfig.query().findById(cid).first();
        level = "general";
      }
      const campaign_id = ifData.campaign_id;
      const key = ifData.key;
      if (!ifData) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const url = await uploadHelperTxn("image", req, campaign_id, level, key);
      const updateData = await (content_type === "level"
        ? StageConfig.query().patchAndFetchById(cid, { image: url })
        : CampaignConfig.query().patchAndFetchById(cid, { image: url }));
      res.status(200).json(updateData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // /allsignedurls/:campaignid/:scantype
  getSignedUrl: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = ' - get all signed urls for campaign with scantype'
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['scantype'] = {in: 'path', required: true, type: 'string', enum: ['qr', 'image']}           
   */
    try {
      const { campaign_id, scantype } = req.params;
      const id = parseInt(campaign_id);
      if (!campaign_id || !scantype) {
        return res
          .status(400)
          .json({ error: "campaign_id and scantype are required" });
      }
      const campaign = await Campaign.query()
        .select("status")
        .findById(id)
        .first();
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (campaign.status !== "active") {
        return res.status(400).json({ error: "Campaign is not active" });
      }
      const productData = await CampaignConfig.query().where({
        campaign_id,
        content_type: "product",
      });
      res.status(200).json(productData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // /withoutStatus/allsignedurls/:campaignid/:scantype
  getGeneralAndProductContent: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Get general and product content by campaign'
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['scantype'] = {in: 'path', required: true, type: 'string'}
    */
    try {
      const { campaign_id, scantype } = req.params;
      if (!campaign_id || !scantype) {
        return res
          .status(400)
          .json({ error: "campaign_id and scantype are required" });
      }

      const campaign = await Campaign.query()
        .where("id", campaign_id)
        .andWhere("scantype", scantype);

      if (!campaign.length) {
        return res
          .status(404)
          .json({ error: "No campaign found with the provided scantype" });
      }

      const campaignData = {
        general: [],
        product: [],
      };
      const productData = await CampaignConfig.query()
        .where({ campaign_id })
        .orderBy("order", "asc");

      if (!productData.length) {
        return res.status(204).json(campaignData);
      }

      const general = productData.filter(
        (data) => data.content_type === "general"
      );
      const product = productData.filter(
        (data) => data.content_type === "product"
      );

      if (general.length) {
        campaignData.general = general;
      }

      if (product.length) {
        campaignData.product = product;
      }
      res.status(200).json(campaignData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getStagesByCampaignIdWithLevels: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Get all stages & level content by campaign'
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
    */
    try {
      const { campaign_id } = req.params;
      const id = campaign_id;

      if (!campaign_id) {
        return res.status(400).json({ error: "campaign_id is required" });
      }

      const campaign = await Campaign.query().findById(id);

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const stagesData = await Stage.query().where("campaign_id", campaign.id);

      const stages = {};
      let i = 1;

      for (let stage of stagesData) {
        const stageKey = `stage-${i}`;
        const levelData = await levelConfig(stage.id, stage.campaign_id);
        if (!stages.hasOwnProperty(stageKey)) {
          stages[stageKey] = levelData;
          stages[stageKey].stage_id = stage.id;
          stages[stageKey].campaign_id = stage.campaign_id;
        }
        i += 1;
      }

      stages.total_stages = campaign.total_stages;

      return res.status(200).json({ stages });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // /compile-upload/:campaignid/:pageno/:Key/:scantype
  uploadMind: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = ' - upload mind file to campaign'
      #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['order'] = {in: 'path', type: 'integer'}
      #swagger.parameters['key'] = {in: 'path', required: true, type: 'string'}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', enum: ['product', 'general']}
  */
    try {
      const { campaign_id, order, key, content_type } = req.params;
      if (!campaign_id || !order || !key || !content_type) {
        return res
          .status(400)
          .json({ error: "please provide all required details" });
      }
      const campaign = await CampaignConfig.query()
        .where({ campaign_id: parseInt(campaign_id) })
        .first();
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (!req.file) {
        return res.status(400).json({
          msg: "No file provided for upload.",
        });
      }
      const image = await loadImage(req.file.buffer);
      const { OfflineCompiler } = await import(
        "../mind-ar-js-master/src/image-target/offline-compiler.js"
      );
      const compiler = new OfflineCompiler();
      await compiler.compileImageTargets([image], console.log);
      const buffer = compiler.exportData();
      const compositeKeyMind = `${key}.mind`;

      const level = "product";
      const imgUrl = await uploadHelperTxn(
        "image",
        req,
        campaign_id,
        level,
        key
      );
      const mindUrl = await uploadFile(
        buffer,
        campaign_id,
        level,
        compositeKeyMind
      );
      // const mindUrl = await uploadHelperTxn('mind', buffer, campaign_id, level, compositeKeyMind);
      const data = {
        campaign_id: parseInt(campaign_id),
        key,
        order: parseInt(order),
        image: imgUrl,
        content_type,
      };
      const insertData = await CampaignConfig.query().insert(data);
      res.status(200).json(insertData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // /delete-image/:campaignid/:pageno/:key
  deleteImage: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = ' - delete image from campaign'
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['level'] = {in: 'path', required: true, type: 'integer', enum: [1, 2, 3, 4, 5]}
  */
    try {
      const { campaign_id, level, key } = req.params;
      if (!campaign_id || !level || !key) {
        return res
          .status(400)
          .json({ error: "campaign_id, level and key are required" });
      }
      const campaign = await CampaignConfig.query().findById({ campaign_id });
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const deleteData = await StageConfig.query()
        .delete()
        .where({ campaign_id, level, key });
      res.status(200).json(deleteData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createStageByPasses: async (campaignId, stageNum) => {
    console.log(campaignId, stageNum);
    try {
      for (let i = 1; i <= stageNum; i++) {
        const stageData = {
          campaign_id: campaignId,
        };
        await Stage.query().insert(stageData);
      }
      return "stages created";
    } catch (error) {
      throw error;
    }
  },
};
