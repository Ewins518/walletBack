const db = require("../models");
const Momo = db.CompteMomo
const Compte = db.Compte
const User = db.User

exports.addMomo = async (req, res) => {

    // Validate request
    if (!req.body.tel) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a momoCompte
    const momo = {
        compteID: null,
        noTel: req.body.tel      
    };

        
    // Save compteMomo in the database and actif compte
    try{
           
                const searchUser = await User.findOne({ where: { id: req.decoded.userId} });
                
                if (searchUser) {
                    const user_id = searchUser.get('id')

                    const searchCompte = await Compte.findOne({ where: { userID: user_id } });

                    if (searchCompte) {
                
                    const numCompte = searchCompte.get('noCompte');

                        momo['compteID'] = numCompte
                   
                        await Momo.create(momo).then(data => {
                       
                        res.status(200).json({msg: "Le numero " + data.noTel +" est lié desormais a votre compte ",});
                       
                    })
                  //  await Compte.update({ actif: true }, { where: { noCompte: numCompte } });

                 }
                 
                }
                else { res.status(404).send("User Not Found"); }
            }catch (e) {
                res.status(500).send(e);
            }  
            
}


exports.allmomoAccount = async (req, res) => {
    var tab = {};
    var allData = []
    let i = 0;
    await Compte.findOne({where: {userID: req.decoded.userId }})
    .then(async data => {

        await Momo.findAll({
            attributes: ["noTel", "montantTotalRenverser"],
            where: { compteID: data.noCompte }
        }).then(async result => {
            
            if(result.length == 0)
                return res.send(403).json({allData})
                
            result.forEach ( async comp => {
           
                    tab["phone"] = comp.noTel,
                    tab["montant"] = comp.montantTotalRenverser,
                      
                   i++
                   allData.push(tab)
                   tab = {}
                    if(i == result.length)
                        res.status(200).send({allData})
                })
                
        })
    })

    
}

exports.accountNumber = async (req, res) => {

    await Compte.findOne({where: {userID: req.decoded.userId }})
    .then(async data => {
        res.status(200).json({noCompte: data.noCompte})
     
    })

    
}
