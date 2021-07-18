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
    //date:{
      //  type: Sequelize.DATE,
    //},
    montant:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    compte_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
    }

  });

  return Transaction;

}