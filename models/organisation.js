// models/Organisation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organisation = sequelize.define('Organisation', {
  organisation: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createddate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Organisation;
