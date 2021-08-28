const db = require("../models");
const User = db.User
const Compte = db.Compte
const Transaction = db.Transac
const Momo = db.CompteMomo

exports.createTransac = async (req, res) => {
    console.log('Inside transaction');

    // Validate request
    if (!req.body.montant || !req.body.noCompte) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    try{

        await Compte.findOne({
            where: { userID: req.decoded.userId , actif: true}
        })
        .then(async userAccount => {

            if(parseInt(req.body.montant) > userAccount.solde)
                return res.status(403).json({ error: 'Solde insuffisant pour effectuer la transaction' });
            
            await Compte.findOne({
                where: { noCompte: req.body.noCompte , actif: true}
            }).then(async beneficiaryAccount => {

                if(beneficiaryAccount){
                    const oldSolde = beneficiaryAccount.solde;

                    await Compte.update({ solde: oldSolde + parseInt(req.body.montant) },
                        { where: { noCompte: req.body.noCompte } })

                    await Compte.update({ solde: userAccount.solde - parseInt(req.body.montant) },
                        { where: { noCompte: userAccount.noCompte } })    
                        .then(async () => {


                            const virement = {
                                userID: req.decoded.userId,
                                montant: req.body.montant,
                                compte_id: parseInt(req.body.noCompte)      
                            };
                             
                            await Transaction.create(virement)
                            .then(() => {
                                res.status(200).json({ message: 'Virement effectué' })
                            })
                            .catch(error => res.status(500).json({ error }))
                        })
                        .catch(error => res.status(500).json({ error }))
                }
                else
                     return res.status(403).json({ error: "Le numéro de compte est incorrect ou le compte du bénéficiaire n'est pas actif" });
            
            })
            .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))

            }catch (e) {
                res.status(500).send(e);
            }  
            
};

exports.allSendTransaction = async (req, res) => {
    var tab = {};
    var allData = []
    let i = 0;
    await Transaction.findAll({
        attributes: ["compte_id", "montant", "createdAt"],
        where: { userID: req.decoded.userId , isRecharge: false}
    }).then(async result => {

        if(result.length == 0)
         return res.status(403).send({allData})

        result.forEach ( async comp => {
       
        await Compte.findOne({where: {noCompte: comp.compte_id}})
        .then(async compte => {
            await User.findOne({where: {id: compte.userID}})
            .then(user => {
                tab["username"] = user.name,
                tab["montant"] = comp.montant,
                tab["date"] = comp.createdAt.toISOString().replace(/T/,' ').replace(/\..+/,''),
                tab["nature"] = "Envoyé"
                  
               i++
               allData.push(tab)
               tab = {}
                if(i == result.length)
                    res.status(200).send({allData})
            })
            
           })
             
        })

    })
    
}


exports.allReceiveTransaction = async (req, res) => {
    var tab = {};
    var allData = []
    let i = 0;
    await Compte.findOne({where :{userID: req.decoded.userId}})
    .then(async data => {

    await Transaction.findAll({
        attributes: ["compte_id", "montant", "createdAt", "userID"],
        where: { compte_id: data.noCompte , isRecharge: false}
    }).then(async result => {

        if(result.length == 0)
            return res.status(403).send({allData})

        result.forEach ( async comp => {
       
            await User.findOne({where: {id: comp.userID}})
            .then(user => {
                tab["username"] = user.name,
                tab["montant"] = comp.montant,
                tab["date"] = comp.createdAt.toISOString().replace(/T/,' ').replace(/\..+/,''),
                tab["nature"] = "Reçu"
                  
               i++
               allData.push(tab)
               tab = {}
                if(i == result.length)
                    res.status(200).send({allData})
            })
            
           })
             
        })
    
    })
    
}

exports.allRenversement = async (req, res) => {
    var allData = []
    
    await Compte.findOne({
        where: { userID: req.decoded.userId }
    }).then(async result  => {

        await Momo.findOne({where: {compteID: result.noCompte}})
        .then(async data => {

            if(data.montantRenverser == null)
            return res.status(403).send({Renversement: allData})

               res.status(200).send({Renversement: data.montantRenverser})
            })
            
             
        })

    
}
