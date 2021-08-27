const express = require('express')
const link = require('../controllers/lien')
const router = express.Router()
const momo = require('mtn-momo');
const db = require("../models");
const Client = db.Client
const Compte = db.Compte
const Lien = db.Lien
const bodyParser = require('body-parser')
var idLink, linkAmount, accountNumber, cb;
require("dotenv").config();
const poll = require('../controllers/poll')
const middleware = require('../config/middleware')

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



router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())


router.route('/getlinkusers').get(middleware.checkToken,link.allLinkUser)

router.route('/paymentlink').post(middleware.checkToken,link.createLink)

router.route('/sitweblink').post(middleware.checkToken,link.createWebSitLink)

router.get('/link/:id', async (req, res) => {
    const foundLink = await Lien.findOne({where: {identifiant: req.params.id}})
    
    idLink = foundLink.get('id')
    linkAmount = foundLink.get('montant')
    accountNumber = foundLink.get('compteID')
     cb = foundLink.get('callbackUrl')
     res.render('index', {test: linkAmount})
     
   })


router.post('/pay', async (req, res, next) => {
  
    const client = {
      name: req.body.nom,
      number: req.body.number,
      lienID: idLink
    }
    console.log("inside pay")
    collections
      .requestToPay({
        amount: linkAmount,
        currency: "EUR",
        externalId: "123456",
        payer: {
          partyIdType: momo.PayerType.MSISDN,
          partyId: client["number"]
        },
        payerMessage: "testing",
        payeeNote: "hello"
      })
      .then(async transactionId => poll.poll(() => collections.getTransaction(transactionId)))
      .then(async () => {
        console.log("inside pay 2")
        
        await Client.create(client)
        .then(async data => {
  
          const foundCompte = await Compte.findOne({
            where: { noCompte: accountNumber , actif: true}
        });

      const oldSolde = foundCompte.get('solde');

      await Compte.update({solde: oldSolde + linkAmount}, {where: {noCompte: accountNumber}})

      cb ?  res.redirect(cb) : res.status(200).json({msg: "Paiement effectué"})
    })
    .catch(error => {
      if (error instanceof momo.MtnMoMoError) {
       const err = getFriendlyErrorMessage(error)
        res.json({err});
      }
      next(error);
  })
})

function getFriendlyErrorMessage(error) {
  if (error instanceof MoMo.NotEnoughFundsError) {
    return "You have insufficient balance";
  }

  // Other error messages go here

  return "Something went wrong";
}

})

module.exports = router