const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Stage = require('./stage'); // Import Stage model

class Scan extends Model { }

Scan.init({
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
        type: DataTypes.STRING,
        allowNull: false
    },
    stage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Stage, // Name of the table
            key: 'id'
        }
    },
}, {
    sequelize,
    modelName: 'Scan',
    tableName: 'stage_config', // Set table name to 'stage_config'
});


module.exports = Scan;
