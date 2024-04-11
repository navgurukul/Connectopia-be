const { loadImage } = require("canvas");

const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const { uploadFile } = require("./awsS3");
const Stage = require("../models/stage.js");
const responseWrapper = require("../helpers/responseWrapper");

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

//helper for stage's level and product data mapping
const levelConfig = async (stageId, campaign_id, content_type) => {
  try {
    const stages = {};
    if (content_type === "product") {
      console.log(true);
      const productData = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stageId)
        .andWhere("content_type", content_type)
        .orderBy("level", "asc");

      for (let i = 1; i <= 5; i++) {
        stages[i] = {};
      }

      productData.forEach(({ level: lvl, ...rest }) => {
        stages[lvl] = { ...rest, level: lvl };
      });
    } else {
      const levelData = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stageId)
        .orderBy(["level", "order"], ["asc", "asc"]);

      for (let i = 1; i <= 5; i++) {
        stages[`level-${i}`] = {};
      }

      levelData.forEach(({ level: lvl, order, ...rest }) => {
        const levelKey = `level-${lvl}`;
        const orderKey = `${order}`;
        if (Object.keys(rest).length > 0) {
          stages[levelKey][orderKey] = { ...rest, level: lvl, order };
        }
      });

      // Ensure that each level object has keys from 1 to 7
      for (let i = 1; i <= 5; i++) {
        const levelKey = `level-${i}`;
        for (let j = 1; j <= 7; j++) {
          stages[levelKey][j] = stages[levelKey][j] || {};
        }
      }
    }
    return stages;
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
      #swagger.parameters['level'] = {in: 'query', type: 'integer', default: 0}
      #swagger.parameters['stage_id'] = {in: 'query', type: 'integer', default: 0}
      #swagger.parameters['order'] = {in: 'path', required: true, type: 'integer', default: 0}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'level', enum: ['level', 'general']}
    */
    try {
      const { campaign_id, content_type, order } = req.params;
      const { stage_id, key, level } = req.query;
      const id = parseInt(campaign_id);
      const stgId = parseInt(stage_id);
      // remove space from key and limit character
      const updatedKey = key.replace(/\s+/g, "-").slice(0, 50);

      // Check if required parameters are missing
      if (!campaign_id || !level || !key || !order || !content_type) {
        const resp = responseWrapper(
          null,
          "Please provide all required details",
          400
        );
        return res.status(400).json(resp);
      }

      // Check if no file is provided for upload
      if (!req.file) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
      }

      const data = {
        campaign_id: id,
        order: parseInt(order),
        content_type,
        key: updatedKey,
      };
      // Check if the provided content type is 'level' and handle accordingly
      const ifStage = await Stage.query()
        .where("id", stgId)
        .andWhere("campaign_id", id)
        .first();
      if (!ifStage) {
        const resp = responseWrapper(null, "Stage not found", 404);
        return res.status(200).json(resp);
      }
      const ifDataExist = await StageConfig.query().where({
        campaign_id: id,
      });
      if (!ifDataExist) {
        const resp = responseWrapper(null, "Stage not found", 404);
        return res.status(200).json(resp);
      }
      data.level = parseInt(level);
      data.stage_id = stgId;
      // If content type is not 'level', assume it's 'campaign' and proceed with upload
      const ifDataCampExist = await CampaignConfig.query().where({
        campaign_id: id,
      });
      if (!ifDataCampExist) {
        const resp = responseWrapper(null, "Campaign not found", 404);
        return res.status(200).json(resp);
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

      const insertedData = await StageConfig.query().insert(data);
      const resp = responseWrapper(insertedData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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
        const resp = responseWrapper(
          null,
          "Please provide all required details",
          400
        );
        return res.status(400).json(resp);
      }

      // Check if no file is provided for upload
      if (!req.file) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
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
        const resp = responseWrapper(null, "Campaign not found", 404);
        return res.status(200).json(resp);
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
      const resp = responseWrapper(insertedData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  updateImageToCampaign: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = 'Update image to campaign'
      #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
      #swagger.parameters['content_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'level', enum: ['level', 'general']}
    */
    try {
      const { content_id, content_type } = req.params;
      const cid = parseInt(content_id);
      if (!content_id || !content_type) {
        return res.status(400).json({ error: "please content ID" });
      }
      if (!req.file) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
      }

      let ifData;
      let level;
      // if (content_type === "level") {
      ifData = await StageConfig.query().where("id", cid).first();
      if (!ifData) {
        const resp = responseWrapper(null, "stage data not found", 404);
        return res.status(200).json(resp);
      }
      if (content_type === "level") {
        level = ifData.level;
        // level = "general";
      } else {
        level = "general";
      }
      // }
      const campaign_id = ifData.campaign_id;
      const key = ifData.key;
      const url = await uploadHelperTxn("image", req, campaign_id, level, key);
      const updateData = await StageConfig.query().patchAndFetchById(cid, { image: url });
      const resp = responseWrapper(updateData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      console.log(error);
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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
        const resp = responseWrapper(
          null,
          "campaign_id and scantype are required",
          400
        );
        return res.status(400).json(resp);
      }
      const campaign = await Campaign.query()
        .select("status")
        .findById(id)
        .first();
      if (!campaign) {
        const resp = responseWrapper(null, "Campaign not found", 404);
        return res.status(200).json(resp);
      }
      if (campaign.status !== "active") {
        const resp = responseWrapper(null, "Campaign is not active", 400);
        return res.status(400).json(resp);
      }
      const generalData = await CampaignConfig.query().where({
        campaign_id,
        content_type: "product",
      });
      const resp = responseWrapper(productData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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
          .json({ message: "campaign_id and scantype are required" });
      }

      const campaign = await Campaign.query()
        .where("id", campaign_id)
        .andWhere("scantype", scantype);

      if (!campaign.length) {
        return res
          .status(404)
          .json({ message: "No campaign found with the provided scantype" });
      }

      const campaignData = {
        general: {},
        product: {
          stages: {},
        },
      };

      // Initialize general object with empty objects for orders 1 to 8
      for (let i = 1; i <= 8; i++) {
        campaignData.general[i] = {};
      }

      const generalData = await CampaignConfig.query()
        .where({ campaign_id })
        .orderBy("order", "asc");

      if (!generalData.length) {
        return res.status(204).json(campaignData);
      }

      generalData.forEach((data) => {
        if (data.content_type === "general") {
          campaignData.general[data.order] = data;
        }
      });

      const stagesData = await Stage.query().where("campaign_id", campaign_id);
      let i = 1;

      for (let stage of stagesData) {
        const stageKey = `stage-${i}`;
        const levelData = await levelConfig(
          stage.id,
          stage.campaign_id,
          "product"
        );
        if (levelData) {
          campaignData.product.stages[stageKey] = {
            ...levelData,
            stage_id: stage.id,
            campaign_id: stage.campaign_id,
          };
        }
        i++;
      }

      return res.status(200).json(campaignData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
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
        const resp = responseWrapper(null, "campaign_id is required", 400);
        return res.status(400).json(resp);
      }

      const campaign = await Campaign.query().findById(id);

      if (!campaign) {
        const resp = responseWrapper(null, "Campaign not found", 404);
        return res.status(404).json(resp);
      }

      const stagesData = await Stage.query().where("campaign_id", campaign.id);

      const stages = {};
      let i = 1;

      for (let stage of stagesData) {
        const stageKey = `stage-${i}`;
        const levelData = await levelConfig(
          stage.id,
          stage.campaign_id,
          "level"
        );
        if (!stages.hasOwnProperty(stageKey)) {
          stages[stageKey] = levelData;
          stages[stageKey].stage_id = stage.id;
          stages[stageKey].campaign_id = stage.campaign_id;
        }
        i += 1;
      }

      stages.total_stages = campaign.total_stages;

      const resp = responseWrapper(stages, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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
        const resp = responseWrapper(
          null,
          "please provide all required details",
          400
        );
        return res.status(400).json(resp);
      }
      const campaign = await CampaignConfig.query()
        .where({ campaign_id: parseInt(campaign_id) })
        .first();
      if (!campaign) {
        const resp = responseWrapper(null, "Campaign not found", 204);
        return res.status(400).json(resp);
      }
      if (!req.file) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
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
      const resp = responseWrapper(insertData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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
        const resp = responseWrapper(
          null,
          "campaign_id, level and key are required",
          400
        );
        return res.status(400).json(resp);
      }
      const campaign = await CampaignConfig.query().findById({ campaign_id });
      if (!campaign) {
        const resp = responseWrapper(null, "Campaign not found", 400);
        return res.status(400).json(resp);
      }
      const deleteData = await StageConfig.query()
        .delete()
        .where({ campaign_id, level, key });
      const resp = responseWrapper(null, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  createStageByPasses: async (campaignId, stageNum) => {
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
