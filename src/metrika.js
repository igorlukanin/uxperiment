const config = require('config');
const Promise = require('bluebird');
const request = require('request');
const uuid = require('uuid');


const getApiEndpointUri = endpoint => `https://api-metrika.yandex.ru/management/v1/${endpoint}`;

const logApiCall = (endpoint, err) => console.info(
    `Yandex.Metrika API call: ${endpoint}${err ? ' — error' : ''}`
);

const requestApi = (endpoint, params = {}, data = {}, method = 'GET') => new Promise((resolve, reject) => request({
    url: getApiEndpointUri(endpoint),
    method,
    json: true,
    qs: params,
    body: data,
    headers: { 'Authorization': 'OAuth ' + config.get('metrika.accessToken') }
}, (err, res) => {
    logApiCall(endpoint, err);

    if (err) {
        reject('Failed to call API');
        return;
    }

    resolve(res.body);
}));

const create = () => {
    const options = {
        counter: {
            name: uuid.v4(),
            site: config.get('proxy.url').replace(/^https?\:\/\//, ''),
            grants: [ {
                user_login: '',
                perm: 'public_stat'
            } ],
            code_options: {
                visor: 1,
                ut: 1,
                track_hash: 1,
                clickmap: 1,
                in_one_line: 1
            }
        }
    };

    return requestApi('counters', { field: '' }, options, 'POST')
        .then(result => result.errors === undefined
            ? result.counter
            : Promise.reject(result.errors)
        );
};


module.exports = {
    create
};