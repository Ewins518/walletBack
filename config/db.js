//module.exports = {
//    HOST: "ec2-44-196-8-220.compute-1.amazonaws.com",
//    PORT: "5432",
//    USER: "lzubvniygddmhj",
//    PASSWORD: "8ef2bc9d0bef4a34ea5511b28269955ca12b2955ed6a9fab4815e6abd4355732",
//    DB: "d1cpne62oir63",
//    dialect: "postgres",
//    pool: {
//        max: 5,
//        min: 0,
//        acquire: 30000,
//        idle: 10000
//    }
//}

module.exports = {
    HOST: "localhost",
    PORT: "5432",
    USER: "ewins",
    PASSWORD: "ewins",
    DB: "wallet",
    dialect: "postgres",
    pool: {
               max: 5,
               min: 0,
               acquire: 30000,
               idle: 10000
           }

  };
  