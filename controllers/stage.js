const { loadImage } = require("canvas");

const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const { uploadFile } = require("./awsS3");
const Stage = require("../models/stage.js");
const responseWrapper = require("../helpers/responseWrapper");
const awsS3 = require("./awsS3");
const { exp } = require("mathjs");

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
const levelHelper = async (stage_id, campaign_id) => {
  try {
    const stages = {};
    const levelData = await StageConfig.query()
      .where("campaign_id", campaign_id)
      .andWhere("stage_id", stage_id)
      .andWhere("content_type", "level")
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
    return stages;
  } catch (error) {
    return { error: error.message };
  }
};

const productHelper = async (
  stage_id,
  campaign_id,
  scantype,
  content_type,
  expire,
  scan_sequence
) => {
  try {
    const stages = {};
    if (scantype === "image") {
      const productData = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stage_id)
        .andWhere("content_type", content_type)
        .orderBy("level", "asc");

      for (let i = 1; i <= 5; i++) {
        stages[i] = {};
      }

      // Fetching signed URLs for mind files
      const signedUrls = await Promise.all(
        productData.map(async ({ key, level, image }) => {
          const { url, error } = await awsS3.getSignedUrl(
            campaign_id,
            stage_id,
            level,
            key,
            expire,
            scan_sequence
          );
          if (error) {
            console.log(error, "error");
            throw new Error(error);
          }
          return { key, level, image, url };
        })
      );

      if (scan_sequence === "fixed") {
        signedUrls.forEach(({ key, level, image, url }) => {
          stages[level] = {
            key,
            level,
            image,
            mind: url,
          };
        });
      } else {
        signedUrls.forEach(({ key, level, image, url }) => {
          stages[level] = {
            key,
            level,
            image,
          };
          stages.mind = url;
        });
      }
    } else {
      const productData = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stage_id)
        .andWhere("content_type", "product-qr")
        .orderBy("level", "asc");
      for (let i = 1; i <= 5; i++) {
        stages[i] = {};
      }

      productData.forEach(({ key, level, image }) => {
        stages[level] = {
          key,
          level,
          image,
        };
      });
    }

    return stages;
  } catch (error) {
    return { error: error.message };
  }
};

