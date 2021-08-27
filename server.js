const express = require('express')
const db = require('./models');
const app = express()
const momo = require('mtn-momo');
require("dotenv").config();

const port = 3300

const { Collections, Disbursements } = momo.create({
    callbackHost: "http://aee51d212026.ngrok.io"
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


app.set('view engine', 'ejs')

db.sequelize.sync().then(() => {
    console.log("The database is ready!");
});

app.use('/assets',express.static('public'))

const userRoute = require("./routes/user") 
const linkRoute = require("./routes/link")
const compteRoute = require("./routes/compte")

app.use('/user', userRoute)
app.use('/link', linkRoute)
app.use('/compte', compteRoute)

app.listen(port, () =>console.log(`Server runing on port ${port}` ) ) 
