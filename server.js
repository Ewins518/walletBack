const express = require('express')
const db = require('./models');
const Sequelize = require('sequelize');
const router = express.Router()
const user = require('./controllers/users')
const app = express()
const port = 3300

db.sequelize.sync().then(() => {
    console.log("The database is ready!");
});

app.use(express.json())
const userRoute = require("./routes/user")
app.use('/user', userRoute)


//router.get('/', (req, res) => res.send('Welcome'))
//router.post('/register', user.create)

app.listen(port, () =>console.log(`Server runing on port ${port}` ) ) 