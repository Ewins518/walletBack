const db = require("../models");
const User = db.User
const Compte = db.Compte
const JWT = require('jsonwebtoken');
const config = require('../config/config');

signToken = user => {
    return JWT.sign({userId: user.id},config.key, {
        expiresIn: "24h"
    });
}

module.exports = {
    signUp: async (req, res, next) => {
        const name = req.body.name;
        const email=req.body.email;
        const password=req.body.password;
        // Check if there is a user with the same email
        let foundUser = await User.findOne({ where: {"email": email}});
        if (foundUser) {
            return res.status(403).json({ error: 'Email is already in use' });
        }

        if (!foundUser ) {
            // Let's merge them?
            
           const newUser = {
                email: email,
                name:name,
                password: password
            };
            await User.create(newUser)
                .then(async user => {
                    // Generate the token
                  //  const token = signToken(user);

                    // Respond with token

                   await Compte.create({userID: user.id})
                    .then(() => {
                                      
                    res.status(200).json({
                        msg: "Compte créé ",
                        //token: token
                    });
                })                  
                    
                })
                .catch(err => {
                    res.status(500).send({
                       error:
                            err.message || "Some error occurred while creating the User."
                    });
                });
            
        }

    },

    signIn: async (req, res, next) => {
        User.findOne({where: { email: req.body.email }})
        .then( user => {
    
            if(!user){
                return res.status(401).json({ error: 'Utilisateur non trouvé'});
            }
            if(user.password===req.body.password){
    
               let token = signToken(user)
                res.json({
                    userId: user.id,
                    token: token,
                    msg: "success,"
                })
            }
            else{
                res.status(403).json("Password is incorrect")
            }
        })
    }
}

//const createUser = (req, res) => {
//
//    // Validate request
//    if (!req.body.username || !req.body.email || !req.body.password) {
//        res.status(400).send({
//            message: "Content can not be empty!"
//        });
//        return;
//    }
//
//    // Create a User
//    const user = {
//        name: req.body.username,
//        email: req.body.email,
//        password: req.body.password      
//    };
//
//    //Create user'compte
//    
//    // Save User in the database
//    User.create(user)
//        .then(data => {
//            
//            res.send(data);
//            console.log("user registered ",data.id);
//
//            Compte.create({userID: data.id}).then(data1 => {
//                res.send(data1)
//                console.log("numero de compte",data1.noCompte);
//                res.status(200).json("ok");
//            })
//        })
//
//};
//
//
//
//module.exports = {
//    createUser,
//}