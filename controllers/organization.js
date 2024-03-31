const Organization = require('../models/organization');
const Campaign = require('../models/campaign');
const CampaignConfig = require('../models/campaign_config');
const CustData = require('../models/customer_data');
const CampaignUsers = require('../models/campaign_users');
const CMSUsers = require('../models/cmsusers');

module.exports = {
    createOrganization: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - Create a new organization'
           #swagger.parameters['body'] = {
                in: 'body',
                description: 'to create a new organization',
                schema: {
                    $name: 'Bata',
                    $logo: '#',
                    $description: 'description...'
                }
            }
        */
        try {
            const { name, logo, description } = req.body;
            console.log(req.body)
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

    getOrganizationsByEmailUser: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - Get all organizations by email and usertype'
        */
        try {
            const { email, usertype } = req.params;
            if (!email || !usertype) {
                return res.status(400).json({ error: 'email and usertype both required' });
            }
            let organizations;
            switch (usertype) {
                case 'superadmin':
                    organizations = await Organization.query();
                    break;
                case 'admin':
                case 'user':
                    organizations = await CMSUsers.query()
                        .findOne({ email })
                        .withGraphFetched('organization');
                    if (!organizations) {
                        return res.status(404).json({ error: 'User not found' });
                    }
                    organizations = organizations.organization;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid usertype' });
            }
            res.status(200).json(organizations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrganizationById: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - Get all organizations by organization id'
        */
        try {
            const { id } = req.params;
            // const { name } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'name is required' });
            }
            const organization = await Organization.query().findOne({ id });
            // const organization = await Organization.query().findOne({ name });
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.status(200).json(organization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateOrganizationByName: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - update organization by organization name'
        */
        try {
            const { id } = req.params;
            const { name, logo, description } = req.body;
            if (!name || !logo || !description) {
                return res.status(400).json({ error: 'name, logo and description are required' });
            }
            const organization = await Organization.query().findById(id);
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            const updatedOrganization = await organization.$query().patchAndFetch(req.body);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteOrganizationById: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - delete organization by organization id'
        */
        try {
            const { organization_name } = req.params;
            // const { id } = req.params;

            // Check if organization ID is provided
            if (!organization_name) {
                return res.status(400).json({ error: 'Organization ID is required' });
            }

            // Fetch organization details to retrieve its name for S3 deletion
            const organization = await Organization.query().where('name', organization_name).first();
            // const organization = await Organization.query().where('id', id);
            if (!organization) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            // Begin transaction
            await Organization.transaction(async (trx) => {
                // Delete organization and related data
                await Organization.query(trx).deleteById(organization.id);
                await Campaign.query(trx).delete().where('organization_id', organization.id);
                await CampaignConfig.query(trx).delete().whereIn('campaign_id', function () {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CustData.query(trx).delete().whereIn('campaign_id', function () {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CampaignUsers.query(trx).delete().whereIn('campaign_id', function () {
                    this.select('campaign_id').from('campaign').where('organization_id', organization.id);
                });
                await CMSUsers.query(trx).delete().where('organization_id', organization.id);
            });

            return res.status(200).send('Organization data deletion completed successfully.');
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // /users_by_organization/:organization
    getUsersByOrganization: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - Get all users with organizations and its campaign'
        */
        try {
            const { orgid } = req.params;
            if (!orgid) {
                return res.status(400).json({ error: 'Organization name is required' });
            }
            // Fetch users from CMSUsers model filtered by organization
            const users = await await CMSUsers.query()
                .where('organization_id', orgid)
                .withGraphFetched('campaign')
                .modifiers({
                    campaigns(query) {
                        query.select('id', 'campaign_name');
                    }
                });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /api/users_by_organization/:organization
    getAssociatedUserOfOrganization: async (req, res) => {
        /* #swagger.tags = ['organization']
           #swagger.summary = ' - Get all users by organization name with its associated campaigns'
        */
        try {
            const { orgid } = req.params;
            if (!orgid) {
                return res.status(400).json({ error: 'Organization name is required' });
            }
            // Fetch users from CMSUsers model filtered by organization
            const users = await await CMSUsers.query()
                .withGraphFetched('campaign')
                .modifiers({
                    campaigns(query) {
                        query.join('campaign_users', 'campaign_users.email', 'cmsusers.email')
                            .join('campaign', 'campaign.id', 'campaign_users.campaign_id')
                            .where('campaign.organization_id', orgid)
                            .select('campaign.campaign_id', 'campaign.name');
                    }
                })
                .where('cmsusers.organization', your_organization_parameter);

            // Fetch associated campaigns for each user
            for (const user of users) {
                user.campaigns = await CampaignUsers.query().where('emailid', user.emailid)
                    .withGraphJoined('campaign');
            }
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


}
