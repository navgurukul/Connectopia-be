const Campaign = require("../models/campaign");
const CampaignConfig = require("../models/campaign_config");
const CampaignUsers = require("../models/campaign_users");
const StageConfig = require("../models/stage_config");
const CMSUsers = require("../models/cmsusers");
const Organization = require("../models/organization");
const Stage = require("../controllers/stage");

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
            const { organization_id, name} = req.body;
            const stageNum = req.body.total_stages;
            if (!organization_id) {
                return res.status(400).json({ error: "fill out proper data" });
            }
            const ifOrg = await Organization.query().findById(organization_id);
            if (!ifOrg) {
                return res.status(404).json({ error: "Organization not found" });
            }
            const ifCampaignExists = await Campaign.query().findOne({ name });
            if (ifCampaignExists) {
                return res
                    .status(400)
                    .json({ error: `Campaign -${name}- already exists` });
            }
            const campaign = await Campaign.query().insert(req.body);
            const stageCreate = await Stage.createStageByPasses(campaign.id, stageNum)
            res.status(200).json(campaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                return res.status(400).json({ error: "campaign id is required" });
            }
            let totalStages = await Campaign.query()
                .findById(id)
                .select("total_stages");

            res.status(200).json(totalStages);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                return res.status(400).json({
                    error: "email and usertype is required",
                });
            }
            const campaigns = await getCampaignTxn(usertype, email);
            res.status(200).json(campaigns);
        } catch (error) {
            if (
                error.message === "No campaigns found" ||
                error.message === "No campaigns found by email"
            ) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
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
                return res.status(400).json({ error: "email required" });
            }
            const campaigns = await getCampaignTxn("user", email, null);
            res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                return res.status(400).json({ error: "campaign id is required" });
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                return res.status(404).json({ error: "Campaign not found" });
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(
                id,
                req.body
            );
            res.status(200).json(updatedCampaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                return res.status(404).json({ error: "Campaign not found" });
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
                return res.status(400).json({ error: "Campaign ID is required" });
            }

            const campaignData = await Campaign.query().findById(id);
            if (!campaignData) {
                return res.status(404).json({ error: "Campaign not found" });
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
            // console.log(check);
            return res.status(200).json({ msg: "Campaign deleted successfully" });
        } catch (error) {
            // console.log(error);
            return res.status(500).json({ error: error.message });
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
            console.log(id, status);
            if (!id || !status) {
                return res
                    .status(400)
                    .json({ error: "campaign id and status are required" });
            }
            const campaign = await Campaign.query().findById(id);
            if (!campaign) {
                return res.status(404).json({ error: "Campaign not found" });
            }
            const updatedCampaign = await Campaign.query().patchAndFetchById(id, {
                status,
            });
            res.status(200).json(updatedCampaign);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
                return res.status(200).json({ id: 1 });
            }
            res.status(200).json({ id: lastCampaign.id + 1 });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
