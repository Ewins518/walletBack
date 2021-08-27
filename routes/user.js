const express = require('express')
const user = require('../controllers/users')
const router = express.Router()
const db = require("../models");
const bodyParser = require('body-parser')
require("dotenv").config();
const middleware = require('../config/middleware')

const User = db.User

router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())

router.route('/token').get(middleware.generateToken)

router.route('/register').post(user.signUp)

router.route('/login').post(user.signIn)

//router.get("/get/balance", (req, res, next) =>
//  collections
//    .getBalance()
//    .then(account => res.json(account))
//    .catch(next)
//);

router.get("/usermail",middleware.checkToken, async (req, res) => {

  await User.findOne({where: {id: req.decoded.userId}})
  .then(result => {
    res.status(200).json({email: result.email})
  })
  .catch(error => res.status(500).json({ error }))
})


module.exports = router