const express = require('express')
const transaction = require('../controllers/transaction')
const compte = require('../controllers/compte')
const recharge = require('../controllers/recharger')
const rechargeWf = require('../controllers/rechargeWithFeda')
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
const { Sequelize } = require('sequelize')

const { Collections, Disbursements } = momo.create({
  callbackHost: "https://ultrapay.herokuapp.com/",
  environment: "production",
  baseUrl : "https://ericssondeveloperapi.portal.azure-api.net/"
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

router.route('/rechargefeda').post(middleware.checkToken,rechargeWf.rechargerWithFeda)

router.route('/number').get(middleware.checkToken,compte.accountNumber)

router.post('/renverser',middleware.checkToken, async (req, res) => {
  
    const getAccount = await Compte.findOne({where: {userID: req.decoded.userId}})
    await Momo.findOne({where: { noTel: req.body.tel, compteID: getAccount.get('noCompte')}})

    .then(async getMomoAccount => {

    var tab = {};
    var allData = []
    const now = new Date();
    var dat = date.format(now, 'YYYY/MM/DD HH:mm:ss'); 

   if(getMomoAccount){
 
    const renverse = {
      noTel: req.body.tel,
      montant: req.body.montant
    }
  
    tab["noTel"] = req.body.tel,
    tab["montant"] = parseInt(req.body.montant),
    tab["date"] = dat
  
    if(req.body.montant <= getAccount.get('solde')){
      
    disbursements.transfer({
      amount: renverse['montant'],
      currency: "EUR",
      externalId: "12578",
      payee: {
        partyIdType: momo.PayerType.MSISDN,
        partyId: renverse["noTel"]
      },
      payerMessage: "testing",
      payeeNote: "hello"
    })
    .then(disbursementId => poll.poll(() => disbursements.getTransaction(disbursementId)))
      .then(async () => {
       
     getMomoAccount.montantRenverser.push(tab)

      await Momo.update({
        montantTotalRenverser: getMomoAccount.montantTotalRenverser + parseInt(renverse['montant']),
        montantRenverser:  getMomoAccount.montantRenverser
      },
       {where: {id: getMomoAccount.id}})
  
      const oldSolde = getAccount.get('solde');
  
      await Compte.update({solde: oldSolde - parseInt(renverse['montant'])}, {where: {noCompte: getAccount.get('noCompte')}})
  
      res.status(200).json({msg: "Renversement effectué"})
    })
    .catch(error => {

      if (error instanceof momo.MtnMoMoError) {
          if (error instanceof momo.PayeeNotFoundError) {
              return res.status(403).json({error: "Le numéro entré n'a pas un compte mobile money"});
             }
          if (error instanceof momo.NotEnoughFundsError) {
             return res.status(403).json({error: "Une erreur interne, réesayer plus tard"});
            }
       return res.status(500).json({error: "Something went wrong" });
      }
      next(error);
  })
  
    } else {
      res.status(400).json({msg: "Solde insuffisant"})
    }
  
   }  else {
    res.status(404).json({msg: "Ce compte momo n'est pas relié à votre portefeuille"})
  }
  
  })
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
      if(result == null)
      return res.status(200).json({result : 0})

      res.status(200).json({result})
    })
    .catch(error => res.status(500).json({ error }))
  })


module.exports =  router
 