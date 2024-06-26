const express = require('express')
const db = require('./models');
const app = express()
const momo = require('mtn-momo');
require("dotenv").config();

const port = process.env.PORT || 5000

//const { Collections, Disbursements } = momo.create({
//    callbackHost: "https://ultraypay.herokuapp.com/",
//    environment: "production",
//    baseUrl: "https://ericssondeveloperapi.portal.azure-api.net/"
//  });
//  
//  const collections = Collections({
//    userSecret: process.env.COLLECTIONS_USER_SECRET,
//    userId: process.env.COLLECTIONS_USER_ID,
//    primaryKey: process.env.COLLECTIONS_PRIMARY_KEY
//  });
//  
//  const disbursements = Disbursements({
//    userSecret: process.env.DISBURSEMENTS_USER_SECRET,
//    userId: process.env.DISBURSEMENTS_USER_ID,
//    primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
//  });


app.set('view engine', 'ejs')

//db.sequelize.sync().then(() => {
//    console.log("The database is ready!");
//});

app.use('/assets',express.static('public'))

const userRoute = require("./routes/user") 
const linkRoute = require("./routes/link")
const compteRoute = require("./routes/compte")

app.use('/user', userRoute)
app.use('/link', linkRoute)
app.use('/compte', compteRoute)

app.route("/").get((req, res)=> res.json("Bienvenue sur Ultrapay")) 

app.listen(port, () =>console.log(`Server runing on port ${port}` ) ) 
