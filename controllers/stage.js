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
    uploadStageLevelGraphics: async (req, res) => {
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
        if (type === 'gif') {
            fileExtension = 'gif';
        } 
            
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
        return url;
    },

    // update for uper wala
    updateStageLevelGraphics: async (req, res) => {
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
            const url = await uploadHelperTxn('gif', req, campaign_id, level, compositeKey);
            console.log(url, '*******');
            req.body.image = url;
            const updateData = StageConfig.query().update(req.body);

            res.status(200).json(updateData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

}
