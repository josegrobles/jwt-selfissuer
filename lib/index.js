let parser = require('./auth_header').parser
let verify = require('./manager_jwt')


let handler = (key,options) => {
    return (req, res, next) => {
        if ((var token = isValid(req.header)) !== null) {
          verify(token).then((result) =>{
            console.log(result)
          }).catch((err) => {
            console.log(err)
          })
          res.end("ok")
        } else res.end("wrong_header")
    }
}


let isValid = (header) => {
    return parser(header)
}

module.exports = handler
