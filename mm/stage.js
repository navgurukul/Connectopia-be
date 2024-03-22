const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./campaign'); // Import campaign model
const Organisation = require('./organisation');
const Customer = require('./customerData');
const StageConfig = require('./stageConfig');

class Stage extends Model { }

Stage.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scanner_type: {
        type: DataTypes.ENUM('qr', 'image'), // Define ENUM values
        allowNull: false
    },
    scan_sequence_type: {
        type: DataTypes.ENUM('fixed', 'random'), // Define ENUM values
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    stage_type: {
        type: DataTypes.ENUM('single', 'multi'), // Define ENUM values
        allowNull: false
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: Campaign,
        //     key: 'id'
        // }
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
    modelName: 'Stage',
    tableName: 'stages',
    timestamps: false

});

Stage.hasMany(Customer, { foreignKey: 'stage_id' });
Stage.hasMany(StageConfig, { foreignKey: 'stage_id' });

module.exports = Stage;
