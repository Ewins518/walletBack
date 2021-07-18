const db = require("../models");
const User = db.User
const Compte = db.Compte

const createUser = (req, res) => {
    console.log('Inside registration');

    // Validate request
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a User
    const user = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password      
    };

    //Create user'compte
    
    // Save User in the database
    User.create(user)
        .then(data => {
            
            res.send(data);
            console.log("user registered ",data.id);

            Compte.create({userID: data.id}).then(data1 => {
                res.send(data1)
                console.log("numero de compte",data1.noCompte);
                res.status(200).json("ok");
            })
        })

};



module.exports = {
    createUser,
}