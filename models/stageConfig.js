const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Stage = require('./stage'); // Import Stage model

class StageConfig extends Model { }

StageConfig.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    page_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scan_type: {
        type: DataTypes.ENUM('qr', 'image'), 
        allowNull: false
    },
    stage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Stage,
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
    modelName: 'StageConfig',
    tableName: 'stage_config', // Set table name to 'stage_config'
    timestamps: false
});


module.exports = StageConfig;
