// Import Sequelize and the connection
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./campaign');

class Quest extends Model { }

// Define the Quest model
Quest.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quest_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quest_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Campaign,
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
},{
        sequelize,
        modelName: 'Quest',
        tableName: 'quest',
        timestamps: false
    });


module.exports = Quest

