const { FedaPay, Transaction } = require('fedapay')
const {parse, stringify} = require('flatted');

exports.fedaTrans = async (req, res) => {

try{
FedaPay.setApiKey("sk_live_psSrFPKyDhBRm4N2lYJPBkLT");
FedaPay.setEnvironment('live'); 

const recharge = {
   
    description: 'Description',
    amount: 150,
    callback_url: 'https://ultrapay.herokuapp.com',
    currency: {
        iso: 'XOF'
    },
    customer: {
        firstname: 'Ewins',
        lastname: 'Roméo',
        email: 'sbred518@gmail.com',
        phone_number: {
            number: '+22962765653',
            country: 'BJ'
        }
    }
  }
stringify(recharge)
const stat = false;

const transaction = await Transaction.create(recharge)
const token = (await transaction.generateToken()).token
console.log("token ",token)
const mode = 'mtn';
stringify(token)
await transaction.sendNowWithToken(mode, token)
.then( status => {
    console.log(status)
    console.log(transaction.status)
    
})

console.log("verification");
//const trans  = await Transaction.retrieve(transaction.id)

while(transaction.status !== "pending"){
  
   const trans = await Transaction.retrieve(transaction.id);
    
     if (trans.status == "declined") {
        console.log("solde insuffisant");
    }
}
  

}catch(e){
    res.send(e)
}
}