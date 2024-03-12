// Import Sequelize and the database connection
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Organisation = require('./organisation')
// Define the Campaign model
class Campaign extends Model { }

// Define the Campaign schema
Campaign.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    scantype: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
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
    status: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Organisation, // Name of the table
            key: 'id'
        }
    },
}, {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaign', // Assuming table name is 'campaigns'
    timestamps: false // Disable timestamps (createdAt, updatedAt)
});

// Export the Campaign model
module.exports = Campaign;
