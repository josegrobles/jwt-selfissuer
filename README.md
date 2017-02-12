# jwt-selfissuer  [![Build Status](https://travis-ci.com/josegrobles/jwt-selfissuer.svg?token=7JpgXMQqSWYBts2sAmZb&branch=master)](https://travis-ci.com/josegrobles/jwt-selfissuer) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JWT Auto-Renewal Middleware for Express

#How it works?

**jwt-selfissuer** works by renewing a previous expired token with a new one, and returning it on the response headers along its expiration time. It's born from the idea of having an easy way of issuing tokens with security and easiness. By using it you provide an easy and secure way of controlling user access.

It works by using **redis** to secure a hash which is directly linked with the previous used token, this way it manages to only issue a new token when the previous one is already registered on the **DB**. It also provides a way to **revoke** access to determined devices.
