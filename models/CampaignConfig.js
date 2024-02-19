const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import your Sequelize instance

const CampaignConfig = sequelize.define('campaign_config', {
    campaignid: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pageno: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scantype: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = CampaignConfig;
