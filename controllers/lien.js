const db = require("../models");
const User = db.User
const Compte = db.Compte
const Lien = db.Lien
const Client = db.Client

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
        callbackUrl: req.body.callback,
        compteID: null,
        url: "https://ultrapay.herokuapp.com/link/",
    }

    try{
        console.log("inside creation de lien")
        //chercher le compte de l'utilisateur
        const userAccount = await Compte.findOne({
            where: { userID: req.decoded.userId , actif: true}
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
                msg: "Account disabled"
            });
        }


    } catch(e) {

    }
}


exports.createWebSitLink = async (req, res) => {

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
       callbackUrl: req.body.callback,
       compteID: null,
       url: "https://ultrapay.herokuapp.com/link/",
   }

   try{
       console.log("inside creation de lien pour un site web")
       //chercher le compte de l'utilisateur
       const userAccount = await Compte.findOne({
           where: { apiKey: req.decoded.apiKey , actif: true}
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
               msg: "Account disabled"
           });
       }


   } catch(e) {

   }
}


exports.allLinkUser = async (req, res) => {
    var tab = {};
    var allData = []
    let i = 0;
    let j = 0;
    await Compte.findOne({
        where: { userID: req.decoded.userId , actif: true}
    }).then(async result => {

        await Lien.findAll({
            attributes: ["Description", "montant", "id"],
            where: {compteID: result.noCompte}
        }) 
        .then(async data => {

            if(data.length == 0)
            return res.status(403).json({allData})

            data.forEach(async data01 => {
                await Client.findAll({
                    attributes: ["name", "createdAt"],
                    where: {lienID: data01.id}
                })
                .then(async data02 => {

                    if(data02.length == 0)
                        return res.status(403).json({allData})

                    j++
                    i = 0
                    data02.forEach(async data03 => {

                        tab["username"] = data03.name,
                        tab["montant"] = data01.montant,
                        tab["date"] = data03.createdAt.toISOString().replace(/T/,' ').replace(/\..+/,' '),
                        tab["desc"] = data01.Description
                  
                        i++
                        allData.push(tab)
                        tab = {}
                         if(j== data.length && i == data02.length)
                             res.status(200).send({allData})
                    })
                })
            })
        })
})
}