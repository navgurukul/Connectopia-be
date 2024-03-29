const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CampaignUsers = require('../models/campaign_users');
const StageConfig = require('../models/stage_config');
const CMSUsers = require('../models/cmsusers');
const { uploadFile } = require('./awsS3');

module.exports = {
    // progress
    uploadStageLevelGraphics: async (req, res) => {
        try {
            //:campaign_id/:level/:key/:scantype
            const { campaign_id, level, key, scantype, order } = req.body;
            if (!campaign_id || !level || !key || !scantype) {
                return res.status(400).json({ error: 'campaign_id, level, key and scantype are required' });
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
            let fileExtension;
            switch (req.file.mimetype) {
                case "image/gif": fileExtension = "gif"; break;
                default: return res.status(400).send('Unsupported file type.');
            }
            const compositeKey = `${Key}.${fileExtension}`;
            const url = await uploadFile(req.file.buffer, campaign_id, level, compositeKey);
            console.log(url, '*******');
            req.body.image_key = compositeKey;
            const insertData = StageConfig.query().insert(req.body);

            res.status(200).json(insertData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

}
