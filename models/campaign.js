// Import Sequelize and the database connection
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Define the Campaign model
class Campaign extends Model {}

// Define the Campaign schema
Campaign.init({
    campaignid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organisation: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    scantype: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    emailid: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    campaign_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    startdate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    enddate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    desc: {
        type: DataTypes.STRING(255),
        allowNull: true // Assuming description can be optional
    },
    status: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaign_table', // Assuming table name is 'campaigns'
    timestamps: false // Disable timestamps (createdAt, updatedAt)
});

// Export the Campaign model
module.exports = Campaign;
