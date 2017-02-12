/*!
 * jwt-selfissuer
 * Copyright(c) 2017 Jose Antonio Gonzalez Robles
 * MIT Licensed
 */


/**
* Module dependencies.
* @private
*/

let jwt = require('jsonwebtoken')

/**
 * Issues new token.
 *
 * @param {string} token
 * @param {string} key
 * @param {object} verification_options
 * @param {object} signing_options
 * @api private
 */

let verifier_jwt = (token, key, verification_options={ignoreExpiration:true}, signing_options={}) => {
  return new Promise((resolve,reject) => {
      jwt.verify(token, key, verification_options, (err,decoded) => {
        if (err) reject(err)
        try{
          const check = check_flag(decoded,key,signing_options)
          const values = typeof(check) !== 'number' ? check : {token,expire:check}
          resolve(values)
        }catch(err){
          reject(err)
        }
      })
  })
}

/**
 * Return token based on whether it has expired.
 *
 * @param {string} decoded
 * @param {string} key
 * @param {object} signing_options
 * @api private
 */

let check_flag = (decoded, key, signing_options) => {
  if (check_expire(decoded)){
      const info = getProperties(decoded)
      return issuer_jwt(info, key ,signing_options)
  }
  else return decoded.exp
}

/**
 * Return whether token has expired or not.
 *
 * @param {string} decoded
 * @api private
 */

let check_expire = (decoded) => {
  return Math.floor(new Date() / 1000) + 5 > decoded.exp
}

/**
 * Return a new issued token.
 *
 * @param {object} info
 * @param {string} key
 * @param {object} options
 * @api private
 */

let issuer_jwt = (info, key, options) => {
  const expire = Math.floor(Date.now()/1000) + (15 * 60)
  info.exp = expire
  return { token: jwt.sign(info, key, options), expire}
}

/**
 * Return properties of token.
 *
 * @param {string} decoded
 * @api private
 */

let getProperties = (decoded) => {
  let info = {}
    for (var item in decoded) {
      if(item !== "exp" && item !== "iat") {
        info[item] = decoded[item]
      }
    }
  return info
}

/**
 * Module exports.
 */

module.exports = verifier_jwt
