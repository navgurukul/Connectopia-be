const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const Organization = require("../models/organization");
const StageController = require("../controllers/stage");
const responseWrapper = require("../helpers/responseWrapper");
const Stage = require("../models/stage");

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
            let stageNum = req.body.total_stages;
            if (!organization_id) {
                const resp = responseWrapper(null, "fill out proper data", 400);
                return res.status(400).json(resp);
            }
            const ifOrg = await Organization.query().findById(organization_id);
            if (!ifOrg) {
                const resp = responseWrapper(null, "Organization not found", 204);
                return res.status(200).json(resp);
            }
            const ifCampaignExists = await Campaign.query().findOne({ name });
            if (ifCampaignExists) {
                const resp = responseWrapper(null, `Campaign -${name}- already exists`, 204);
                return res.status(200).json(resp);
            }
            const campaign = await Campaign.query().insert(req.body);
            if (!stageNum) {
                stageNum = 1;
            }
            const stageCreate = await StageController.createStageByPasses(campaign.id, stageNum)
            const resp = responseWrapper(campaign, "success", 201);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
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
            if (!id) {
                const resp = responseWrapper(null, "campaign id is required", 400);
                return res.status(400).json(resp);
            }
            let totalStages = await Campaign.query()
                .findById(id)
                .select("total_stages");
            const resp = responseWrapper(totalStages, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
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
            if (!email || !usertype) {
                const resp = responseWrapper(null, "email and usertype is required", 400);
                return res.status(400).json(resp);
            }
            const campaigns = await getCampaignTxn(usertype, email);
            const resp = responseWrapper(campaigns, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
        }
    },

    getCampaignByEmail: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Get all campaigns by email'
        */
        try {
            const { email } = req.params;
            if (!email) {
                const resp = responseWrapper(null, "email required", 400);
                return res.status(400).json(resp);
            }
            const campaigns = await getCampaignTxn("user", email, null);
            const resp = responseWrapper(campaigns, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
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
            if (!id) {
                const resp = responseWrapper(null, "Campaign ID is required", 400);
                return res.status(400).json(resp);
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                const resp = responseWrapper(null, "Campaign not found", 204);
                return res.status(200).json(resp);
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(
                id,
                req.body
            );
            const resp = responseWrapper(updatedCampaign, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
        }
    },

    // progress se delete pending
    deleteCampaignTxn: async (id, name = null) => {
        try {
            if (!campaign_name || !id) {
                return res
                    .status(400)
                    .json({ error: "Campaign ID or name is required" });
            }
            const campaign = await (id
                ? Campaign.query().findById(id)
                : Campaign.query().where("name", name).first());
            if (!campaign) {
                return res
                    .status(400)
                    .json({ error: "Campaign not found" });
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
            if (!id) {
                const resp = responseWrapper(null, "Campaign ID is required", 400);
                return res.status(400).json(resp);
            }

            const campaignData = await Campaign.query().findById(id);
            if (!campaignData) {
                const resp = responseWrapper(null, "Campaign not found", 204);
                return res.status(200).json(resp);
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
                await Stage.query(trx).delete().where("campaign_id", campaignData.id);
                await Campaign.query(trx).delete().where("id", campaignData.id);

            });
            const resp = responseWrapper(null, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
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
            if (!id || !status) {
                const resp = responseWrapper(null, "campaign id and status are required", 400);
                return res.status(400).json(resp);
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                const resp = responseWrapper(null, "Campaign not found", 204);
                return res.status(200).json(resp);
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(id, {
                status,
            });
            const resp = responseWrapper(updatedCampaign, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
        }
    },

    // nextCampaignId
    genNextCampaignId: async (req, res) => {
        /*
            #swagger.tags = ['Campaign']
            #swagger.summary = 'Generate next Campaign ID'
        */
        try {
            const lastCampaign = await Campaign.query().orderBy("id", "desc").first();
            if (!lastCampaign) {
                console.log("No campaign found ID 1 will be generated. ⚠️");
                const resp = responseWrapper({ id: 1 }, error.message, 200);
                return res.status(200).json(resp);
            }
            const resp = responseWrapper({ id: lastCampaign.id + 1 }, "success", 200);
            return res.status(200).json(resp);
        } catch (error) {
            const resp = responseWrapper(null, error.message, 500);
            return res.status(500).json(resp);
        }
    },
};
