var lib = require('./lib');

// expiresIn - minutes
function AuthServer(clientService, tokenService, authorizationService, membershipService, expiresIn, supportedScopes) {
    var authServer = this;

    if(!(authServer instanceof AuthServer)) {
        return new AuthServer(clientService, tokenService, authorizationService, membershipService, expiresIn, supportedScopes);
    }

    authServer.clientService = clientService;
    authServer.tokenService = tokenService;
    authServer.authorizationService = authorizationService;
    authServer.membershipService = membershipService;
    authServer.expiresIn = expiresIn || 3600;
    authServer.supportedScopes = supportedScopes ? supportedScopes : [];
}

AuthServer.prototype.getExpiresDate = function () {
    // we multiply by 60000 because there are 60000 ms in one minute
    // and Date is a representation of milliseconds since epoch
    return new Date(Date.now() + this.expiresIn * 60000);
};

AuthServer.prototype.isSupportedScope = function (scopes) {
    if(!Array.isArray(scopes)){
        scopes = [scopes];
    }

    for(var i = 0; i < scopes.length; i++){
        if(!~this.supportedScopes.indexOf(scopes[i])){
            return false;
        }
    }
    return true;
};

AuthServer.prototype.authorizeRequest = lib.authorizeRequest;
AuthServer.prototype.getTokenData = lib.getTokenData;
AuthServer.prototype.grantAccessToken = lib.grantAccessToken;
AuthServer.prototype.grantRefreshedAccessToken = lib.grantRefreshedAccessToken;
AuthServer.prototype.validateAccessToken = lib.validateAccessToken;
AuthServer.prototype.validateRefreshToken = lib.validateRefreshToken

module.exports = AuthServer;