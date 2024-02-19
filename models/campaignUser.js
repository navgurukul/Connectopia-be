const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class CampaignUser extends Model {}

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

module.exports = CampaignUser;
