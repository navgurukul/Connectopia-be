require('dotenv').config();
const sequelize = require('../config/database');
const CustData = require('../models/custData');

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
    }
};
