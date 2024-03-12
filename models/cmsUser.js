const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Quest = require('./quest'); // Import the Quest model
const Organisation = require('./organisation');

class CMS extends Model { }

CMS.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usertype: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Organisation, // Reference to the Quest model
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
    modelName: 'CMS',
    tableName: 'cms_users',
    timestamps: false
});

module.exports = CMS;
