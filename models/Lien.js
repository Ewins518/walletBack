var Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) =>{
const Lien = sequelize.define('lien', {
    id: {
        type: Sequelize.INTEGER , 
        primaryKey: true,  
        autoIncrement: true
    },
    montant:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Description:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    identifiant:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique:true,
    },
    url:{
        type: Sequelize.STRING,
        allowNull: false,
    }

  });

  Lien.beforeCreate(async (lien, options) => {
    
    try {

        const identifier = lien.dataValues.identifiant
       
        const myURL = new URL(lien.dataValues.url)
        myURL.pathname = myURL.pathname + identifier.toString()

       lien.url = myURL.toString()

    } catch (error) {
       console.log(error)
    }
});

  return Lien;

}