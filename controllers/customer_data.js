const CustData = require("../models/customer_data");
const Campaign = require("../models/campaign");

module.exports = {
  getPlayersList: async (req, res) => {
    /*
      #swagger.tags = ['Customer']
      #swagger.summary = 'Get list of customers by campaign ID'
    */
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
    /*
      #swagger.tags = ['Customer']
      #swagger.summary = 'Add a Player'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Create a new Campaign',
        schema: {
          $name: 'string',
          $phone: 1234567890,
          $email: 'example@gmail.com',
          $campaign_id: 0
        }
      }
    */
    const { phone, name, email, campaign_id } = req.body;

    if (!phone || !name || !campaign_id) {
      return res.status(400).json({ message: "Incomplete details" });
    }

    try {
      // Check if the campaign exists
      const campaign = await Campaign.query().findById(campaign_id);
      if (!campaign) {
        return res.status(404).json({
          message: `No campaign found for the given campaign ID: ${campaign_id}`,
        });
      }

      const campaign_name = campaign.name;
      const organization_id = campaign.organization_id;

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

      const existPlayer = await CustData.query()
        .where("phone", phone)
        .andWhere("campaign_id", campaign_id);
      if (existPlayer.length > 0) {
        return res.status(200).json({ message: "Player already exists" });
      }
      // Insert player data into database
      await CustData.query().insert(playerData);

      return res.status(200).json({ message: "Player added successfully." });
    } catch (error) {
      console.error("Error inserting player data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deletePlayer: async (req, res) => {
    /*
      #swagger.tags = ['Customer']
      #swagger.summary = 'Delete a Player by phone number and campaign ID'
      #swagger.parameters['phone'] = {in: 'path', required: true, type: 'integer'}           
      #swagger.parameters['campaign_id'] = {in: 'path', required: true, type: 'integer'}
    */
    try {
      const { phone, campaign_id } = req.params;

      if (!phone || !campaign_id) {
        return res.status(400).send("Incomplete details");
      }

      const deletedCount = await CustData.query()
        .delete()
        .where("phone", phone)
        .andWhere("campaign_id", campaign_id);

      if (deletedCount === 0) {
        return res.status(404).json({ message: "Player data not found" });
      }

      res.status(200).json({ message: `Player data with ${phone} deleted` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
