const express = require('express')
const link = require('../controllers/lien')
const user = require('../controllers/users')
const transaction = require('../controllers/transaction')
const compte = require('../controllers/compte')
const recharge = require('../controllers/recharger')
const router = express.Router()
const fedapay = require('../controllers/fedapay')
const momo = require('mtn-momo');
const db = require("../models");
const Client = db.Client
const Compte = db.Compte
const Momo = db.CompteMomo
const Lien = db.Lien
const Transaction = db.Transac
const bodyParser = require('body-parser')
var idLink, linkAmount, accountNumber, cb;
require("dotenv").config();
const poll = require('../controllers/poll')
const middleware = require('../config/middleware')
const User = db.User

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

router.route('/token').get(middleware.generateToken)

router.route('/register').post(user.signUp)

router.route('/login').post(user.signIn)

router.route('/transaction').post(middleware.checkToken,transaction.createTransac)

router.route('/gettransaction').get(middleware.checkToken,transaction.allTransaction)

router.route('/getrenversement').get(middleware.checkToken,transaction.allRenversement)

router.route('/getlinkusers').get(middleware.checkToken,link.allLinkUser)

router.route('/paymentlink').post(middleware.checkToken,link.createLink)

router.route('/sitweblink').post(middleware.checkToken,link.createWebSitLink)

router.route('/addcompte').post(middleware.checkToken,compte.addMomo)

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
router.get("/get/balance", (req, res, next) =>
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

router.route('/recharge').post(middleware.checkToken,recharge.rechargerCompte)

//router.route('/fedapay').post(fedapay.fedaTrans)

router.post('/renverser',middleware.checkToken, async (req, res) => {
  
  const getAccount = await Compte.findOne({where: {userID: req.decoded.userId}})
  const getMomoAccount = await Momo.findOne({where: {noTel: req.body.tel, compteID: getAccount.get('noCompte')}})
  var tab = {};
  var allData = []
 if(getMomoAccount){

  const renverse = {
    noTel: req.body.tel,
    montant: req.body.montant
  }
 getMomoAccount.get('montantRenverser') ? allData = getMomoAccount.get('montantRenverser') : allData = []

  tab["noTel"] = req.body.tel,
  tab["montant"] = parseInt(req.body.montant),
  tab["date"] = Date.now()

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
      console.log(allData)
      console.log(tab) 
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

router.get("/usermail",middleware.checkToken, async (req, res) => {

  await User.findOne({where: {id: req.decoded.userId}})
  .then(result => {
    res.status(200).json({email: result.email})
  })
  .catch(error => res.status(500).json({ error }))
})


module.exports = router