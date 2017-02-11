let parser = require('./auth_header').parser
let verify = require('./manager_jwt')


let handler = (key, verification_options, signing_options) => {
    return (req, res, next) => {
        if ((token = isValid(req.headers.authorization)) !== null) {
          verify(token.value,key).then((result) =>{
            res.end(JSON.stringify(result))
          }).catch((err) => {
            res.end("error")
          })
        } else res.end("wrong_header")
    }
}


let isValid = (header) => {
    return parser(header)
}

module.exports = handler
