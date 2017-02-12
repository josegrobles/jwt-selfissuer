var httpMocks = require('node-mocks-http'),
    handler = require('../lib/index')

var should = require('chai').should()
const key = process.env.JWT_KEY
var token

describe('Token handling - With Expired Token', function() {

    const authorization = 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzZGFzYWRzYSIsInBlcm1pc3Npb25zIjoidXNlciIsImV4cCI6MTQ4NjgxOTMyNiwiaWF0IjoxNDg2ODE4NDI2fQ.8EYW8b1vxcEGeZJaPGkhSSpuYSUSrfW4bD3p1kbo5oM'

    var req = httpMocks.createRequest({
        method: 'POST',
        headers: {
            authorization
        }
    });

    var res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });

    var data

    it('Check token generated', function(done) {
        var f1 = handler(key)
        f1(req, res)
        res.on('end', function() {
            data = JSON.parse(res._getData())
            data.should.have.property('token')
            done()
        })
    })

    it('Check expire date', function(done) {
        token = data.token
        data.should.have.property('expire')
        done()
    })
})


describe('Token handling - With Working Token', function() {
    var req,res,data,authorization

    it('Check if error info is provided', function(done) {

      authorization = 'JWT ' + token

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter
      });

        let f1 = handler(key)
        f1(req, res)

        res.on('end', function() {
            data = JSON.parse(res._getData())
            data.should.have.property('status')
            done()
        })
    })

    it('Check expire date', function(done) {
        data.should.have.property('message')
        done()
    })

})
