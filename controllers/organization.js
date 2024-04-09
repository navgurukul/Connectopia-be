const Organization = require("../models/organization");
const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CustData = require("../models/customer_data");
const CampaignUsers = require("../models/campaign_users");
const CMSUsers = require("../models/cmsusers");
const StageConfig = require("../models/stage_config");
const responseWrapper = require("../helpers/responseWrapper");

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

      if (!name || !logo || !description) {
        const resp = responseWrapper(null, "Name, logo, and description are required", 400);
        return res.status(400).json(resp);
      }

      const existingOrganization = await Organization.query().findOne({ name });
      if (existingOrganization) {
        const resp = responseWrapper(null, "Organization already exists", 302);
        return res.status(302).json(resp);
      }

      const organization = await Organization.query().insert(req.body);
      const resp = responseWrapper(organization, "Success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      console.error("Error creating organization:", error);
      const resp = responseWrapper(null, "Internal server error", 500);
      return res.status(500).json(resp);
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
        const resp = responseWrapper(null, "email and usertype both required", 400);
        return res.status(400).json(resp);
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
            const resp = responseWrapper(null, "User not found", 204);
            return res.status(200).json(resp);
          }
          organizations = organizations.organization;
          break;
        default:
          const resp = responseWrapper(null, "Invalid usertype", 400);
          return res.status(400).json(resp);
      }
      const resp = responseWrapper(organizations, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  getCampaignAndUserByOrganizationId: async (req, res) => {
    /* #swagger.tags = ['Organization']
       #swagger.summary = ' - Get all organizations by organization id'
       #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
    */
    try {
      const { id } = req.params;

      if (!id) {
        const resp = responseWrapper(null, "ID is required", 400);
        return res.status(400).json(resp);
      }

      const isOrganizationExists = await Organization.query().findById(id);
      if (!isOrganizationExists) {
        const resp = responseWrapper(null, "organization not found", 204);
        return res.status(200).json(resp);
      }
      // Retrieve campaigns by organization ID
      const campaigns = await Campaign.query().where("organization_id", id);
      if (!campaigns || campaigns.length === 0) {
        const resp = responseWrapper(null, "No campaigns found for the organization", 204);
        return res.status(200).json(resp);
      }

      // Retrieve CMS users by organization ID
      const cmsUsers = await CMSUsers.query().where("organization_id", id);

      // Retrieve CampaignUser records based on campaigns and CMS users
      const campaignIds = campaigns.map((campaign) => campaign.id);
      const userEmails = cmsUsers.map((user) => user.email);

      const campaignUsers = await CampaignUsers.query()
        .whereIn("campaign_id", campaignIds)
        .whereIn("email", userEmails);

      // Retrieve organization_id and usertype from CMSUsers
      const userMap = new Map(
        cmsUsers.map((user) => [
          user.email,
          { organization_id: user.organization_id, usertype: user.usertype },
        ])
      );

      // Map users to campaigns
      const campaignsWithUsers = campaigns.map((campaign) => {
        const users = campaignUsers
          .filter((user) => user.campaign_id === campaign.id)
          .map((user) => {
            const { organization_id, usertype } = userMap.get(user.email);
            return { ...user, organization_id, usertype };
          });
        campaign.users = users;
        return campaign;
      });

      const resp = responseWrapper(campaignsWithUsers, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  //withGraphFetched implemented need more time to fix this
  // getCampaignAndUserByOrganizationId: async (req, res) => {
  //   /* #swagger.tags = ['Organization']
  //      #swagger.summary = ' - Get all organizations by organization id'
  //      #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
  //   */
  //   try {
  //     const { id } = req.params;
  //     if (!id) {
  //       return res.status(400).json({ error: "ID is required" });
  //     }

  //     const organization = await Organization.query()
  //       .findById(id)
  //       .withGraphFetched("[campaigns, cmsusers]");

  //       const fetchCampaignUsers = async (campaignId, email) => {
  //       try {
  //         const campaignUsers = await CampaignUsers.query()
  //           .where("campaign_id", campaignId)
  //           .andWhere("email", email);
  //         return campaignUsers;
  //       } catch (error) {
  //         console.error("Error fetching campaign users:", error);
  //         return [];
  //       }
  //     };

  //     const organizationWithCampaignUsers = {
  //       ...organization,
  //       campaigns: await Promise.all(
  //         organization.campaigns.map(async (campaign) => {
  //           const campaignUsers = organization.cmsusers
  //             .filter((user) => user.email) // Filter out users with undefined emails
  //             .map(async (user) => await fetchCampaignUsers(campaign.id, user.email))
  //             .filter((campaignUser) => campaignUser); // Filter out undefined campaignUsers

  //           const usersWithCampaignUsers = {
  //             ...campaign,
  //             users: await Promise.all(
  //               campaignUsers.map(async (campaignUser) => {
  //                 const user = organization.cmsusers.find((u) => u.email === campaignUser.email);
  //                 return {
  //                   ...user,
  //                   password: undefined,
  //                 };
  //               })
  //             ),
  //           };
  //           return usersWithCampaignUsers;
  //         })
  //       ),
  //     };

  //     // Output the organization data with campaign users
  //     return res.status(200).json(organizationWithCampaignUsers);
  //     // console.log(organizationWithCampaignUsers);
  //   } catch (error) {
  //   return res.status(500).json({ error: error.message });
  //   }
  // },

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
        const resp = responseWrapper(null, "name, logo and description are required", 400);
        return res.status(400).json(resp);
      }
      const organization = await Organization.query().findById(id);
      if (!organization) {
        const resp = responseWrapper(null, "Organization not found", 400);
        return res.status(400).json(resp);
      }
      const updatedOrganization = await organization
        .$query()
        .patchAndFetch(req.body);
      const resp = responseWrapper(updatedOrganization, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  deleteOrganizationById: async (req, res) => {
    /* #swagger.tags = ['Organization']
               #swagger.summary = ' - delete organization by organization id'
               #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
            */
    try {
      const { id } = req.params;

      if (!id) {
        const resp = responseWrapper(null, "Organization ID is required", 400);
        return res.status(400).json(resp);
      }

      // Fetch organization details to retrieve its name for S3 deletion
      const organization = await Organization.query().findById(id).first();

      if (!organization) {
        const resp = responseWrapper(null, "Organization not found", 204);
        return res.status(200).json(resp);
      }

      // Begin transaction
      await Organization.transaction(async (trx) => {
        // Delete organization and related data
        await CampaignConfig.query(trx)
          .delete()
          .whereIn("campaign_id", function () {
            this.select("campaign_id")
              .from("campaign")
              .where("organization_id", id);
          });
        await StageConfig.query(trx)
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
        await Campaign.query(trx).delete().where("organization_id", id);
        await Organization.query(trx).deleteById(id);
      });

      const resp = responseWrapper(null, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  // /users_by_organization/:organization
  // need work here
  getUsersByOrganization: async (req, res) => {
    /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all users with organizations and its campaign'
               #swagger.parameters['orgid'] = {in: 'path', required: true, type: 'integer'}
            */
    const { orgid } = req.params;

    try {
      if (!orgid) {
        const resp = responseWrapper(null, "Organization ID is required", 400);
        return res.status(400).json(resp);
      }

      const users = await CMSUsers.query().where("organization_id", orgid);
      if (!users || users.length === 0) {
        const resp = responseWrapper(null, "No users found for the organization", 204);
        return res.status(200).json(resp);
      }
      const userEmails = users.map((user) => user.email);
      const campaignUsers = await CampaignUsers.query().whereIn(
        "email",
        userEmails
      );

      const campaignIds = campaignUsers.map(
        (campaignUser) => campaignUser.campaign_id
      );
      const campaigns = await Campaign.query().whereIn("id", campaignIds);
      const usersWithCampaigns = users.map((user) => {
        const userCampaignUsers = campaignUsers.filter(
          (campaignUser) => campaignUser.email === user.email
        );

        const userCampaignData = userCampaignUsers.map((campaignUser) => {
          const campaign = campaigns.find(
            (campaign) => campaign.id === campaignUser.campaign_id
          );
          return campaign;
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          usertype: user.usertype,
          campaigns: userCampaignData,
        };
      });

      const resp = responseWrapper(usersWithCampaigns, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },

  // /api/users_by_organization/:organization
  // need work here
  getAssociatedUserOfOrganization: async (req, res) => {
    /* #swagger.tags = ['Organization']
               #swagger.summary = ' - Get all users by organization name with its associated campaigns'
               #swagger.parameters['orgid'] = {in: 'path', required: true, type: 'integer'}
            */
    const { orgid } = req.params;

    try {
      if (!orgid) {
        const resp = responseWrapper(null, "Organization ID is required", 400);
        return res.status(400).json(resp);
      }

      const users = await CMSUsers.query().where("organization_id", orgid);
      const userEmails = users.map((user) => user.email);
      const campaignUsers = await CampaignUsers.query().whereIn(
        "email",
        userEmails
      );

      const campaignIds = campaignUsers.map(
        (campaignUser) => campaignUser.campaign_id
      );
      const campaigns = await Campaign.query().whereIn("id", campaignIds);

      const usersWithCampaigns = users
        .map((user) => {
          const userCampaignData = campaignUsers
            .filter((campaignUser) => campaignUser.email === user.email)
            .map((campaignUser) => {
              const campaign = campaigns.find(
                (campaign) => campaign.id === campaignUser.campaign_id
              );
              return campaign;
            });

          if (userCampaignData.length > 0) {
            const userData = {
              id: user.id,
              name: user.name,
              email: user.email,
              usertype: user.usertype,
              campaigns: userCampaignData,
            };

            return userData;
          }
        })
        .filter((user) => user !== undefined);

      const resp = responseWrapper(usersWithCampaigns, "success", 200);
      return res.status(200).json(resp);
    } catch (error) {
      const resp = responseWrapper(null, error.message, 500);
      return res.status(500).json(resp);
    }
  },
};
