let jwt = require('jsonwebtoken')

let issuer_jwt = (info, key, options) => {
  const token = jwt.sign(info, key, options)
  return token
}

let verifier_jwt = (token, key, options={ignoreExpiration:true}) => {
  jwt.verify(token, key, options, decoded_jwt)
}

let decoded_jwt = (err,decoded) => {
  if (err) return null
  else check_flag(decoded)
}

let check_flag = (decoded) => {
  if(typeof decoded.exp !== 'number') return null
  else if (Math.floor(new Date() / 1000) + 5 > decoded.exp){

  }
  else return null
}
