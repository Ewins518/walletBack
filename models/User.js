var Sequelize = require('sequelize');
const db = require('../models');
const Compte = db.Compte

module.exports = (sequelize, Sequelize) =>{
    
    const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER , 
        unique: true , 
        primaryKey: true,  
        autoIncrement: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true },
        unique: true,
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    

  });

  return User;
}
