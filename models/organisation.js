const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./campaign');
const CMSUser = require('./cmsUser');

class Organisation extends Model { }

Organisation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255), // Define the length for varchar columns
    allowNull: false,
    unique: true, // Define the column as unique
  },
  logo: {
    type: DataTypes.STRING(255), // Define the length for varchar columns
    allowNull: false,
  },
  contact_name: {
    type: DataTypes.STRING(255), // Define the length for varchar columns
    allowNull: false,
  },
  contact_email: {
    type: DataTypes.STRING(255), // Define the length for varchar columns
    allowNull: false,
  },
  contact_number: {
    type: DataTypes.BIGINT(10), // Change the data type to BIGINT with limit 10
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 10], // Validate that the number has exactly 10 digits
    },
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Organisation',
  tableName: 'organisation',
  timestamps: false, // If you don't want Sequelize to automatically manage createdAt and updatedAt fields
});

Organisation.hasMany(Campaign, { foreignKey: 'organisation_id' });
Organisation.hasMany(CMSUser, { foreignKey: 'organisation_id' });

module.exports = Organisation;
