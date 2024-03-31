const Organization = require("../models/organization");
const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CustData = require("../models/customer_data");
const CampaignUsers = require("../models/campaign_users");
const CMSUsers = require("../models/cmsusers");

module.exports = {
    createOrganization: async (req, res) => {
        /* #swagger.tags = ['Organization']
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
            console.log(req.body);
            if (!name || !logo || !description) {
                return res
                    .status(400)
                    .json({ error: "name, logo and description are required" });
            }
            const ifOrganizationExists = await Organization.query().findOne({ name });
            if (ifOrganizationExists) {
                return res.status(400).json({ error: "Organization already exists" });
            }
            const organization = await Organization.query().insert(req.body);
            res.status(201).json(organization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrganizationsByEmailUser: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all organizations by email and usertype'
               #swagger.parameters['usertype'] = {in: 'path', required: true, type: 'string', enum: ['superadmin', 'admin', 'user']}
            */
        try {
            const { email, usertype } = req.params;
            if (!email || !usertype) {
                return res
                    .status(400)
                    .json({ error: "email and usertype both required" });
            }
            let organizations;
            switch (usertype) {
                case "superadmin":
                    organizations = await Organization.query();
                    break;
                case "admin":
                case "user":
                    organizations = await CMSUsers.query()
                        .findOne({ email })
                        .withGraphFetched("organization");
                    if (!organizations) {
                        return res.status(404).json({ error: "User not found" });
                    }
                    organizations = organizations.organization;
                    break;
                default:
                    return res.status(400).json({ error: "Invalid usertype" });
            }
            res.status(200).json(organizations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getOrganizationById: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all organizations by organization id'
               #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
            */
        try {
            const { id } = req.params;
            // const { name } = req.params;
            if (!id) {
                return res.status(400).json({ error: "name is required" });
            }
            const organization = await Organization.query().findOne({ id });
            // const organization = await Organization.query().findOne({ name });
            if (!organization) {
                return res.status(404).json({ error: "Organization not found" });
            }
            res.status(200).json(organization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateOrganizationById: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - update organization by organization name'
               #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
               #swagger.parameters['body'] = {
                    in: 'body',
                    description: 'to update organization',
                    schema: {
                        $name: 'string',
                        $logo: 'url here',
                        $description: 'description...'
                    }
                }
            */
        try {
            const { id } = req.params;
            const { name, logo, description } = req.body;
            if (!name || !logo || !description) {
                return res
                    .status(400)
                    .json({ error: "name, logo and description are required" });
            }
            const organization = await Organization.query().findById(id);
            if (!organization) {
                return res.status(404).json({ error: "Organization not found" });
            }
            const updatedOrganization = await organization
                .$query()
                .patchAndFetch(req.body);
            res.status(200).json(updatedOrganization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteOrganizationById: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - delete organization by organization id'
               #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
            */
        try {
            const { id } = req.params;
            // const { id } = req.params;

            // Check if organization ID is provided
            if (!id) {
                return res.status(400).json({ error: "Organization ID is required" });
            }

            // Fetch organization details to retrieve its name for S3 deletion
            const organization = await Organization.query().findById(id).first();
            // const organization = await Organization.query().where('id', id);
            if (!organization) {
                return res.status(404).json({ error: "Organization not found" });
            }

            // Begin transaction
            await Organization.transaction(async (trx) => {
                // Delete organization and related data
                await Organization.query(trx).deleteById(id);
                await Campaign.query(trx).delete().where("organization_id", id);
                await CampaignConfig.query(trx)
                    .delete()
                    .whereIn("campaign_id", function () {
                        this.select("campaign_id")
                            .from("campaign")
                            .where("organization_id", id);
                    });
                await CustData.query(trx)
                    .delete()
                    .whereIn("campaign_id", function () {
                        this.select("campaign_id")
                            .from("campaign")
                            .where("organization_id", id);
                    });
                await CampaignUsers.query(trx)
                    .delete()
                    .whereIn("campaign_id", function () {
                        this.select("campaign_id")
                            .from("campaign")
                            .where("organization_id", id);
                    });
                await CMSUsers.query(trx).delete().where("organization_id", id);
            });

            return res
                .status(200)
                .send("Organization data deletion completed successfully.");
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // /users_by_organization/:organization
    // need work here
    getUsersByOrganization: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all users with organizations and its campaign'
               #swagger.parameters['orgid'] = {in: 'path', required: true, type: 'integer'}
            */
        try {
            const { orgid } = req.params;
            if (!orgid) {
                return res.status(400).json({ error: "Organization name is required" });
            }
            // Fetch users from CMSUsers model filtered by organization
            // const users = await CMSUsers.query()
            //     .where('organization_id', orgid)
            //     .withGraphFetched('campaign')
            //     .modifiers({
            //         campaign(query) {
            //             query.select('id', 'name');
            //         }
            //     });
            const campData = await Campaign.query().where("organization_id", orgid);
            const cmsData = await CMSUsers.query().where("organization_id", orgid);
            const campUser = await CampaignUsers.query().whereIn(
                "campaign_id",
                campData.map((camp) => camp.id)
            );
            const campUserEmails = campUser.map((camp) => camp.emailid);
            console.log(campData, cmsData, campUser, campUserEmails);
            res.status(200).json(campUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // /api/users_by_organization/:organization
    // need work here
    getAssociatedUserOfOrganization: async (req, res) => {
        /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all users by organization name with its associated campaigns'
               #swagger.parameters['orgid'] = {in: 'path', required: true, type: 'integer'}
            */
        try {
            const { orgid } = req.params;
            console.log("UUUUUUUUUU");
            if (!orgid) {
                return res.status(400).json({ error: "Organization name is required" });
            }
            // Fetch users from CMSUsers model filtered by organization
            const users = await CMSUsers.query()
                .withGraphFetched("campaigns")
                .modifiers({
                    campaigns(query) {
                        query
                            .join("campaign_users", "campaign_users.email", "cmsusers.email")
                            .join("campaign", "campaign.id", "campaign_users.campaign_id")
                            .where("campaign.organization_id", orgid)
                            .select("campaign.campaign_id", "campaign.name");
                    },
                })
                .where("cmsusers.organization", your_organization_parameter);

            // Fetch associated campaigns for each user
            for (const user of users) {
                user.campaigns = await CampaignUsers.query()
                    .where("emailid", user.emailid)
                    .withGraphJoined("campaign");
            }
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
