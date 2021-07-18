const db = require("../models");
const Momo = db.CompteMomo
const Compte = db.Compte
const User = db.User

exports.addMomo = async (req, res) => {
    console.log('Inside adding momo');

    // Validate request
    if (!req.body.tel) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a momoCompte
    const momo = {
        CompteID: null,
        noTel: req.body.tel      
    };

        
    // Save compteMomo in the database and actif compte
    try{
            console.log('inside adding...........');
           
                const searchUser = await User.findOne({ where: { name: req.params.username} });
                
                if (searchUser) {
                    const user_id = searchUser.get('id')

                    const searchCompte = await Compte.findOne({ where: { userID: user_id } });

                    if (searchCompte) {
                
                    const numCompte = searchCompte.get('noCompte');

                    console.log('inside activing.......');

                        momo['CompteID'] = numCompte
                   
                        await Momo.create(momo).then(data1 => {
                       
                        res.send(data1)
                        console.log("compte momo ajouter au compte ",searchCompte.get('noCompte'));
                       // res.status(200).json("ok");
                       
                    })
                    await Compte.update({ actif: true }, { where: { noCompte: numCompte } });

  

                 }
                 
                }
                else { res.status(404).send("User Not Found"); }
            }catch (e) {
                res.status(500).send(e);
            }  
            
};