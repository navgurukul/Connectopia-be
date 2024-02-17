// models/campaignUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const CampaignUser = sequelize.define('CampaignUser', {
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
