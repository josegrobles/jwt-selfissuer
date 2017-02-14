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
    var req, res, token, hash

    before(function(done) {
        hash = crypto.randomBytes(8)
        hash = hash.toString('hex')
        info = {
            username: "test",
            permissions: "user",
            hash
        }
        info.exp = Math.floor(Date.now() / 1000)
        jwt.sign(info, key, {}, function(err,token) {
            let uuid = crypto.randomBytes(32)
            uuid = uuid.toString('hex')
            client.hset("test_hashes", uuid, hash, function(err, response) {
                const authorization = "JWT " + token
                req = httpMocks.createRequest({
                    method: 'POST',
                    headers: {
                        authorization
                    }
                });
                res = httpMocks.createResponse();
                done()
            })
        })
    });

    after(function(done){
      client.del("test_hashes",function(err,response){
        done()
      })
    })


    it('Check token generated', function(done) {
        function ok() {
            var data = res._headers
            tokenG = data['X-Token']
            assert.property(data, 'X-Token')
            done()
        }
        var f1 = handler(key, client)
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
    var authorization, req, res

    before(function(){
      authorization = 'JWT ' + tokenG

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse();
    })

    it('Check that no token is generated', function(done) {
        function ok() {
            var data = res._headers
            assert.equal(data['X-Token'], tokenG)
            done()
        }
        var f1 = handler(key, client)
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
    var req, res, data

    before(function(){
      req = httpMocks.createRequest({
          method: 'POST'
      });

      res = httpMocks.createResponse();
    })

    it('Check if error info is provided', function(done) {

        let f1 = handler(key, client)
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


describe('Token handling - Check corrupted token', function() {
    var req, res, data

    before(function(){
      const authorization = 'JWT asjifdoaofjisaodi'

      req = httpMocks.createRequest({
          method: 'POST',
          headers: {
              authorization
          }
      });

      res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });
    })

    it('Check if error message is correct', function(done) {

        let f1 = handler(key, client)
        f1(req, res)

        res.on('end',function(){
          data = JSON.parse(res._getData())
          assert.equal(data.message,"jwt malformed")
          done()

        })

    })

    it('Check if error type is correct', function(done) {
        assert.equal(data.error_type,"JsonWebTokenError")
        done()
    })

})

describe('Token handling - Token with hash not in db', function() {
    var req, res, data

    before(function(done) {
        hash = crypto.randomBytes(8)
        hash = hash.toString('hex')
        info = {
            username: "test",
            permissions: "user",
            hash
        }
        info.exp = Math.floor(Date.now() / 1000)
        jwt.sign(info, key, {}, function(err,token) {
            const authorization = "JWT " + token
            req = httpMocks.createRequest({
                method: 'POST',
                headers: {
                    authorization
                }
            });
            res = httpMocks.createResponse({
              eventEmitter: require('events').EventEmitter
            });
            done()
        })
    });

    it('Check if error message is correct', function(done) {
      let f1 = handler(key, client)
      f1(req, res)

      res.on('end',function(){
        data = JSON.parse(res._getData())
        assert.equal(data.message,"hash not found")
        done()

      })
    })
    it('Check if error type is correct', function(done) {
        assert.equal(data.error_type,"HashError")
        done()
    })

})
