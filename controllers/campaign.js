const Organization = require('../models/organization');
const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CustData = require('../models/customer_data');
const CampaignUsers = require('../models/campaign_users');
const CMSUsers = require('../models/cmsusers');
const e = require('express');

module.exports = {
    createOrganization: async (req, res) => {
        try {
            const { name, logo, description } = req.body;
            if (!name || !logo || !description) {
                return res.status(400).json({ error: 'name, logo and description are required' });
            }
            const ifOrganizationExists = await Organization.query().findOne({ name });
            if (ifOrganizationExists) {
                return res.status(400).json({ error: 'Organization already exists' });
            }
            const organization = await Organization.query().insert(req.body);
            res.status(201).json(organization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignById: async (req, res) => {
        try {
            const { campaignid } = req.params;
            if (!campaignid) {
                return res.status(400).json({ error: 'campaign id is required' });
            }
            let totalStages = await Campaign.query().where('id', campaignid).select('total_stages');
            
            res.status(200).json(totalStages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // helper function
    getCampaignTxn: async (usertype = 'user', emailid, orgid = null) => {
        try {
            switch (usertype) {
                case 'superadmin':
                    const superAdminCampaigns = await Campaign.query().where('organization_id', orgid);
                    return superAdminCampaigns;
                case 'admin':
                case 'user':
                    const userCampaigns = await Campaign.query().where('email', emailid);
                    return res.status(200).json(userCampaigns);
                default:
                    return res.status(400).json({ error: 'Invalid usertype' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignByEmailUser: async (req, res) => {
        try {
            const { emailid, usertype, orgid } = req.params;
            if (!emailid || !usertype) {
                return res.status(400).json({ error: 'emailid, usertype and organization_id are required' });
            }
            const campaigns = await getCampaignTxn(usertype, emailid, orgid);
            // res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCampaignByEmail: async (req, res) => {
        try {
            const { emailid } = req.params;
            if (!emailid || !usertype) {
                return res.status(400).json({ error: 'emailid required' });
            }
            const campaigns = await getCampaignTxn(usertype, emailid, orgid);
            // res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateCampaignById: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, scantype } = req.body;
            if (!name || !logo || !description) {
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

    deleteCampaignByName: async (req, res) => {
        try {
            const { campaign_name } = req.params;

            // Check if organization ID is provided
            if (!campaign_name) {
                return res.status(400).json({ error: 'Campaign name is required' });
            }

            const campaign = await deleteCampaignTxn(null, campaign_name);
            if (campaign.operation) {
                console.log(campaign.msg);
                return res.status(200).json(campaign);
            } else {
                console.log(campaign.msg);
                return res.status(500).json({ error: campaign.error });
            }

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    deleteCampaignById: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if organization ID is provided
            if (!id) {
                return res.status(400).json({ error: 'Campaign ID is required' });
            }

            const campaign = await deleteCampaignTxn(id, null);
            if (campaign.operation) {
                console.log(campaign.msg);
                return res.status(200).json(campaign);
            } else {
                console.log(campaign.msg);
                return res.status(500).json({ error: campaign.error });
            }

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

}
