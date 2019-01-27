// called by clients of simple-oauth-server to validate the access token; i.e.,
// that it exists and it's not expired
function validateAccessToken(context, callback) {
    this.authorizationService.getAccessToken(context.access_token, function (error, tokenData) {
        if(error){
            return callback(error);
        }

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
