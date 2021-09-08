const momo = require('mtn-momo');
require("dotenv").config();

const { Collections, Disbursements } = momo.create({
    callbackHost: "https://ultraypay.herokuapp.com/",
    environment: "production",
    baseUrl: "ericssondeveloperapi.portal.azure-api.net"
  });
  
  const collections = Collections({
    userSecret: process.env.COLLECTIONS_USER_SECRET,
    userId: process.env.COLLECTIONS_USER_ID,
    primaryKey: process.env.COLLECTIONS_PRIMARY_KEY
  });
  
  const disbursements = Disbursements({
    userSecret: process.env.DISBURSEMENTS_USER_SECRET,
    userId: process.env.DISBURSEMENTS_USER_ID,
    primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
  });


module.exports = {
    disbursements:disbursements,
    collections: collections
};