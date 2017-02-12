var httpMocks = require('node-mocks-http'),
    handler = require('../lib/index')
var chai = require('chai')
var assert = chai.assert

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

    var res = httpMocks.createResponse();



    it('Check token generated', function(done) {
      function ok(){
        var data = res._headers
        token = data
        assert.property(data,'X-Token')
        done()
      }
        var f1 = handler(key)
        f1(req, res, ok)
    })

    it('Check expire date', function(done) {
      function ok(){
        var data = res._headers
        assert.property(data,'Expires')
        done()
      }
        var f1 = handler(key)
        f1(req, res, ok)
    })
})


describe('Token handling - With Working Token', function() {
  var authorization,req,res


    it('Check that no token is generated', function(done) {
      authorization = 'JWT ' + token['X-Token']

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse();

      function ok(){
        var data = res._headers
        assert.equal(data['X-Token'],token['X-Token'])
        done()
      }
        var f1 = handler(key)
        f1(req, res, ok)
    })

    it('Check expire date', function(done) {
      function ok(){
        var data = res._headers
        assert.equal(data['Expires'],data.Expires)
        done()
      }
        var f1 = handler(key)
        f1(req, res, ok)
    })

})

describe('Token handling - Without Token being sent', function() {
    var req,res,data

    it('Check if error info is provided', function(done) {

      req = httpMocks.createRequest({
          method: 'POST'
      });

      res = httpMocks.createResponse();

        let f1 = handler(key)
        f1(req, res)

        data = JSON.parse(res._getData())
        data.should.have.property('status').and.equal('error')
        done()
    })

    it('Check if error message is accurate', function(done) {
        data.should.have.property('message').and.equal('Wrong Token')
        done()
    })

    it('Check if error code is correct', function(done) {
        const status = res._getStatusCode()
        status.should.equal(400)
        done()
    })

})
