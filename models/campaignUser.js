const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./campaign'); // Import Campaign model

class CampaignUser extends Model { }

CampaignUser.init({
  emailid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  campaignid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'CampaignUser',
  tableName: 'campaign_users',
});

// Define the association with Campaign model
CampaignUser.belongsTo(Campaign, { foreignKey: 'campaignid' });


module.exports = CampaignUser;
