const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Stage = require('./stage'); // Import Stage model
const Quest = require('./quest'); // Import Quest model

class Customer extends Model { }

Customer.init({
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
        allowNull: false
    },
    phone_number: {
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
    quest_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Quest, // Name of the table
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
    modelName: 'Customer',
    tableName: 'customer_data', // Set table name to 'customer_data'
    timestamps:false

});


module.exports = Customer;
