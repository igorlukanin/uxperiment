const config = require('config');
const google = require('googleapis');
const Promise = require('bluebird');

const clientId = config.get('google.clientId');
const clientSecret = config.get('google.clientSecret');
const redirectUri = config.get('google.redirectUrl');


const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);


const getOAuthUrl = () => client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
});

const getOAuthAccessTokens = code => new Promise((resolve, reject) => {
    client.getToken(code, (err, tokens) => {
        if (err) {
            reject('Failed to get access tokens');
            return;
        }

        resolve(tokens);
    });
});

const getUserProfile = (accessTokens) => new Promise((resolve, reject) => {
    client.setCredentials(accessTokens);

    google.plus('v1').people.get({ userId: 'me', auth: client }, (err, profile) => {
        if (err) {
            console.log(err);
            reject('Failed to get user profile');
            return;
        }

        resolve(profile);
    });
});

const getOAuthUser = (state, code) => getOAuthAccessTokens(state, code)
    .then(accessTokens => getUserProfile(accessTokens).then(profile => {
        profile.accessTokens = accessTokens;
        return profile;
    }));


module.exports = {
    getOAuthUrl,
    getOAuthUser
};