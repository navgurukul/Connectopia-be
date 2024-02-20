// models/Campaign.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Import your Sequelize instance
class CustData extends Model {}

CustData.init({
  phonenumber: {
    type: DataTypes.STRING(155),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  emailid: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  campaignid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  campaign_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  organisation: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'CustData',
  tableName: 'custdata', // Assuming your table name is 'custdata'
  timestamps: false // If you don't want timestamps
});

module.exports = CustData;
