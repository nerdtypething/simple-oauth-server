function validateAccessToken(context, callback) {
    this.authorizationService.getAccessToken(context.access_token, function (error, tokenData) {
        if(error){
            return callback(error);
        }

        /* original implementation:
        if (!tokenData || !tokenData.access_token || '' + context.client_id !== '' + tokenData.clientId) {
            return callback({
                isValid: false,
                error: 'Access token not found'
            });
        }

        if (tokenData.expiresDate < new Date()) {
            return callback({
                isValid: false,
                error: 'Access token has expired'
            });
        }
        */

        /* Involvist modifications:
           - don't check against clientId since we've determined that the UUID generation
             for token is unique enough to not repeat for different clients.
           - rename tokenData.expiresDate to tokenData.expires_in as per the documentation
             on https://www.npmjs.com/package/simple-oauth-server says the token object's
             expire date property should be.
        */
        if (!tokenData || !tokenData.access_token) {
            return callback({
                isValid: false,
                error: 'Access token not found'
            });
        }

        if (tokenData.expires_in < new Date()) {
            return callback({
                isValid: false,
                error: 'Access token has expired'
            });
        }

        callback(
            null,
            {
                isValid: true,
                accountId: tokenData.accountId,
                clientId: tokenData.clientId
            }
        );
    });
}

module.exports = validateAccessToken;
