
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
        defaultValue: true
    },
    apiKey:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique:true,
    },
  },
  );

return Compte;

}