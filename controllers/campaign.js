const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CampaignUsers = require('../models/campaign_users');
const StageConfig = require('../models/stage_config');
const CMSUsers = require('../models/cmsusers');

// helper function
const getCampaignTxn = async (usertype = 'user', emailid, orgid = null) => {
    try {
        switch (usertype) {
            case 'superadmin':
                const superAdminCampaigns = await Campaign.query().where('organization_id', orgid);
                return superAdminCampaigns;
            case 'admin':
            case 'user':
                const userCampaigns = await Campaign.query().where('email', emailid);
                return userCampaigns;
            default:
                return { error: 'Invalid usertype' };
        }
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    // progress
    createCampaign: async (req, res) => {
        try {
            const { organization_id, name, startdate, enddate, description, scantype, usertype, email, campaign_duration, total_stages, scan_sequence } = req.body;
            if (!organization_id) {
                return res.status(400).json({ error: 'fill out proper data' });
            }
            const ifCampaignExists = await Campaign.query().findOne({ name });
            if (ifCampaignExists) {
                return res.status(400).json({ error: `Campaign -${name}- already exists` });
            }
            const campaign = await Campaign.query().insert(req.body);
            res.status(201).json(campaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignById: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'campaign id is required' });
            }
            let totalStages = await Campaign.query().where('id', id).select('total_stages');

            res.status(200).json(totalStages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignByEmailUser: async (req, res) => {
        try {
            const { email, usertype, orgid } = req.params;
            if (!email || !usertype) {
                return res.status(400).json({ error: 'emailid, usertype and organization_id are required' });
            }
            const campaigns = await getCampaignTxn(usertype, email, orgid);
            res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignByEmail: async (req, res) => {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ error: 'email required' });
            }
            const campaigns = await getCampaignTxn('user', email, null);
            res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateCampaignById: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, email, campaign_duration, total_stages, startdate, enddate, scantype, status, scan_sequence, organization_id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'campaign id is required' });
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(id, req.body);
            res.status(200).json(updatedCampaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // progress se delete pending
    deleteCampaignTxn: async (id, name = null) => {
        try {
            if (!campaign_name || !id) {
                return res.status(400).json({ error: 'Campaign ID or name is required' });
            }
            const campaign = await (id ? Campaign.query().findById(id) : Campaign.query().where('name', name).first());
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            await Campaign.transaction(async (trx) => {
                await CampaignConfig.query(trx).delete().where('campaign_id', campaign.id);
                await CampaignUsers.query(trx).delete().where('campaign_id', campaign.id);
                await Campaign.query(trx).delete().where('id', campaign.id);
            });
            return {
                msg: 'Campaign data deletion completed successfully.',
                operation: true
            };
        } catch (error) {
            return {
                msg: 'Campaign data deletion failed.',
                operation: false,
                error: error.message
            };
        }
    },

    deleteCampaignById: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'Campaign ID is required' });
            }

            const campaignData = await Campaign.query().findById(id);
            if (!campaignData) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            const check = await Campaign.transaction(async (trx) => {
                await CampaignConfig.query(trx).delete().where('campaign_id', campaignData.id);
                await CampaignUsers.query(trx).delete().where('campaign_id', campaignData.id);
                await StageConfig.query(trx).delete().where('campaign_id', campaignData.id);
                await Campaign.query(trx).delete().where('id', campaignData.id);
            });
            console.log(check)
            return res.status(200).json({ msg: "Campaign deleted successfully" });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error.message });
        }
    },

    // setStatus
    setStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!id || !status) {
                return res.status(400).json({ error: 'campaign id and status are required' });
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                return res.status(404).json({ error: 'Campaign not found' });
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(id, { status });
            res.status(200).json(updatedCampaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // nextCampaignId
    genNextCampaignId: async (req, res) => {
        try {
            const lastCampaign = await Campaign.query().orderBy('id', 'desc').first();
            if (!lastCampaign) {
                console.log('No campaign found ID 1 will be generated. ⚠️');
                return res.status(200).json({ id: 1 });
            }
            res.status(200).json({ id: lastCampaign.id + 1 });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
}
