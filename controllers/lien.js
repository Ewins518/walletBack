const db = require("../models");
const User = db.User
const Compte = db.Compte
const Lien = db.Lien


exports.createLink = async (req, res) => {

     // Validate request
     if (!req.body.montant || !req.body.desc) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    //create the link
    const link = {
        montant: req.body.montant,
        Description: req.body.desc,
        compteID: null,
        url: "http://localhost:3300/user/",
    }

    try{

        //chercher le compte de l'utilisateur
        const userAccount = await Compte.findOne({
            where: { userID: req.params.id , actif: true}
        });

        if(userAccount){
            const numCompte = await userAccount.get('noCompte');
            link["compteID"] = numCompte

            await Lien.create(link).then(data => {

                res.status(200).json({
                    lien_de_paiment: data.url
                });
            })
        }
        else {
            res.status(404).json({
                msg: "Account not found or disabled"
            });
        }


    } catch(e) {

    }
}