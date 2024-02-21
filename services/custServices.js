require('dotenv').config();
const sequelize = require('../config/database');
const CustData = require('../models/custData');
const Campaign = require('../models/campaign');

module.exports = {
    async getCustData(campaignid) {
        try {
            const custData = await CustData.findAll({
                where: { campaignid: campaignid }
            });
            return custData;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    },

    async addPlayerDetails(name, phoneNumber, campaignId, emailId = null) {
        try {
            // Check if the campaign exists
            const campaign = await Campaign.findOne({
                attributes: ['campaign_name', 'organisation'],
                where: { campaignid: campaignId }
            });
    
            if (!campaign) {
                throw new Error(`No campaign found for the given campaign ID: ${campaignId}`);
            }
    
            const campaignName = campaign.campaign_name;
            const organisation = campaign.organisation;
    
            // Insert player details into the database
            await CustData.create({
                phonenumber: phoneNumber,
                name: name,
                emailid: emailId,
                campaignid: campaignId,
                date: new Date(),
                campaign_name: campaignName,
                organisation: organisation
            });
    
            return 'Player data inserted successfully.';
        } catch (error) {
            console.error('Error inserting player data:', error);
            throw new Error('Failed to insert player data.');
        }
    },

};
