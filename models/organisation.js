const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Organisation extends Model {}

Organisation.init({
  organisation: {
    type: DataTypes.STRING(255), // Define the length for varchar columns
    allowNull: false,
  },
  desc: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  createddate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Organisation',
  tableName: 'organisation',
  timestamps: false, // If you don't want Sequelize to automatically manage createdAt and updatedAt fields
});

module.exports = Organisation;
