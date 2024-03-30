const CustData  = require("../models/customer_data");
const Campaign = require("../models/campaign");

module.exports = {
  getPlayersList: async (req, res) => {
    const campaign_id = req.params.campaign_id;
    if (!campaign_id) {
      return res.status(400).send("campaignid is required");
    }

    try {
      const playersList = await CustData.query().where(
        "campaign_id",
        campaign_id
      );
      res.status(200).json(playersList);
    } catch (error) {
      console.error("Error fetching players list:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  addPlayer: async (req, res) => {
    const { phone, name, email, campaign_id } = req.body;

    if (!phone || !name || !campaign_id) {
      return res.status(400).json({ message: "Incomplete details" });
    }

    try {
      // Check if the campaign exists
      const campaign = await Campaign.query().findById(campaign_id);
      if (!campaign) {
        return res
          .status(404)
          .json({
            message: `No campaign found for the given campaign ID: ${campaign_id}`,
          });
      }

      const campaign_name = campaign.name; 
      const organization_id  = campaign.organization_id;

      // Prepare player data
      const playerData = {
        phone,
        name,
        campaign_id,
        campaign_name,
        organization_id,
      };

      if (email) {
        playerData.email = email;
      }

      // Insert player data into database
      await CustData.query().insert(playerData);

      return res.status(200).send("Player data inserted successfully.");
    } catch (error) {
      console.error("Error inserting player data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
