'use strict'

let parser = require('./auth_header').parser
let verify = require('./manager_jwt')


let handler = (key, verification_options, signing_options) => {
    return (req, res, next) => {
        if ((token = isValid(req.headers.authorization)) !== null) {
          verify(token.value,key).then((result) =>{
            res.end(JSON.stringify(result))
          }).catch((err) => {
            res.status(500).end(JSON.stringify({status:"error",message:"Internal Error",error_type:"GeneralException"}))
          })
        } else {
          res.status(400).end(JSON.stringify({status:"error",message:"Wrong Token",error_type:"TokenException"}))
        }
    }
}


let isValid = (header) => {
    return parser(header)
}

module.exports = handler
