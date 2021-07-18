const db = require("../models");
const User = db.User
const Compte = db.Compte
const Transaction = db.Transac

exports.createTransac = async (req, res) => {
    console.log('Inside transaction');

    // Validate request
    if (!req.body.montant || !req.body.noCompte) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a User
    const virement = {
        userID: req.params.id,
        montant: req.body.montant,
        compte_id: parseInt(req.body.noCompte)      
    };

    
    // Save transaction in the database and update solde
    try{
            console.log('inside update');
           
            // s'assurer que le compte est actif avant d'effectuer la transaction
                const compteCollection = await Compte.findOne({
                    where: { noCompte: req.body.noCompte , actif: true}
                });
                
                if (compteCollection) {
                    console.log('inside collection');

                    const oldSolde = compteCollection.get('solde');

                    const effVirement = await Compte.update({ solde: oldSolde + req.body.montant },
                        { where: { noCompte: req.body.noCompte } });

                        await Transaction.create(virement).then(data1 => {
                        res.send(data1)
                        console.log("numero de compte",data1.noCompte);
                        res.status(200).json("ok");
                    })
                    res.status(201).send({ msg: "Virement effectué avec sur le compte " + compteCollection.get('noCompte') })

                }
                else { res.status(404).send("Compte Not Found"); }
            }catch (e) {
                res.status(500).send(e);
            }  
            
};