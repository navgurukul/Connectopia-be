// Import Sequelize and the database connection
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Organisation = require('./organisation')
const Stage = require('./stage'); 
const CMSUser = require('./cmsUser');


class Campaign extends Model { }

Campaign.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    scan_type: {
        type: DataTypes.ENUM('qr', 'image'), // Define ENUM values
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    startdate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    enddate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    campaign_duration: {
        type: DataTypes.TIME,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Organisation, 
            key: 'id'
        }
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
    modelName: 'Campaign',
    tableName: 'campaign', // Assuming table name is 'campaigns'
    timestamps: false // Disable timestamps (createdAt, updatedAt)

});

Campaign.hasMany(CMSUser,{
    foreignKey: 'campaign_id'
});
// Campaign.hasMany(Stage,{
//     foreignKey: 'campaign_id'
// });

module.exports = Campaign;
