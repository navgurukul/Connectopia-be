const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./campaign'); // Import campaign model
const CMS = require('./cmsUser'); // Import CMSUsers model
const Quest = require('./quest'); // Import quest model

class Stage extends Model { }

Stage.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scanner_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scan_sequence_type: {
        type: DataTypes.STRING,
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
    stage_duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stage_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Campaign, // Reference the Quest model
            key: 'id' // Referencing the primary key of the Quest model
        }
    },
    quest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Quest, // Reference the Quest model
            key: 'id' // Referencing the primary key of the Quest model
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
    modelName: 'Stage',
    tableName: 'stages',
    timestamps: false

});


module.exports = Stage;
