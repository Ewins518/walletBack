var Sequelize = require('sequelize');
const db = require('../models');
const User = db.User

module.exports = (sequelize, Sequelize) =>{
const Transaction = sequelize.define('transaction', {
    id: {
        type: Sequelize.INTEGER , 
        unique: true , 
        primaryKey: true,  
        autoIncrement: true
    },
    isRecharge:{
       type: Sequelize.BOOLEAN,
       defaultValue: false
    },
    montant:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    compte_id:{
        type: Sequelize.BIGINT,
        allowNull: false,
    }

  });

  return Transaction;

}