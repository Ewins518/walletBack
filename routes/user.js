const express = require('express')

const user = require('../controllers/users')
const transaction = require('../controllers/transaction')
const compte = require('../controllers/compte')
const router = express.Router()

router.route('/register').post(user.createUser)

router.route('/transaction/:id').patch(transaction.createTransac)

router.route('/addcompte/:username').patch(compte.addMomo)

router.get('/', (req, res) => res.send('Welcome'))

module.exports = router;