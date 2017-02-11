let parser = require('./auth_header').parser

exports.parser = (req,res,next) => {
  console.log(parser(req.headers.authorization))
  next()
}
