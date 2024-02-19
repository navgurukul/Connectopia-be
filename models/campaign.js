// models/campaign.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('campaign_table', {
  campaignid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  organisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  campaign_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  enddate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'inactive',
  },
  scantype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Campaign;
