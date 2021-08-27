const dbConfig = require("../config/db");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    ssl: true,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }

});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./User")(sequelize, Sequelize);
db.Compte = require("./Compte")(sequelize, Sequelize);
db.CompteMomo = require("./CompteMomo")(sequelize, Sequelize);
db.Transac = require("./Transaction")(sequelize,Sequelize);
db.Lien = require("./Lien")(sequelize,Sequelize);
db.Client = require("./Client")(sequelize,Sequelize);

db.CompteMomo.belongsTo(db.Compte,{foreignKey: 'compteID',onDelete: 'cascade', constraints: false});
db.Compte.belongsTo(db.User, {foreignKey: 'userID',onDelete: 'cascade'});
db.Transac.belongsTo(db.User,{foreignKey: 'userID',onDelete: 'cascade'});
db.Lien.belongsTo(db.Compte, {foreignKey: 'compteID', onDelete: 'cascade'});
db.Client.belongsTo(db.Lien, {foreignKey: 'lienID', onDelete: 'cascade'});

module.exports = db;