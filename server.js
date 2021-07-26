const express = require('express')
const db = require('./models');

const app = express()
const port = 3300

const momo = require('mtn-momo');

const { Collections, Disbursements } = momo.create ({
    callbackHost: " http://0049550c592c.ngrok.io "
})

const collections = Collections ({
    userSecret: "d927779c78914946996d4489331d9f59",
    userId: "9d0b0cb6-ddec-43d3-b742-9b12e92e1031",
    primaryKey: "2af99205bba84d34be7bcfc8e4e1f736"
})

//db.sequelize.sync().then(() => {
//    console.log("The database is ready!");
//});

app.use(express.json())
const userRoute = require("./routes/user")
app.use('/user', userRoute)


app.listen(port, () =>console.log(`Server runing on port ${port}` ) ) 