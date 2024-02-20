const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Import your Sequelize instance
class CampaignConfig extends Model { }

CampaignConfig.init({
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
}, {
    sequelize,
    modelName: 'CampaignConfig',
    tableName: 'campaign_config', // Assuming your table name is 'campaign_config'
    timestamps: false // If you don't want timestamps
});


module.exports = CampaignConfig;
