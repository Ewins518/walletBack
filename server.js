const express = require('express')
const db = require('./models');

const app = express()
const port = 3300

app.set('view engine', 'ejs')

//db.sequelize.sync().then(() => {
//    console.log("The database is ready!");
//});

app.use('/assets',express.static('public'))

app.use(express.json())
const userRoute = require("./routes/user")
app.use('/user', userRoute)


app.listen(port, () =>console.log(`Server runing on port ${port}` ) ) 