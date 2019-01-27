// called by clients of simple-oauth-server to validate the refresh token; i.e.,
// that it exists and is paired to the access token
function validateRefreshToken(context, callback) {

    this.authorizationService.getAccessToken(context.access_token), function (error, tokenData) {
        if (error) {
            return callback(error);
        }

        if (!tokenData || !tokenData.access_token || !tokenData_refresh_tokne) {
            return callback({
                isValid: false,
                error: 'Access token or refresh token not found'
            });
        }

        // todo: validate the refresh/access token passed in match the
        // stored refresh/access token pair.
    }
}

module.exports = validateRefreshToken;