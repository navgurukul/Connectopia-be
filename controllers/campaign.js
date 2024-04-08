const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const Organization = require("../models/organization");
const responseWrapper = require("../helpers/responseWrapper");

// helper function
const getCampaignTxn = async (usertype, email) => {
    try {
        const userExist = await CMSUsers.query().where("email", email);
        if (userExist.length > 0) {
            switch (usertype) {
                case "superadmin":
                    const superAdminCampaigns = await Campaign.query();
                    return superAdminCampaigns;
                case "admin":
                case "user":
                    const userCampaigns = await Campaign.query().where("email", email);
                    if (userCampaigns.length > 0) {
                        return userCampaigns;
                    } else {
                        throw new Error("No campaigns found by email");
                    }
                default:
                    throw new Error("Invalid usertype");
            }
        } else {
            throw new Error("User not found by this email");
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    // progress
    createCampaign: async (req, res) => {
        /*
                 #swagger.tags = ['Campaign']
                 #swagger.summary = 'Create a new Campaign'
                 #swagger.parameters['body'] = {
                   in: 'body',
                   description: 'Create a new Campaign',
                   schema: {
                     $name: 'string',
                     $description: 'string',
                     $email: 'string',
                     $scantype: 'qr or image',
                     $startdate: 'YYYY-MM-DD',
                     $enddate: 'YYYY-MM-DD',
                     $status: 'active or inactive',
                     $scan_sequence: 'fixed or random',
                     $campaign_duration: 'HH:MM:SS',
                     $total_stages: 1,
                     $organization_id: 0
                   }
                 }
                */
        try {
            const { organization_id, name } = req.body;
            let resp;
            if (!organization_id) {
                resp = responseWrapper(null, "fill out proper data", 400);
                res.status(400).json(resp);
            }
            const ifOrg = await Organization.query().findById(organization_id);
            if (!ifOrg) {
                resp = responseWrapper(null, "Organization not found", 204);
                res.status(200).json(resp);
            }
            const ifCampaignExists = await Campaign.query().findOne({ name });
            if (ifCampaignExists) {
                resp = responseWrapper(null, `Campaign -${name}- already exists`, 204);
                res.status(200).json(resp);
            }
            const campaign = await Campaign.query().insert(req.body);
            resp = responseWrapper(campaign, "success", 201);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    getCampaignById: async (req, res) => {
        /*
                 #swagger.tags = ['Campaign']
                 #swagger.summary = 'Get a Campaigns total stage by campaign ID'
                 #swagger.parameters['id'] = { in: 'query', type: 'number' }
                */
        try {
            const { id } = req.params;
            let resp;
            if (!id) {
                resp = responseWrapper(null, "campaign id is required", 400);
                res.status(400).json(resp);
            }
            let totalStages = await Campaign.query()
                .findById(id)
                .select("total_stages");
            resp = responseWrapper(totalStages, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    getCampaignByEmailUser: async (req, res) => {
        /*
         #swagger.tags = ['Campaign']
         #swagger.summary = 'Get all campaigns by email and usertype'
         #swagger.parameters['usertype'] = { in: 'path', required: true, type: 'string', enum: ['superadmin', 'admin', 'user'],}
        */
        try {
            const { email, usertype } = req.params;
            let resp;
            if (!email || !usertype) {
                resp = responseWrapper(null, "email and usertype is required", 400);
                res.status(400).json(resp);
            }
            const campaigns = await getCampaignTxn(usertype, email);
            resp = responseWrapper(campaigns, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    getCampaignByEmail: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Get all campaigns by email'
        */
        try {
            const { email } = req.params;
            let resp;
            if (!email) {
                resp = responseWrapper(null, "email required", 400);
                res.status(400).json(resp);
            }
            const campaigns = await getCampaignTxn("user", email, null);
            resp = responseWrapper(campaigns, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    updateCampaignById: async (req, res) => {
        /*
                 #swagger.tags = ['Campaign']
                 #swagger.summary = 'Update a Campaign by ID'
                 #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
                 #swagger.parameters['body'] = {
                   in: 'body',
                   description: 'Create a new Campaign',
                   schema: {
                     $name: 'string',
                     $description: 'string',
                     $email: 'string',
                     $scantype: 'qr or image',
                     $startdate: 'YYYY-MM-DD',
                     $enddate: 'YYYY-MM-DD',
                     $status: 'active or inactive',
                     $scan_sequence: 'fixed or random',
                     $campaign_duration: 'HH:MM:SS',
                     $total_stages: 1,
                     $organization_id: 0
                   }
                 }
                */
        try {
            const { id } = req.params;
            let resp;
            if (!id) {
                resp = responseWrapper(null, "Campaign ID is required", 400);
                res.status(400).json(resp);
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                resp = responseWrapper(null, "Campaign not found", 204);
                res.status(200).json(resp);
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(
                id,
                req.body
            );
            resp = responseWrapper(updatedCampaign, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    // progress se delete pending
    deleteCampaignTxn: async (id, name = null) => {
        try {
            let resp;
            if (!campaign_name || !id) {
                return res
                    .status(400)
                    .json({ error: "Campaign ID or name is required" });
            }
            const campaign = await (id
                ? Campaign.query().findById(id)
                : Campaign.query().where("name", name).first());
            if (!campaign) {
                resp = responseWrapper(null, "Campaign not found", 204);
                res.status(200).json(resp);
            }
            await Campaign.transaction(async (trx) => {
                await CampaignConfig.query(trx)
                    .delete()
                    .where("campaign_id", campaign.id);
                await CampaignUsers.query(trx)
                    .delete()
                    .where("campaign_id", campaign.id);
                await Campaign.query(trx).delete().where("id", campaign.id);
            });
            return {
                msg: "Campaign data deletion completed successfully.",
                operation: true,
            };
        } catch (error) {
            return {
                msg: "Campaign data deletion failed.",
                operation: false,
                error: error.message,
            };
        }
    },

    deleteCampaignById: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Delete a Campaign by ID'
            #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
        */
        try {
            const { id } = req.params;
            let resp;
            if (!id) {
                resp = responseWrapper(null, "Campaign ID is required", 400);
                res.status(400).json(resp);
            }

            const campaignData = await Campaign.query().findById(id);
            if (!campaignData) {
                resp = responseWrapper(null, "Campaign not found", 204);
                res.status(200).json(resp);
            }
            const check = await Campaign.transaction(async (trx) => {
                await CampaignConfig.query(trx)
                    .delete()
                    .where("campaign_id", campaignData.id);
                await CampaignUsers.query(trx)
                    .delete()
                    .where("campaign_id", campaignData.id);
                await StageConfig.query(trx)
                    .delete()
                    .where("campaign_id", campaignData.id);
                await Campaign.query(trx).delete().where("id", campaignData.id);
            });
            resp = responseWrapper(null, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    // setStatus
    setStatus: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Set status of a Campaign by ID'
            #swagger.parameters['id'] = {in: 'path', required: true, type: 'integer'}
        */
        try {
            const { id, status } = req.params;
            let resp;
            if (!id || !status) {
                resp = responseWrapper(null, "campaign id and status are required", 400);
                res.status(400).json(resp);
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                resp = responseWrapper(null, "Campaign not found", 204);
                res.status(200).json(resp);
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(id, {
                status,
            });
            resp = responseWrapper(updatedCampaign, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },

    // nextCampaignId
    genNextCampaignId: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Generate next Campaign ID'
        */
        try {
            let resp;
            const lastCampaign = await Campaign.query().orderBy("id", "desc").first();
            if (!lastCampaign) {
                console.log("No campaign found ID 1 will be generated. ⚠️");
                const resp = responseWrapper({ id: 1 }, error.message, 200);
                res.status(200).json(resp);
            }
            resp = responseWrapper({ id: lastCampaign.id + 1 }, "success", 200);
            res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            res.status(500).json(resp);
        }
    },
};
