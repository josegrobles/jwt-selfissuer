let jwt = require('jsonwebtoken')

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

let check_flag = (decoded, key, signing_options) => {
  if (Math.floor(new Date() / 1000) + 5 > decoded.exp){
      const info = getProperties(decoded)
      return issuer_jwt(info, key ,signing_options)
  }
  else return decoded.exp
}

let issuer_jwt = (info, key, options) => {
  const expire = Math.floor(Date.now()/1000) + (15 * 60)
  info.exp = expire
  return { token: jwt.sign(info, key, options), expire}
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
