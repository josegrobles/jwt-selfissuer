const re = /(\S+)\s+(\S+)/



 let parseAuthHeader = (hdrValue) => {
    if (typeof hdrValue !== 'string') {
        return null
    }
    const matches = hdrValue.match(re)
    return matches && { scheme: matches[1], value: matches[2] }
}



module.exports = {
    parse: parseAuthHeader
}
