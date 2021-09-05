const db = require("../models");
const Compte = db.Compte
const Transac = db.Transac
const momo = require('mtn-momo');
require("dotenv").config();
const poll = require('./poll')
const { FedaPay, Transaction } = require('fedapay')
const {parse, stringify} = require('flatted');

exports.rechargerWithFeda = async (req, res, next) => {
    FedaPay.setApiKey("sk_live_kooD2JD9FNEMycwm51fC4M8E");
    FedaPay.setEnvironment('live'); 

    if (!req.body.montant || !req.body.phone) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

   // const recharge = {
   //     montant: req.body.montant ,
   //     phone: req.body.phone 
   // };

    try {
        const getCompte = await Compte.findOne({
            where: { userID: req.decoded.userId }
        });

        if(getCompte){
            
            const rechargeFeda = {
   
                description: 'Description',
                amount: parseInt(req.body.montant),
               // callback_url: 'https://ultrapay.herokuapp.com/',
                currency: {
                    iso: 'XOF'
                },
                customer: {
                    firstname: 'Ewins',
                    lastname: 'Dame',
                    email: 'sbred518@gmail.com',
                    phone_number: {
                        number: req.body.phone,
                        country: 'BJ'
                    }
                }
              }
             
          stringify(rechargeFeda)
            
            const transaction = await Transaction.create(rechargeFeda)
            
            const token = (await transaction.generateToken()).token
            console.log("token ",token)
            const mode = 'mtn';
            await transaction.sendNowWithToken(mode, token)
            .then(async transactionId => 

             poll.poll(() => Transaction.retrieve(transaction.id))
            )
            .then(async () => {
                console.log("status", transaction.status)
                const transaction2 = await Transaction.retrieve(transaction.id);
                console.log(transaction2.status)

                if (transaction2.status == "declined") {
                    console.log("solde insuffisant");
                   return res.status(201).json({ message: "solde insuffisant" })
                }
 
                if (transaction2.status == "canceled") {
                    console.log("Vous avez annulé la transaction");
                   return res.status(200).json({ message: "Vous avez annulé la transaction" })
                }
                if (transaction2.status == "approved") {
                    console.log("virement effectué");

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
                                 
                                await Transac.create(virement)
                                .then(() => {
                                    res.status(200).json({ message: 'Compte rechargé avec succès' })
                                })
                            })
                   //return res.status(200).json({ message: "Vous avez annulé la transaction" })
                }
                if (transaction2.status == "pending") {
                    console.log("En attente");
                   return res.status(200).json({ message: "En attente" })
                }
            })
        
    }
    }
    catch(e) {
        res.status(500).send(e);
    } 
}