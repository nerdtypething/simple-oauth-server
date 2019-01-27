var errors = require('./errors'),
    getTokenData = require('./getTokenData'),
    grantTypes = require('./grantTypes');

function isAllowed(grantType, oauthProvider) {
    return (grantType === grantTypes.REFRESHTOKEN && oauthProvider.authorizationService && oauthProvider.clientService) || false;
}

function grantRefreshedAccessToken(context, callback) {

    debugger;
    
    var authServer = this;

    if (!context.grant_type) {
        return callback(errors.invalidRequest(context));
    }

    if (!isAllowed(context.grant_type, authServer)) {
        return callback(errors.unsupportedGrantType(context));
    }

    authServer.clientService.getById(context.client_id, function (error, client) {
        
        if(error){
            return callback(error);
        }

        if(!client) {
            return callback(errors.invalidClient(context));
        }

        if(!client.grantTypes || !~client.grantTypes.indexOf(context.grant_type)) {
            return callback(errors.unsupportedGrantTypeForClient(context));
        }

        getTokenData.call(authServer, context, function (error, tokenData) {
            if(error){
                return callback(error);
            }

            authServer.authorizationService.saveAccessToken(tokenData, function (error, token) {
                if(error){
                    return callback(error);
                }

                delete token.accountId;
                delete token.clientId;
                callback(null, token);
            });
        });
    });
}

module.exports = grantRefreshedAccessToken;