const jwt = require('jsonwebtoken')
const config = require('./config')

const checkToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    console.log(token)
    //token = token.slice(7, token.length)
    
    if(token){
        jwt.verify(token,config.key,(err, decoded) => {
            if(err){
                return res.json({
                    status: false,
                    msg: "token is invalid",
                })
            }
            else{
                    req.decoded = decoded
                    next()
            }
        })
    }

    else{
        return res.json ({ 
            status: false,
            msg: "Token is not provided",
    })

    }
}

const generateToken = (req, res, next) => {

    if (!req.body.apiKey) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

   const token = jwt.sign({apiKey: req.body.apiKey},config.key, {
        expiresIn: "24h"
    })
    
        res.status(200).send({token: token})
   
}

module.exports = {
    checkToken: checkToken,
    generateToken:generateToken,
}