const { loadImage } = require('canvas');

const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CampaignUsers = require('../models/campaign_users');
const StageConfig = require('../models/stage_config');
const CMSUsers = require('../models/cmsusers');
const { uploadFile } = require('./awsS3');


// helper function
const uploadHelperTxn = async (type, req, campaign_id, level, key) => {
    let fileExtension;
    switch (req.file.mimetype) {
        case "image/gif": fileExtension = "gif"; break;
        case "image/jpeg": fileExtension = "jpeg"; break;
        case "image/jpg": fileExtension = "jpg"; break;
        case "image/png": fileExtension = "png"; break;
        case "image/svg+xml": fileExtension = "svg"; break;
        default: return res.status(400).send('Unsupported file type.');
    }
    // const compositeKey = `${req.file.originalname}/${key}.${fileExtension}`;
    const compositeKey = `${key}.${fileExtension}`;
    const url = await uploadFile(req.file.buffer, campaign_id, level, compositeKey);
    return url;
}

module.exports = {
    // progress
    /**
     DOUBTS :
     1. how to confirm that api get called for general content or level content
     2. 
     */
    uploadGraphics: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - upload gif to campaign'
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
           #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $level: 1,
                $key: 'string',
                $scantype: 'string (qr or image)',
                $order: 1
            }
         }
        */
        try {
            //:campaign_id/:level/:key/:scantype
            const { campaign_id } = req.params;
            const { level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({ campaign_id });
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            const url = await uploadHelperTxn('gif', req, campaign_id, level, compositeKey);
            req.body.image = url;
            const insertData = StageConfig.query().insert(req.body);

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // update for uper wala
    updateGraphics: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - update gif to campaign'
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
           #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                $level: 1,
                $key: 'string',
                $scantype: 'string (qr or image)',
                $order: 1
            }
         }
        */
        try {
            const { campaign_id } = req.params;
            const { level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({ campaign_id });
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            const url = await uploadHelperTxn('gif', req, campaign_id, level, key);
            req.body.image = url;
            const updateData = StageConfig.query().update(req.body);

            res.status(200).json(updateData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /uploadimage/:campaignid/:pageno/:key/:scantype
    uploadImageToCampaign: async (req, res) => {
        /* 
            #swagger.tags = ['Stage/Level']
            #swagger.summary = 'Upload image to campaign'
            #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
            #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
            #swagger.parameters['level'] = {in: 'path', type: 'integer'}
            #swagger.parameters['stage_number'] = {in: 'path', type: 'integer'}
            #swagger.parameters['order'] = {in: 'path', required: true, type: 'integer'}

        */
        try {
            const { campaign_id, content_type, level, key, order, stage_number } = req.params;
            const id = parseInt(campaign_id)

            // Check if required parameters are missing
            if (!campaign_id || !level || !key || !order || !content_type) {
                return res.status(400).json({ error: 'Please provide all required details' });
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
                key,
            };
            // Check if the provided content type is 'level' and handle accordingly
            if (content_type === 'level') {
                const ifDataExist = await StageConfig.query().where({ campaign_id: id });
                if (!ifDataExist) {
                    return res.status(404).json({ error: 'Stage not found' });
                }
                data.level = parseInt(level);
                data.stage_number = parseInt(stage_number);
            } else {
                // If content type is not 'level', assume it's 'campaign' and proceed with upload
                const ifDataExist = await CampaignConfig.query().where({ campaign_id: id });
                if (!ifDataExist) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }
            }

            // Perform the file upload and insertion of data
            const url = await uploadHelperTxn('image', req, campaign_id, level, key);
            data.image = url.image;

            const insertedData = await (content_type === 'level' ? StageConfig.query().insert(data) : CampaignConfig.query().insert(data));
            res.status(200).json(insertedData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /updateimage/:campaignid/:pageno/:key/:scantype
    updateImageToCampaign: async (req, res) => {
        /* 
            #swagger.tags = ['Stage/Level']
            #swagger.summary = 'Update image to campaign'
            #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
            #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
        */
        try {
            const { id, content_type } = req.params;
            const cid = parseInt(id);
            if (!id || !content_type) {
                return res.status(400).json({ error: 'please content ID' });
            }
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }

            let ifData;
            let level;
            if (content_type === 'level') {
                ifData = await StageConfig.query().where('id', cid).first();
                if (!ifData) {
                    return res.status(404).json({ error: 'Stage not found' });
                }
                level = ifData.level;
            } else {
                ifData = await CampaignConfig.query().where('id', cid).first();
                level = 'general';

            }
            const campaign_id = ifData.campaign_id;
            const key = ifData.key;
            if (!ifData) {
                return res.status(404).json({ error: 'Campaign not found' });
            }

            const url = await uploadHelperTxn('image', req, campaign_id, level, key);
            const updateData = await (content_type === 'level' ? StageConfig.query().patchAndFetchById(cid, { image: url.image }) : CampaignConfig.query().patchAndFetchById(cid, { image: url.image }));
            res.status(200).json(updateData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /allsignedurls/:campaignid/:scantype
    getSignedUrl: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - get all signed urls for campaign with scantype'
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['scantype'] = {in: 'path', required: true, type: 'string', enum: ['qr', 'image']}           
        */
        try {
            const { campaign_id, scantype } = req.params;
            if (!campaign_id || !scantype) {
                return res.status(400).json({ error: 'campaign_id and scantype are required' });
            }
            const campaign = await Campaign.query().select('status').findById({ campaign_id }).first();
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (campaign.status !== 'active') {
                return res.status(400).json({ error: 'Campaign is not active' });
            }
            const productData = await CampaignConfig.query().where({ campaign_id, scantype, content_type: 'product' });
            res.status(200).json(productData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /withoutStatus/allsignedurls/:campaignid/:scantype
    getSignedUrlWithoutStatus: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - get all signed urls for campaign without status'
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['scantype'] = { in: 'query', type: 'string', enum: ['qr', 'image'],}           
        */
        try {
            const { campaign_id, scantype } = req.params;
            if (!campaign_id || !scantype) {
                return res.status(400).json({ error: 'campaign_id and scantype are required' });
            }
            const productData = await CampaignConfig.query().where({ campaign_id, scantype, content_type: 'general' });
            res.status(200).json(productData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /compile-upload/:campaignid/:pageno/:Key/:scantype
    uploadMind: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - upload mind file to campaign'
           #swagger.consumes = ['multipart/form-data']
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['image'] = {in: 'formData', description: 'The image file to upload.', required: true, type: 'file'}
           #swagger.parameters['body'] = {
                in: 'body',
                description: 'Create a new Campaign',
                schema: {
                    $level: 1,
                    $key: 'string',
                    $scantype: 'qr or image'
                }
         }
        */
        try {
            const { campaign_id } = req.params;
            const { level, key, scantype } = req.body;
            if (!campaign_id || !level || !key || !scantype) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({ campaign_id });
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            const image = await loadImage(req.file.buffer);
            const { OfflineCompiler } = await import('./mind-ar-js-master/src/image-target/offline-compiler.js');
            const compiler = new OfflineCompiler();
            await compiler.compileImageTargets([image], console.log);
            const buffer = compiler.exportData();
            const compositeKeyMind = `${key}.mind`;
            const originalImageExtension = req.file.originalname.split('.').pop();
            const compositeKeyImage = `${key}.${originalImageExtension}`;

            const url = await uploadHelperTxn('mind', req, campaign_id, level, key);
            req.body.image = url;
            const insertData = StageConfig.query().insert(req.body);

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /delete-image/:campaignid/:pageno/:key
    deleteImage: async (req, res) => {
        /* #swagger.tags = ['Stage/Level']
           #swagger.summary = ' - delete image from campaign'
           #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
           #swagger.parameters['level'] = {in: 'path', required: true, type: 'integer', enum: [1, 2, 3, 4, 5]}
        */
        try {
            const { campaign_id, level, key } = req.params;
            if (!campaign_id || !level || !key) {
                return res.status(400).json({ error: 'campaign_id, level and key are required' });
            }
            const campaign = await CampaignConfig.query().findById({ campaign_id });
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            const deleteData = await StageConfig.query().delete().where({ campaign_id, level, key });
            res.status(200).json(deleteData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

}
