var Sequelize = require('sequelize');
const { Transac } = require('../models');
const db = require('../models');
const User = db.User
const Transaction = db.Transac;
const CompteMomo = db.CompteMomo

module.exports = (sequelize, Sequelize) =>{

const Compte = sequelize.define('compte', {
    
    noCompte:{
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,  
        unique: true ,
        autoIncrement: true,
    },
    solde:{
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    actif:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
  },
  );

return Compte;

}