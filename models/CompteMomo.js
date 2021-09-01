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
    montantTotalRenverser:{
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    montantRenverser:{
        type: Sequelize.ARRAY(Sequelize.JSON),
        allowNull: true,
        defaultValue: []
    }
  },
  );


return CompteMomo;

}