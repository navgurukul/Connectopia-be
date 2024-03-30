const { loadImage } = require('canvas');

const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CampaignUsers = require('../models/campaign_users');
const StageConfig = require('../models/stage_config');
const CMSUsers = require('../models/cmsusers');
const { uploadFile } = require('./awsS3');

module.exports = {
    // progress
    /**
     DOUBTS :
     1. how to confirm that api get called for general content or level content
     2. 
     */
    uploadGraphics: async (req, res) => {
        try {
            //:campaign_id/:level/:key/:scantype
            const { campaign_id } = req.params;
            const { level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({campaign_id});
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            console.log(req.file, '---->from uploadCampaignGraphics');
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            const url = await uploadHelperTxn('gif', req, campaign_id, level, compositeKey);
            console.log(url, '*******');
            req.body.image = url;
            const insertData = StageConfig.query().insert(req.body);

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // helper function
    uploadHelperTxn: async (type, req, campaign_id, level, key) => {
        let fileExtension;
        // if (type === 'gif') {
        //     fileExtension = 'gif';
        // } 
            
        switch (req.file.mimetype) {
            case "image/gif": fileExtension = "gif"; break;
            case "image/jpeg": fileExtension = "jpeg"; break;
            case "image/jpg": fileExtension = "jpg"; break;
            case "image/png": fileExtension = "png"; break;
            case "image/svg+xml": fileExtension = "svg"; break;
            default: return res.status(400).send('Unsupported file type.');
        }
        const compositeKey = `${key}.${fileExtension}`;
        const url = await uploadFile(req.file.buffer, campaign_id, level, compositeKey);
        console.log(url, '((()()()()()()()(')
        return url.image.url;
    },

    // update for uper wala
    updateGraphics: async (req, res) => {
        try {
            const { campaign_id } = req.params;
            const { level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({campaign_id});
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            const url = await uploadHelperTxn('gif', req, campaign_id, level, key);
            console.log(url, '*******');
            req.body.image = url;
            const updateData = StageConfig.query().update(req.body);

            res.status(200).json(updateData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /uploadimage/:campaignid/:pageno/:key/:scantype
    uploadImageToCampaign: async (req, res) => {
        try {
            const { campaign_id } = req.params;
            const { content_type, level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order || content_type) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            let ifDataExist;
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            
            if (content_type === 'level') {
                ifDataExist = await StageConfig.query().findById({campaign_id});
                if (!ifDataExist) {
                    return res.status(404).json({ error: 'Stage not found' });
                }
                // progress
                // return res.status(400).json({ error: 'please provide valid content type' });
            }
            ifDataExist = await CampaignConfig.query().findById({campaign_id});
            if (!ifDataExist) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            
            const url = await uploadHelperTxn('image', req, campaign_id, level, key);
            console.log(url, '*******');
            req.body.image = url;

            const insertData = await (content_type === 'level' ? StageConfig.query().insert(req.body) : CampaignConfig.query().insert(req.body));

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /updateimage/:campaignid/:pageno/:key/:scantype
    updateImageToCampaign: async (req, res) => {
        try {
            const { campaign_id } = req.params;
            const { content_type, level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype || !order || content_type) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            let ifDataExist;
            if (!req.file) {
                return res.status(400).json({
                    msg: "No file provided for upload.",
                });
            }
            
            if (content_type === 'level') {
                ifDataExist = await StageConfig.query().findById({campaign_id});
                if (!ifDataExist) {
                    return res.status(404).json({ error: 'Stage not found' });
                }
                // progress
                // return res.status(400).json({ error: 'please provide valid content type' });
            }
            ifDataExist = await CampaignConfig.query().findById({campaign_id});
            if (!ifDataExist) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            
            const url = await uploadHelperTxn('image', req, campaign_id, level, key);
            console.log(url, '*******');
            req.body.image = url;

            const updateData = await (content_type === 'level' ? StageConfig.query().update(req.body) : CampaignConfig.query().update(req.body));

            res.status(200).json(updateData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /allsignedurls/:campaignid/:scantype
    getSignedUrl: async (req, res) => {
        try {
            const { campaign_id, scantype } = req.params;
            if (!campaign_id || !scantype) {
                return res.status(400).json({ error: 'campaign_id and scantype are required' });
            }
            const campaign = await Campaign.query().select('status').findById({campaign_id}).first();
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            if (campaign.status !== 'active') {
                return res.status(400).json({ error: 'Campaign is not active' });
            }
            const productData = await CampaignConfig.query().where({campaign_id, scantype, content_type: 'product'});
            res.status(200).json(productData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // /withoutStatus/allsignedurls/:campaignid/:scantype
    getSignedUrlWithoutStatus: async (req, res) => {
        try {
            const { campaign_id, scantype } = req.params;
            if (!campaign_id || !scantype) {
                return res.status(400).json({ error: 'campaign_id and scantype are required' });
            }
            const productData = await CampaignConfig.query().where({campaign_id, scantype, content_type: 'general'});
            res.status(200).json(productData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /compile-upload/:campaignid/:pageno/:Key/:scantype
    uploadMind: async (req, res) => {
        try {
            const { campaign_id } = req.params;
            const { level, key, scantype } = req.body;
            if (!campaign_id || !level || !key || !scantype ) {
                return res.status(400).json({ error: 'please provide all required details' });
            }
            const campaign = await CampaignConfig.query().findById({campaign_id});
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
            console.log(url, '*******');
            req.body.image = url;
            const insertData = StageConfig.query().insert(req.body);

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /delete-image/:campaignid/:pageno/:key
    deleteImage: async (req, res) => {
        try {
            const { campaign_id, level, key } = req.params;
            if (!campaign_id || !level || !key) {
                return res.status(400).json({ error: 'campaign_id, level and key are required' });
            }
            const campaign = await CampaignConfig.query().findById({campaign_id});
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            const deleteData = await StageConfig.query().delete().where({campaign_id, level, key});
            res.status(200).json(deleteData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

}
