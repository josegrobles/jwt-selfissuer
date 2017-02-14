var httpMocks = require('node-mocks-http'),
    handler = require('../lib/index')
var chai = require('chai')
var assert = chai.assert

var should = require('chai').should()
const key = process.env.JWT_KEY
var tokenG
var redis = require('redis')
var client = redis.createClient()
let jwt = require('jsonwebtoken')
var crypto = require('crypto')


client.on('connect', () => {
    console.log('Connected to Reddis Host');
});

describe('Token handling - With Expired Token', function() {
    var req,res,token,hash


    it('Create token', function(done) {
      hash = crypto.randomBytes(8)
      hash = hash.toString('hex')
      info = {username:"test",permissions:"user",hash}
      info.exp = Math.floor(Date.now()/1000)
      token = jwt.sign(info, key)
      done()
    })


    it('Store token along hash', function(done) {
      let uuid = crypto.randomBytes(32)
      uuid = uuid.toString('hex')
      client.hset("test_hashes",uuid,hash, (err,response) =>{
        done()
      })
    })

    it('Create Request and response mock', function(done) {
      const authorization = "JWT "+ token

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse();

      done()
    })

    it('Check token generated', function(done) {
      function ok(){
        var data = res._headers
        tokenG = data['X-Token']
        assert.property(data,'X-Token')
        done()
      }
        var f1 = handler(key,client)
        f1(req, res, ok)
    })

    it('Check info is correctly stored - username', function(done) {
      const info = req.info
      info.should.have.property('username').and.equal('test')
      done()
    })

    it('Check info is correctly stored - permissions', function(done) {
      const info = req.info
      info.should.have.property('permissions').and.equal('user')
      done()
    })

})


describe('Token handling - With Working Token', function() {
  var authorization,req,res


    it('Check that no token is generated', function(done) {
      authorization = 'JWT ' + tokenG

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse();

      function ok(){
        var data = res._headers
        assert.equal(data['X-Token'],tokenG)
        done()
      }
        var f1 = handler(key,client)
        f1(req, res, ok)
    })

    it('Check info is correctly stored - username', function(done) {
      const info = req.info
      info.should.have.property('username').and.equal('test')
      done()
    })

    it('Check info is correctly stored - permissions', function(done) {
      const info = req.info
      info.should.have.property('permissions').and.equal('user')
      done()
    })

})

describe('Token handling - Without Token being sent', function() {
    var req,res,data

    it('Check if error info is provided', function(done) {

      req = httpMocks.createRequest({
          method: 'POST'
      });

      res = httpMocks.createResponse();

        let f1 = handler(key,client)
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
