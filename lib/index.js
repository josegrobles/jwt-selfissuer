let parser = require('./auth_header').parser



let handler = (options) => {
  console.log(options)
  return (req,res,next) => {
    res.end("ok")
  }
}

module.exports = handler
