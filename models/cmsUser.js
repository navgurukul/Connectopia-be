const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Organisation = require('./organisation');

class CMSUser extends Model { }

CMSUser.init({
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
    user_type: {
        type: DataTypes.ENUM('superadmin', 'admin', 'user'), // Define ENUM values
        allowNull: false
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    modelName: 'CMSUser',
    tableName: 'cms_users',
    timestamps: false
});

module.exports = CMSUser;