const generalProductHelper = async (
  campaign_id,
  scantype,
  expire,
  scan_sequence
) => {
  try {
    const campaignData = {
      general: {},
      product: {
        mainQR: {},
        stages: {},
      },
    };

    const productQR = await CampaignConfig.query() //campaign_id, content_type= product, key:Main-QRCode, order =0
      .where("campaign_id", campaign_id)
      .andWhere("order", 0)
      .andWhere("content_type", "product");

    if (productQR.length > 0) {
      campaignData.product.mainQR = productQR[0];
    }
    // Initialize general object with empty objects for orders 1 to 8
    for (let i = 1; i <= 8; i++) {
      campaignData.general[i] = {};
    }

    const generalData = await CampaignConfig.query()
      .where({ campaign_id })
      .orderBy("order", "asc");

    generalData.forEach((data) => {
      if (data.content_type === "general") {
        campaignData.general[data.order] = data;
      }
    });

    const stagesData = await Stage.query().where("campaign_id", campaign_id);
    let i = 1;

    for (let stage of stagesData) {
      const stageKey = `stage-${i}`;
      const levelData = await productHelper(
        stage.id,
        stage.campaign_id,
        scantype,
        "product",
        expire,
        scan_sequence
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
    if (productQR.length > 0) {
      campaignData.product.mainQR = productQR[0];
    }
    return campaignData;
  } catch (error) { }
  return { error: error.message };
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
      if (!campaign_id || !order || !content_type) {
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
      if (content_type === "level") {
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
      } else {
        // If content type is not 'level', assume it's 'campaign' and proceed with upload
        const ifDataExist = await CampaignConfig.query().where({
          campaign_id: id,
        });
        if (!ifDataExist) {
          const resp = responseWrapper(null, "Campaign not found", 404);
          return res.status(200).json(resp);
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
      if (order === 9 || order === '9') {
        data.button_img = url;
      } else {
        data.image = url;
      }
      const insertedData = await (content_type === "level"
        ? StageConfig.query().insert(data)
        : CampaignConfig.query().insert(data));
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
      if (content_type === "level") {
        ifData = await StageConfig.query().where("id", cid).first();
        if (!ifData) {
          const resp = responseWrapper(null, "stage not found", 404);
          return res.status(200).json(resp);
        }
        level = ifData.level;
      } else {
        ifData = await CampaignConfig.query().where("id", cid).first();
        level = "general";
      }
      const campaign_id = ifData.campaign_id;
      const key = ifData.key;
      if (!ifData) {
        const resp = responseWrapper(null, "campaign data not found", 404);
        return res.status(200).json(resp);
      }

      const url = await uploadHelperTxn("image", req, campaign_id, level, key);
      const updateData = await (content_type === "level"
        ? StageConfig.query().patchAndFetchById(cid, { image: url })
        : CampaignConfig.query().patchAndFetchById(cid, { image: url }));
      const resp = responseWrapper(updateData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      console.log(error);
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
      #swagger.parameters['scantype'] = {in: 'path', required: true, type: 'string', enum:['qr', 'image']}
    */
    try {
      const { campaign_id, scantype } = req.params;
      if (!campaign_id || !scantype) {
        const resp = responseWrapper(
          null,
          "campaign_id and scantype are required",
          400
        );
        return res.status(400).json(resp);
      }

      const campaign = await Campaign.query()
        .where("id", campaign_id)
        .andWhere("scantype", scantype);

      if (!campaign.length) {
        const resp = responseWrapper(
          null,
          "No campaign found with the provided scantype",
          404
        );
        return res.status(200).json(resp);
      }
      const expire = campaign[0].campaign_duration;
      const scanSequence = campaign[0].scan_sequence;

      const campaignData = await generalProductHelper(
        campaign_id,
        scantype,
        expire,
        scanSequence
      );

      if (!campaignData) {
        const resp = responseWrapper(null, "No campaign data found", 404);
        return res.status(404).json(resp);
      }
      campaignData.campaign_duration = expire;
      campaignData.scan_sequence = scanSequence;
      return res.status(200).json(campaignData);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  // /allsignedurls/:campaignid/:scantype
  getSignedUrls: async (req, res) => {
    /* 
      #swagger.tags = ['Game'] 
      #swagger.summary = 'Get all signed urls for campaign with scantype'
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['scantype'] = {in: 'path', required: true, type: 'string', enum: ['qr', 'image'], default: 'qr'}           
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
      const campaign = await Campaign.query().findById(id).first();
      if (!campaign) {
        const resp = responseWrapper(null, "Campaign not found", 404);
        return res.status(200).json(resp);
      }
      if (campaign.status !== "active") {
        const resp = responseWrapper(null, "Campaign is not active", 400);
        return res.status(400).json(resp);
      }
      const expire = campaign.campaign_duration;
      const scanSequence = campaign.scan_sequence;
      const generalData = await generalProductHelper(
        campaign_id,
        scantype,
        expire,
        scanSequence
      );
      const stagesData = await Stage.query().where("campaign_id", campaign.id);

      const stages = {};
      let i = 1;

      for (let stage of stagesData) {
        const stageKey = `stage-${i}`;
        const levelData = await levelHelper(stage.id, stage.campaign_id);
        if (!stages.hasOwnProperty(stageKey)) {
          stages[stageKey] = levelData;
          stages[stageKey].stage_id = stage.id;
          stages[stageKey].campaign_id = stage.campaign_id;
        }
        i += 1;
      }

      stages.total_stages = campaign.total_stages;
      generalData.stages = stages;
      generalData.campaign_duration = campaign.campaign_duration;
      generalData.scan_sequence = campaign.scan_sequence;
      const resp = responseWrapper(generalData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
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

      const productQR = await CampaignConfig.query() //campaign_id, content_type= product, key:Main-QRCode, order =0
        .where("campaign_id", campaign_id)
        .andWhere("order", 0)
        .andWhere("content_type", "product");

      const stages = {
        mainQR: {},
      };

      if (productQR.length > 0) {
        stages.mainQR = productQR[0];
      }
      let i = 1;

      for (let stage of stagesData) {
        const stageKey = `stage-${i}`;
        const levelData = await levelHelper(stage.id, stage.campaign_id);
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
      #swagger.parameters['key'] = {in: 'path', required: true, type: 'string', default: 'ImageScan1'}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'product', enum: ['product', 'product-qr']}
      #swagger.parameters['stage_id'] = {in: 'path', type: 'integer'}
      #swagger.parameters['level'] = {in: 'path', type: 'integer'}
  */
    try {
      const { campaign_id, key, content_type, stage_id, level } = req.params;
      if (!campaign_id || !key || !content_type) {
        const resp = responseWrapper(
          null,
          "please provide all required details",
          400
        );
        return res.status(400).json(resp);
      }
      const ifData = await Stage.query().where("id", stage_id).first();
      if (!ifData) {
        const resp = responseWrapper(null, "Data not found", 204);
        return res.status(400).json(resp);
      }
      const stageLevelOrder = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stage_id)
        .andWhere("content_type", content_type)
        .andWhere("level", level)
        .first();
      if (stageLevelOrder) {
        const resp = responseWrapper(null, "Level content already exist", 400);
        return res.status(400).json(resp);
      }
      if (!req.file) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
      }

      const stageLevel = `${stage_id}/${level}`;
      const imgUrl = await uploadHelperTxn(
        "image",
        req,
        campaign_id,
        stage_id > 0 ? stageLevel : level,
        key
      );
      if (content_type === "product") {
        const image = await loadImage(req.file.buffer);
        const { OfflineCompiler } = await import(
          "../mind-ar-js-master/src/image-target/offline-compiler.js"
        );
        const compiler = new OfflineCompiler();
        await compiler.compileImageTargets([image], console.log);
        const buffer = compiler.exportData();
        const compositeKeyMind = `${key}.mind`;
        const mindUrl = await uploadFile(
          buffer,
          campaign_id,
          stage_id > 0 ? stageLevel : level,
          compositeKeyMind
        );
        // const mindUrl = await uploadHelperTxn('mind', buffer, campaign_id, level, compositeKeyMind);
      }
      const data = {
        campaign_id: parseInt(campaign_id),
        key,
        order: parseInt(level),
        image: imgUrl,
        content_type,
        stage_id: parseInt(stage_id),
        level: parseInt(level),
      };

      const insertData = await StageConfig.query().insert(data);
      const resp = responseWrapper(insertData, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  bulkUpload: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = ' - upload bulk images to campaign'
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['multFiles'] = {
        in: 'formData', 
        description: 'The image file to upload.', 
        required: true, 
        type: 'array',
        collectionFormat: 'multi',
        items: { type: 'file' }
      }
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
      #swagger.parameters['content_type'] = {in: 'path', required: true, type: 'string', default: 'product', enum: ['product', 'product-qr']}
      #swagger.parameters['stage_id'] = {in: 'path', type: 'integer'}
  */
    try {
      const { campaign_id, content_type, stage_id } = req.params;
      if (!campaign_id || !content_type) {
        const resp = responseWrapper(
          null,
          "please provide all required details",
          400
        );
        return res.status(400).json(resp);
      }
      const camp = await Campaign.query().select('scan_sequence').where("id", campaign_id).first();
      if (camp.scan_sequence !== 'random') {
        const resp = responseWrapper(null, "Only random scan sequence campaign is allowed to upload bulk data", 400)
        return res.status(400).json(resp)
      }
      const ifData = await Stage.query().where("id", stage_id).first();
      if (!ifData) {
        const resp = responseWrapper(null, "Data not found", 204);
        return res.status(400).json(resp);
      }
      const levels = [1, 2, 3, 4, 5];
      const stageLevelOrder = await StageConfig.query()
        .where("campaign_id", campaign_id)
        .andWhere("stage_id", stage_id)
        .andWhere("content_type", content_type)
        .whereIn("level", levels)
        .first();
      if (stageLevelOrder) {
        const resp = responseWrapper(null, "content already exist", 400);
        return res.status(400).json(resp);
      }
      if (!req.files) {
        const resp = responseWrapper(null, "No file provided for upload.", 400);
        return res.status(200).json(resp);
      }
      const bufferData = await Promise.all(
        req.files.map(async (file) => {
          const image = await loadImage(file.buffer);
          return image;
        })
      );
      // const image = await loadImage(req.files.buffer);
      const { OfflineCompiler } = await import(
        "../mind-ar-js-master/src/image-target/offline-compiler.js"
      );
      const compiler = new OfflineCompiler();
      await compiler.compileImageTargets(bufferData, console.log);
      const buffer = compiler.exportData();
      const compositeKeyMind = `targets.mind`;

      // const stageLevel = `${stage_id}/${level}`;
      const key = 'ImageScan'
      const imagesUrls = await Promise.all(
        req.files.map(async (file, index) => {
          const imgUrl = await uploadHelperTxn(
            "image",
            {
              file: file,
            },
            campaign_id,
            stage_id,
            `${key}${index + 1}`
            // file.originalname.split(".")[0]
          );
          return imgUrl;
        })
      );
      if (content_type === "product") {
        const mindUrl = await uploadFile(
          buffer,
          campaign_id,
          stage_id,
          compositeKeyMind
        );
        // const mindUrl = await uploadHelperTxn('mind', buffer, campaign_id, level, compositeKeyMind);
      }

      imagesUrls.forEach(async (url, index) => {
        const data = {
          campaign_id: parseInt(campaign_id),
          key: `${key}${index + 1}`,
          order: index + 1,
          image: url,
          content_type,
          stage_id: parseInt(stage_id),
          level: index + 1,
        };
        await StageConfig.query().insert(data);
      }
      );
      const resp = responseWrapper(null, "success", 200);
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

  // for deleting a single stage by id
  deleteStage: async (req, res) => {
    /* 
      #swagger.tags = ['Stage/Level']
      #swagger.summary = ' - delete stage from campaign'
      #swagger.parameters['stage_id'] = {in: 'path', required: true, type: 'integer'}
    */
    try {
      const { stage_id } = req.params;
      if (!stage_id) {
        const resp = responseWrapper(null, "stage_id is required", 400);
        return res.status(400).json(resp);
      }
      const stage = await Stage.query().findById(stage_id).first();
      const total_stages = await Campaign.query()
        .select("total_stages")
        .where("id", stage.campaign_id)
        .first();
      if (!stage) {
        const resp = responseWrapper(null, "Stage not found", 404);
        return res.status(404).json(resp);
      }

      const check = await Stage.transaction(async (trx) => {
        await StageConfig.query(trx).delete().where("stage_id", stage_id);
        await Stage.query(trx).deleteById(stage_id);
        await Campaign.query()
          .update({ total_stages: total_stages.total_stages - 1 })
          .where("id", stage.campaign_id);
      });

      const resp = responseWrapper(null, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },
};
