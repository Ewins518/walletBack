const db = require("../models");
const Compte = db.Compte
const Momo = db.CompteMomo
const momo = require('mtn-momo');
require("dotenv").config();
const poll = require('./poll')

exports.rechargerCompte = async (req, res, next) => {

const { Collections, Disbursements } = momo.create ({
    callbackHost: " http://aee51d212026.ngrok.io "
})

const collections = Collections ({
    userSecret: process.env.COLLECTIONS_USER_SECRET,
    userId: process.env.COLLECTIONS_USER_ID,
    primaryKey: process.env.COLLECTIONS_PRIMARY_KEY
})


const disbursements = Disbursements ({
    userSecret: process.env.DISBURSEMENTS_USER_SECRET,
    userId: process.env.DISBURSEMENTS_USER_ID,
    primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
})

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
            where: { userID: req.params.id }
        });

        if(getCompte){
            console.log("inside collections");
            collections
                .requestToPay({
                  amount: recharge["montant"],
                  currency: "EUR",
                  externalId: "123456",
                  payer: {
                    partyIdType: momo.PayerType.MSISDN,
                    partyId: recharge['phone']
                  },
                  payerMessage: "testing",
                  payeeNote: "hello"
                })
                .then(async transactionId => poll.poll(() => collections.getTransaction(transactionId)))
                .then(async () => {

                console.log(res.statusCode)
                if(res.statusCode === 200 || res.statusCode === 200) {
    
                        const oldSolde = getCompte.get('solde');
    
                         await Compte.update({ solde: oldSolde + parseInt(req.body.montant) },
                            { where: { noCompte: getCompte.get('noCompte')} }).then(data => {
                           
                                res.status(200).json("Compte rechargé")
                                //res.send(data)
                                console.log("Compte rechargé");
                                
                               
                            });
                            
                        }
                
                })
            .catch(error => {
                if (error instanceof momo.MtnMoMoError) {
                  res.send(getFriendlyErrorMessage(error));
                }
                next(error);
            })
     }

     else 
        res.status(404).send("Number not registered");
    }
    
    catch(e) {
        res.status(500).send(e);
    }  

    function getFriendlyErrorMessage(error) {
        if (error instanceof MoMo.NotEnoughFundsError) {
          return "You have insufficient balance";
        }
      
        // Other error messages go here
      
        return "Something went wrong";
      }

}
