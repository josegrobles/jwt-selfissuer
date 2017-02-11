let parser = require('./auth_header').parser
let verify = require('./manager_jwt')


let handler = (key,options) => {
    return (req, res, next) => {
        if ((token = isValid(req.headers.authorization)) !== null) {
          res.end(token)
          verify(token,key).then((result) =>{
            res.end(result)
          }).catch((err) => {
            console.log(err)
          })
        } else res.end("wrong_header")
    }
}


let isValid = (header) => {
    return parser(header)
}

module.exports = handler
