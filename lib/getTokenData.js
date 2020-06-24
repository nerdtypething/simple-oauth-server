var errors = require('./errors'),
    grantTypes = require('./grantTypes'),
    kgo = require('kgo');

function isValidAuthorizationCode(authorizationCode, context) {

    /* original implementation: 
     return authorizationCode &&
            context.code === authorizationCode.code &&
            authorizationCode.expiresDate > new Date() &&
            '' + context.client_id === '' + authorizationCode.clientId;
    */

    /* Rousr modifications:
      - authorizationCode is an instance of the rousr-shared/Entities/AnonymousDeviceAuthorization
        mongoose model.
      - don't check against clientId since we've validated against it
        before getting to this point.
      - we add a check against the app instance uuid.
    */
   return authorizationCode && 
          context.code === authorizationCode.authorizationCode && 
          context.instance_uuid === authorizationCode.appInstanceUuid

}

function getTokenData(context, callback) {
    var authServer = this,
        tokenData = {
            token_type: 'Bearer',
            expires_in: authServer.getExpiresDate(),
            clientId: context.client_id
        };

    if (context.grant_type === grantTypes.AUTHORIZATIONCODE) {
        authServer.authorizationService.getAuthorizationCode(context.code, function(error, authorizationCode){
            if(error){
                return callback(error);
            }

            if(!isValidAuthorizationCode(authorizationCode, context)){
                return callback(errors.invalidAuthorizationCode(context));
            }

            tokenData.accountId = authorizationCode.accountId;
            kgo
            ('token', authServer.tokenService.generateToken)
            ('refreshToken', authServer.tokenService.generateToken)
            ('tokenData', ['token', 'refreshToken'], function(token, refreshToken, done){
                tokenData.access_token = token;
                tokenData.refresh_token = refreshToken;
                done(null, tokenData);
            })
            (['*', 'tokenData'], callback);
        });
        return;
    }

    if (context.grant_type === grantTypes.PASSWORD) {
        authServer.membershipService.areUserCredentialsValid(context.username, context.password, context.scope, function (error, isValidPassword) {
            if(error){
                return callback(error);
            }

            if(!isValidPassword){
                return callback(errors.userCredentialsInvalid(context));
            }

            kgo
            ('token', authServer.tokenService.generateToken)
            ('refreshToken', authServer.tokenService.generateToken)
            ('tokenData', ['token', 'refreshToken'], function(token, refreshToken, done){
                tokenData.access_token = token;
                tokenData.refresh_token = refreshToken;
                done(null, tokenData);
            })
            (['*', 'tokenData'], callback);
        });
        return;
    }

    if (context.grant_type === grantTypes.REFRESHTOKEN) {
        // if we'e gotten this far we've already validated the access and refresh token pair (via the Rousr API refresh token
        // endpoint - not sure if it goes there or here?), and validated that the client and authorization server 
        // support the refresh_token grant. now we jus task the token service to generate tokens again

        this.authorizationService.getAccessToken(context.access_token, function (error, previousTokenData) {
            
            if (error) {
                return callback(error);
            }

            if (!previousTokenData || !previousTokenData.access_token || !previousTokenData.refresh_token) {
                return callback({
                    isValid: false,
                    error: 'Access token or refresh token not found'
                });
            }

            // authorization service should invalidate the previous access and refresh token
            // pair
            authServer.authorizationService.invalidateAccessToken(context.access_token, function(error, result) {

                if(error){
                    return callback(error);
                }

                // generate a new access/refresh token pair
                kgo
                ('token', authServer.tokenService.generateToken)
                ('refreshToken', authServer.tokenService.generateToken)
                ('tokenData', ['token', 'refreshToken'], function(token, refreshToken, done){
                    tokenData.access_token = token;
                    tokenData.refresh_token = refreshToken;
                    done(null, tokenData);
                })
                (['*', 'tokenData'], callback);
            });
        });
        return;
    }

    if (context.grant_type === grantTypes.CLIENTCREDENTIALS) {
        kgo
        ('token', authServer.tokenService.generateToken)
        ('tokenData', ['token'], function(token, done){
            tokenData.access_token = token;
            done(null, tokenData);
        })
        (['*', 'tokenData'], callback);

        return;
    }

    return callback(errors.unsupportedGrantType(context));
}

module.exports = getTokenData;