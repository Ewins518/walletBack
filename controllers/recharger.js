const db = require("../models");
const Compte = db.Compte
const Transaction = db.Transac
const momo = require('mtn-momo');
require("dotenv").config();
const poll = require('./poll')
const Momo = require('../config/mobileMoney')

exports.rechargerCompte = async (req, res, next) => {

//const { Collections, Disbursements } = momo.create ({
//    callbackHost: "https://ultraypay.herokuapp.com/",
//    environment: "production",
//    baseUrl : "https://ericssondeveloperapi.portal.azure-api.net/"
//})
//
//const collections = Collections ({
//    userSecret: process.env.COLLECTIONS_USER_SECRET,
//    userId: process.env.COLLECTIONS_USER_ID,
//    primaryKey: process.env.COLLECTIONS_PRIMARY_KEY
//})
//
//
//const disbursements = Disbursements ({
//    userSecret: process.env.DISBURSEMENTS_USER_SECRET,
//    userId: process.env.DISBURSEMENTS_USER_ID,
//    primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
//})
//
    if (!req.body.montant || !req.body.phone) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const recharge = {
        montant: req.body.montant ,
        phone: req.body.phone 
    };

    try {
        const getCompte = await Compte.findOne({
            where: { userID: req.decoded.userId }
        });

        if(getCompte){
            console.log("inside collections");
            Momo.collections
                .requestToPay({
                  amount: "100",
                  currency: "XOF",
                  externalId: "123456",
                  payer: {
                    partyIdType: momo.PayerType.MSISDN,
                    partyId: "22962765653"
                  },
                  payerMessage: "testing",
                  payeeNote: "hello"
                })
                .then(async transactionId => poll.poll(() => Momo.collections.getTransaction(transactionId)))
                .then(async () => {

                console.log(res.statusCode)
                if(res.statusCode === 201 || res.statusCode === 200) {
    
                        const oldSolde = getCompte.get('solde');
                        const userAccount = getCompte.get('noCompte')

                         await Compte.update({ solde: oldSolde + parseInt(req.body.montant) },
                            { where: { noCompte: userAccount} })
                            .then(async () => {
                                
                                const virement = {
                                    userID: req.decoded.userId,
                                    montant: req.body.montant,
                                    compte_id: parseInt(req.body.phone),
                                    isRecharge: true      
                                };
                                 
                                await Transaction.create(virement)
                                .then(() => {
                                    res.status(200).json({ message: 'Compte rechargé avec succès' })
                                })
                                .catch(error => res.status(500).json({ error }))
                                
                               
                            });
                            
                        }
                
                })
            .catch(error => {

                if (error instanceof momo.MtnMoMoError) {
                    if (error instanceof momo.PayerNotFoundError) {
                        return res.status(403).json({error: "Le numéro entré n'a pas un compte mobile money"});
                       }
                    if (error instanceof momo.NotEnoughFundsError) {
                       return res.status(401).json({error: "Solde insuffisant sur votre compte mobile"});
                      }
                 return res.status(500).json({error});
                }
                next(error);
            })
     }

     else 
        res.status(404).json({error :"Account not found"});
    }
    
    catch(e) {
        res.status(500).json({error: e});
    }  

    function getFriendlyErrorMessage(error) {
        if (error instanceof momo.NotEnoughFundsError) {
          return "You have insufficient balance";
        }
      
        // Other error messages go here
      
        return "Something went wrong";
      }

}


exports.allrecharge = async (req, res) => {
    var tab = {};
    var allData = []
    let i = 0;
    await Transaction.findAll({
        attributes: ["compte_id", "montant", "createdAt"],
        where: { userID: req.decoded.userId , isRecharge: true}
    }).then(async result => {

        if(result.length == 0)
            return res.status(403).json({allData})
            
        result.forEach ( async comp => {
       
                tab["numero"] = comp.compte_id,
                tab["montant"] = comp.montant,
                tab["date"] = comp.createdAt.toISOString().replace(/T/,' ').replace(/\..+/,''),
                  
               i++
               allData.push(tab)
               tab = {}
                if(i == result.length)
                    res.status(200).send({allData})
            })
            
    })
    
}
