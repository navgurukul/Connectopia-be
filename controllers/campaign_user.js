const e = require("express");
const Campaign = require("../models/campaign");
const CampaignUsers = require("../models/campaign_users");

module.exports = {
  assignCampaignToUser: async (req, res) => {
    const { email, campaign_id } = req.body;

    if (!email || !campaign_id) {
      return res.status(400).send("Please provide complete details");
    }

    try {
      // Retrieve campaign ID from the campaign name
      const campaign = await Campaign.query().where("id", campaign_id);
      if (!campaign) {
        return res.status(404).send(`Campaign "${campaign_id}" not found`);
      }
      // Insert the association between user and campaign
      await CampaignUsers.query().insert({ email, campaign_id });

      return res.status(200).send("New campaign assigned to the user");
    } catch (error) {
      console.error("Error assigning campaign to user:", error);
      return res.status(500).send("Internal server error");
    }
  },

  removeCampaignFromUser: async (req, res) => {
    const { email, campaign_id } = req.body;

    if (!email || !campaign_id) {
      return res.status(400).send("Please provide complete details");
    }

    try {
      // Check if the user is associated with the campaign
      const userCampaign = await CampaignUsers.query().findOne({
        email,
        campaign_id,
      });
      if (!userCampaign) {
        return res.status(400).send("User is not associated with the campaign");
      }

      // Delete the association between user and campaign
      await CampaignUsers.query().delete().where({ email, campaign_id });

      return res.status(200).send("Campaign deleted from user");
    } catch (error) {
      console.error("Error removing campaign from user:", error);
      return res.status(500).send("Internal server error");
    }
  },
};
