module.exports = {
    HOST: "ec2-44-196-8-220.compute-1.amazonaws.com",
    PORT: "5432",
    USER: "lzubvniygddmhj",
    PASSWORD: "8ef2bc9d0bef4a34ea5511b28269955ca12b2955ed6a9fab4815e6abd4355732",
    DB: "d1cpne62oir63",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

//const env = {
//    database: 'd1cpne62oir63',
//    username: 'lzubvniygddmhj',
//    password: '8ef2bc9d0bef4a34ea5511b28269955ca12b2955ed6a9fab4815e6abd4355732',
//    host: 'ec2-44-196-8-220.compute-1.amazonaws.com',
//    port: 5432,
//    dialect: 'postgres',
//    pool: {
//        max: 5,
//        min: 0,
//        acquire: 30000,
//        idle: 10000
//    }
//  };
//   
//  module.exports = env;