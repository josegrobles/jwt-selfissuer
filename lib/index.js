let parser = require('./auth_header').parser


module.exports = handler

let handler = (options) => {
  console.log(options)
  return (req,res,next) => {
    next()
  }
}
