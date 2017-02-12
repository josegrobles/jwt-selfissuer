/*!
 * jwt-selfissuer
 * Copyright(c) 2017 Jose Antonio Gonzalez Robles
 * MIT Licensed
 */

const re = /(\S+)\s+(\S+)/

/**
 * Return token info
 *
 * @param {string} hdrValue
 * @api private
 */

let parseAuthHeader = (hdrValue) => {
    if (typeof hdrValue !== 'string') {
        return null
    }
    const matches = hdrValue.match(re)
    return matches && { scheme: matches[1], value: matches[2] }
}

/**
 * Module exports.
 */

module.exports = {
    parser: parseAuthHeader
}
