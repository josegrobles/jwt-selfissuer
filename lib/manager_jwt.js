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
var crypto = require('crypto')
var _ = require('underscore')


/**
 * Issues new token.
 *
 * @param {string} token
 * @param {string} key
 * @param {object} req
 * @param {object} verification_options
 * @param {object} signing_options
 * @api private
 */

let verifier_jwt = (token, key, req, redisClient, verification_options, signing_options) => {
  return new Promise((resolve,reject) => {
      jwt.verify(token, key, verification_options, (err,decoded) => {
        if (err) {
          reject(err)
        }
          const info = getProperties(decoded)
          req.info = info
          check(decoded, redisClient).then( hash => {
            info.hash = hash
            issuer_jwt(info, key ,signing_options).then((result) => {
              resolve(result) }
            ).catch((err) => {
              reject(err) })
            }).catch(err => {
              if (err === null) {
                resolve(token)
              }
              else reject(err)
            })
      })
  })
}

/**
 * Manager to check all necessary parts of the token.
 *
 * @param {string} decoded
 * @param {object} redisClient
 * @api private
 */

let check = (decoded, redisClient) => {
  return new Promise((accept,reject) =>{
    if(check_expire(decoded)){
      check_hash(decoded.username,decoded.hash, redisClient).then( uuid => {
        return generate_hash(decoded.username,uuid, redisClient)
      }).then(hash => {
        accept(hash)
      }).catch(error => {
        reject(error)
      })
    }else {
      reject(null)
    }
  })
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
 * Return whether token hash is valid or not.
 *
 * @param {string} username
 * @param {string} hash
 * @param {object} client
 * @api private
 */

let check_hash = (username, hash, client) => {
  return new Promise((resolve,reject) => {
    client.hgetall(username+"_hashes",(err,values) => {
      if(err) reject(err)
      values = _.invert(values)
      const value = typeof(values[hash]) === 'string' ? resolve(values[hash]) : reject({message:"hash not found",name:"HashError"})
      resolve(value)
    })
  })
}

/**
 * Returns a new hash for the token after properly saving it into the Redis DB.
 *
 * @param {string} username
 * @param {string} uuid
 * @param {object} client
 * @api private
 */

let generate_hash = (username, uuid, client) => {
  return new Promise((resolve,reject) => {
    let hash = crypto.randomBytes(8)
    hash = hash.toString('hex')
    client.hset(username+"_hashes",uuid,hash,(err,response) => {
      if (err) reject(err)
      else resolve(hash)
    })
  })
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
  return new Promise((resolve,reject) => {
    const expire = Math.floor(Date.now()/1000) + (15 * 60)
    info.exp = expire
    jwt.sign(info, key, options,(err,token)=>{
      if(err) reject(err)
      resolve(token)
    })
  })
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
