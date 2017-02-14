# jwt-selfissuer  [![Build Status](https://travis-ci.com/josegrobles/jwt-selfissuer.svg?token=7JpgXMQqSWYBts2sAmZb&branch=master)](https://travis-ci.com/josegrobles/jwt-selfissuer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JWT Auto-Renewal Middleware for Express

#What it is?

**jwt-selfissuer** works by renewing a previous expired token with a new one, and returning it on the response headers. It's born from the idea of having an easy way of issuing tokens with security and easiness. By using it you provide an easy and secure way of controlling user access.

It works by using **redis** to store a hash which is directly linked with the previous used token, this way it manages to only issue a new token when the hash stored in it matches one of the already registered on the **DB**. It also provides an easy way to **revoke** access to determined devices as each device is linked to an unique **uuid**.

#How it works?
First, let's install it by writting
```
npm install jwt-selfissuer
```
Once it has been installed, let's import it to the file where we want to mount the middleware
```
var issuer = require('jwt-selfissuer')
```  
#Issuing proper tokens
##Requirements
A Token must include the next parameters:
- Expire time
- A hash previously stored in Redis

##How to accomplish with this requirements
###Expire time
To accomplish with the expiring time you just need to issue a token with a ***exp*** key on the ***payload***.
There are two ways of doing it using the package ***jsonwebtoken***:
####1. Adding a *exp* key to the payload
```javascript
let payload = {username: "test"}
const expireAt = Math.round(new Date()/1000) + (15*60) //Expires in 15 minutes
payload.exp = expireAt
const token = jwt.sign(payload,key,options)
```
####2. Adding the *expiresIn* key to the options object
```javascript
let payload = {username: "test"}
let options = {}
options.expiresIn = 15*60 //Expires in 15 minutes
const token = jwt.sign(payload,key,options)
```
###A hash previously stored in Redis
