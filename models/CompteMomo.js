var Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) =>{

const CompteMomo = sequelize.define('momo', {
    
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,  
        unique: true ,
        autoIncrement: true,
    },
    noTel:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    montantRenverser:{
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
  },
  );


return CompteMomo;

}