/*!
 * jwt-selfissuer
 * Copyright(c) 2017 Jose Antonio Gonzalez Robles
 * MIT Licensed
 */

let parser = require('./auth_header')
let verify = require('./manager_jwt')

/**
 * Handle response based on the token provided
 *
 * @param {string} key
 * @param {object} verification_options
 * @param {object} signing_options
 * @api private
 */

let handler = (key, redisClient, verification_options={ignoreExpiration:true}, signing_options={}) => {
    return (req, res, next) => {
        if ((token = isValid(req.headers.authorization)) !== null) {
          verify(token.value, key, req, redisClient,verification_options, signing_options).then((result) =>{
            res.header("X-Token",result)
            req.headers.authorization = "JWT " + result
            next()
          }).catch((err) => {
            if (err) res.status(500).end(JSON.stringify({status:"error",message:err.message,error_type:err.name}))
            else res.status(500).end(JSON.stringify({status:"error",message:"Internal Error",error_type:"GeneralException"}))
          })
        } else {
          res.status(400).end(JSON.stringify({status:"error",message:"Wrong Token",error_type:"TokenException"}))
        }
    }
}

/**
 * Return whether header is valid or not
 *
 * @param {string} header
 * @api private
 */

let isValid = (header) => {
    return parser(header)
}

/**
 * Module exports.
 */

module.exports = handler
