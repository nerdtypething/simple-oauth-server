// this library implements business-logic specific for
// the simple-oauth-server

var getOauthParameters = require('./getOauthParameters');

module.exports = {
    authorizeRequest: getOauthParameters(require('./authorizeRequest')),
    getTokenData: getOauthParameters(require('./getTokenData')),
    grantAccessToken: getOauthParameters(require('./grantAccessToken')),
    grantRefreshedAccessToken: getOauthParameters(require('./grantRefreshedAccessToken')),
    validateAccessToken: getOauthParameters(require('./validateAccessToken')),
    validateRefreshToken: getOauthParameters(require('./validateRefreshToken'))
};
