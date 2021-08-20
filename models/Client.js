
module.exports = (sequelize, Sequelize) =>{
    
    const Client = sequelize.define('client', {
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
    number:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    },

  });

  return Client;
}
