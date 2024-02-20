// models/cmsUser.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const CampaignUser = require('./campaignUser'); // Import CampaignUser model

class CMSUser extends Model { }

CMSUser.init({
  emailid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  organisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usertype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'CMSUser',
  tableName: 'cmsusers',
});

// Define the association with CampaignUser model
CMSUser.hasMany(CampaignUser, { foreignKey: 'emailid', sourceKey: 'emailid' });

module.exports = CMSUser;
