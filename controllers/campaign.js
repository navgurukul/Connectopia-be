const Organization = require('../models/organization');
const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CustData = require('../models/custdata');
const CampaignUsers = require('../models/campaign_users');
const CMSUsers = require('../models/cmsusers');

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

    getOrganizationByName: async (req, res) => {
        try {
            const { name } = req.params;
            if (!name) {
                return res.status(400).json({ error: 'name is required' });
            }
            const organization = await Organization.query().findOne({ name });
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.status(200).json(organization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateOrganizationById: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, logo, description } = req.body;
            if (!name || !logo || !description) {
                return res.status(400).json({ error: 'name, logo and description are required' });
            }
            const organization = await (id ? Organization.query().findById(id) : Organization.query().where('name', name))
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            const updatedOrganization = await organization.$query().patchAndFetch(req.body);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteOrganizationByIdOrName: async (req, res) => {
        try {
            const { organization_name } = req.params;

            // Check if organization ID is provided
            if (!organization_name) {
                return res.status(400).json({ error: 'Organization ID is required' });
            }

            // Fetch organization details to retrieve its name for S3 deletion
            const organization = await Organization.query().where('name', organization_name).first();
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            // Begin transaction
            await Organization.transaction(async (trx) => {
                // Delete organization and related data
                await Organization.query(trx).deleteById(organization.id);
                await Campaign.query(trx).delete().where('organization_id', organization.id);
                await CampaignConfig.query(trx).delete().whereIn('campaign_id', function() {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CustData.query(trx).delete().whereIn('campaign_id', function() {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CampaignUsers.query(trx).delete().whereIn('campaign_id', function() {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CMSUsers.query(trx).delete().where('organization_id', organization.id);
            });

            return res.status(200).send('Organization data deletion completed successfully.');
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

}
