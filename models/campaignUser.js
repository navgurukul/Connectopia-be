// models/campaignUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CampaignUser = sequelize.define('campaign_users', {
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
});

module.exports = CampaignUser;
