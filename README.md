# jwt-selfissuer  [![Build Status](https://travis-ci.com/josegrobles/jwt-selfissuer.svg?token=7JpgXMQqSWYBts2sAmZb&branch=master)](https://travis-ci.com/josegrobles/jwt-selfissuer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Logo](https://github.com/josegrobles/jwt-selfissuer/wiki/images/unspecified.png)

JWT Auto-Renewal Middleware for Express

#What is it?

**jwt-selfissuer** works by renewing a ***previous expired token*** with a ***new one***, and returning it on the ***response headers***. It's born from the idea of having an easy way of ***issuing tokens*** with **security** and **easiness**. By using it you provide an easy and secure way of ***controlling user access***.

It works by using **Redis** to store a *hash* which is directly linked with the *previous used token*, this way it manages to only issue a new token when the hash stored in it matches one of the already registered on **Redis**. It also provides an easy way to **revoke** access to determined devices as each device is linked to an unique **UUID**.

# How it works?
It works by checking the **Authorization header** on the requests, it will issue a new one depending on the previous one expiration time, it responses with an ***X-Token header*** whether it has expired or not, the only difference is that if it has expired the ***X-Token*** will be the new one.

# Installation
First, let's install it by writting
```javascript
npm install jwt-selfissuer
```
Once it has been installed, let's import it to the file where we want to mount the middleware
```javascript
var jwt_issuer = require('jwt-selfissuer')
```  
#### But ***first*** lets talk about how to make this works flawlessly!
#Issuing proper tokens
##Requirements
A Token must include the next parameters:
- Expire time
- A hash previously stored in Redis

##How to comply with this requirements
###Expire time
To comply with the expiring time you just need to issue a token with a ***exp*** key on the ***payload***.
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
The way explained here is the best way I could think of, but I'm totally open to change my mind.
#### *These two next step should be used as functions when registering or login an user*
***First*** we need to create a random *hash* for it to be stored along the payload:
```javascript
let hash = crypto.randomBytes(8)
hash = hash.toString('hex')
payload.hash = hash
```
###### * You shold use this code along the previous one used *Expire time*

***Secondly*** we need to store this *hash* on redis along other info such related to the device
```javascript
let device_uuid = crypto.randomBytes(32)
device_uuid = device_uuid.toString('hex')
client.multi()
      .hset(username+"_devices",device_uuid,JSON.stringify(device_info))
      .hset(username+"_hashes",device_uuid,hash)
      .exec((err,info) => {
        if(err) console.log(err)
      })
```
We are generating an ***UUID*** which is related to every device
#### *Now everything is ready!*
# Integrating it with Express
There are multiples way of doing it, but here I'm going to explain the easiest one:
## Creating the configurations
##### The first *paramater* we need to pass is the key to encrypt the token
```javascript
const key = "ThisIsTheKey"
```
##### The second *paramater* is the *Redis Client*
```javascript
var redis = require('redis')
client = redis.createClient()
```
##### The third *paramater* are the verification options for the token *(Optional)*
```javascript
const verification_options = {ignoreExpiration:true}
```
##### The last one *paramater* are the signing options for the token. Here you can change when the token Expires. *(Optional)*
```javascript
const signing_options = {expiresIn:900}
```
###### Expire time is by default *15 minutes*
## Declaring the variable
```javascript
var issuerMiddleware = jwt_issuer(key, client, verification_options, signing_options)
```
