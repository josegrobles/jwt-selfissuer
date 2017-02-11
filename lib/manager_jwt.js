let jwt = require('jsonwebtoken')

let issuer_jwt = (info, key, options) => {
  return jwt.sign(info, key, options)
}

let verifier_jwt = (token, key, options={ignoreExpiration:true}) => {
  return new Promise((resolve,reject) => {
      jwt.verify(token, key, options, (err,decoded) => {
        if (err) reject(null)
        else resolve(check_flag(decoded))
      })
  })
}

let check_flag = (decoded) => {
  if(typeof decoded.exp !== 'number') return null
  else if (Math.floor(new Date() / 1000) + 5 > decoded.exp){
      const info = getProperties(decoded)
      const options = {expiresIn: 15 * 60}
      return issuer_jwt(info,"okesk",options)
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
