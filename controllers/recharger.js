const db = require("../models");
const Compte = db.Compte
const Momo = db.CompteMomo
const momo = require('mtn-momo');

exports.rechargerCompte = async (req, res, next) => {

const { Collections, Disbursements } = momo.create ({
    callbackHost: " http://0049550c592c.ngrok.io "
})

const collections = Collections ({
    userSecret: "d927779c78914946996d4489331d9f59",
    userId: "9d0b0cb6-ddec-43d3-b742-9b12e92e1031",
    primaryKey: "2af99205bba84d34be7bcfc8e4e1f736"
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
        const verifNum = await Momo.findOne({
            where: { noTel: req.body.phone }
        });

        if(verifNum){
            console.log("inside verifNum");
            collections
                .requestToPay({
                  amount: recharge["montant"],
                  currency: "EUR",
                  externalId: "123456",
                  payer: {
                    partyIdType: momo.PayerType.MSISDN,
                    partyId: "+22962765653"
                  },
                  payerMessage: "testing",
                  payeeNote: "hello"
                })
                .then(async transactionId => {
                console.log(collections.getTransaction(transactionId))
                
                if(res.status === 200) {
    
                        const numCompte = verifNum.get('CompteID')
                        const getCompte = await Compte.findOne({ where: { CompteID: numCompte } });
    
                        if (searchCompte) {
    
                        const oldSolde = getCompte.get('solde');
    
                         await Compte.update({ solde: oldSolde + req.body.montant },
                            { where: { noCompte: numCompte } }).then(data => {
                           
                                res.send(data)
                                console.log("Compte rechargé");
                               // res.status(200).json("ok");
                            });
                        }
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

      function poll(fn) {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            return fn()
              .then(resolve)
              .catch(reject)
              .finally(() => clearInterval(interval));
          }, 5000);
        });
      }
}