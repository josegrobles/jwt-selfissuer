let jwt = require('jsonwebtoken')

let verifier_jwt = (token, key, verification_options={ignoreExpiration:true}, signing_options={}) => {
  return new Promise((resolve,reject) => {
      jwt.verify(token, key, verification_options, (err,decoded) => {
        if (err) reject(err)
        else {
          const {token, expire} = check_flag(decoded,signing_options)
          resolve({token,expire})
          }
      })
  })
}

let issuer_jwt = (info, key, options) => {
  const expire = Math.floor(Date.now()/1000) + (15 * 60)
  info.exp = expire
  return {token:jwt.sign(info, key, options), expire}
}

let check_flag = (decoded, signing_options) => {
  if(typeof decoded.exp !== 'number') return null
  else if (Math.floor(new Date() / 1000) + 5 > decoded.exp){
      const info = getProperties(decoded)
      const options = {expiresIn: 15 * 60}
      return issuer_jwt(info,"okesk",signing_options)
  }
  else return null
}

let getProperties = (decoded) => {
  let info = {}
    for (var item in decoded) {
      if(item !== "exp" && item !== "iat") {
        info[item] = decoded[item]
      }
    }
  return info
}

module.exports = verifier_jwt
