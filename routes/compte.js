const express = require('express')
const transaction = require('../controllers/transaction')
const compte = require('../controllers/compte')
const recharge = require('../controllers/recharger')
const router = express.Router()
const momo = require('mtn-momo');
const db = require("../models");
const Compte = db.Compte
const Momo = db.CompteMomo
const Transaction = db.Transac
const bodyParser = require('body-parser')
require("dotenv").config();
const poll = require('../controllers/poll')
const middleware = require('../config/middleware')
const date = require('date-and-time');

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


router.route('/transaction').post(middleware.checkToken,transaction.createTransac)

router.route('/getsendtransaction').get(middleware.checkToken,transaction.allSendTransaction)

router.route('/getrecharge').get(middleware.checkToken,recharge.allrecharge)

router.route('/getreceivetransaction').get(middleware.checkToken,transaction.allReceiveTransaction)

router.route('/getrenversement').get(middleware.checkToken,transaction.allRenversement)

router.route('/addcompte').post(middleware.checkToken,compte.addMomo)

router.route('/getallmomo').get(middleware.checkToken,compte.allmomoAccount)

router.route('/recharge').post(middleware.checkToken,recharge.rechargerCompte)


router.post('/renverser',middleware.checkToken, async (req, res) => {
  
    const getAccount = await Compte.findOne({where: {userID: req.decoded.userId}})
    const getMomoAccount = await Momo.findOne({where: { compteID: getAccount.get('noCompte')}})
    var tab = {};
    var allData = []
    const now = new Date();
    var dat = date.format(now, 'YYYY/MM/DD HH:mm:ss'); 

   if(getMomoAccount){
  
    const renverse = {
      noTel: req.body.tel,
      montant: req.body.montant
    }
   getMomoAccount.get('montantRenverser') ? allData = getMomoAccount.get('montantRenverser') : allData = []
  
    tab["noTel"] = req.body.tel,
    tab["montant"] = parseInt(req.body.montant),
    tab["date"] = dat
  
    if(req.body.montant <= getAccount.get('solde')){
      
    disbursements.transfer({
      amount: renverse['montant'],
      currency: "EUR",
      externalId: "12578",
      payee: {
        partyIdType: "MSISDN",
        partyId: renverse["noTel"]
      },
      payerMessage: "testing",
      payeeNote: "hello"
    })
    .then(disbursementId => poll.poll(() => disbursements.getTransaction(disbursementId)))
      .then(async () => {
       
       allData.push(tab)
     
      await Momo.update({
        montantTotalRenverser: getMomoAccount.get('montantTotalRenverser') + parseInt(renverse['montant']),
        montantRenverser: allData,
      },
       {where: {id: getMomoAccount.get('id')}})
  
      const oldSolde = getAccount.get('solde');
  
      await Compte.update({solde: oldSolde - parseInt(renverse['montant'])}, {where: {noCompte: getAccount.get('noCompte')}})
  
      res.status(200).json({msg: "Renversement effectué"})
    })
    .catch(error => {
      res.json(error)
  })
  
    } else {
      res.status(400).json({msg: "Solde insuffisant"})
    }
  
   }  else {
    res.status(404).json({msg: "Ce compte momo n'est pas relié à votre portefeuille"})
  }
  
  })


router.get("/solde", middleware.checkToken,async (req, res) => {

    await Compte.findOne({where: {userID: req.decoded.userId}})
    .then(getAccount => {
      res.status(200).json({solde: getAccount.solde})
    })
    .catch(error => res.status(500).json({ error }))
  })

router.get("/montantrecharge",middleware.checkToken, async (req, res) => {

    await Transaction.sum('montant',{where: {userID: req.decoded.userId,isRecharge: true}})
    .then(result => {
      res.status(200).json({result})
    })
    .catch(error => res.status(500).json({ error }))
  })

  module.exports = router