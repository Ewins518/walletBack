const express = require('express')

const user = require('../controllers/users')
const transaction = require('../controllers/transaction')
const compte = require('../controllers/compte')
const recharge = require('../controllers/recharger')
const router = express.Router()
const fedapay = require('../controllers/fedapay')
const momo = require('mtn-momo');

const { Collections, Disbursements } = momo.create ({
    callbackHost: " http://0049550c592c.ngrok.io "
})

const collections = Collections ({
    userSecret: "d927779c78914946996d4489331d9f59",
    userId: "9d0b0cb6-ddec-43d3-b742-9b12e92e1031",
    primaryKey: "2af99205bba84d34be7bcfc8e4e1f736"
})


router.route('/register').post(user.createUser)

router.route('/transaction/:id').patch(transaction.createTransac)

router.route('/addcompte/:username').patch(compte.addMomo)

router.get('/', (req, res) => res.render('index', {test: "120000"}))

router.get("/balance", (_req, res, next) =>
  collections
    .getBalance()
    .then(account => res.json(account))
    .catch(next)
);

router.route('/callback').all(
    function(req, res) {
        console.log({ callbackRequestBody: req.body });
        res.send("ok");
})

router.route('/recharge/:username').post(recharge.rechargerCompte)
router.route('/fedapay').post(fedapay.fedaTrans)

module.exports = router;