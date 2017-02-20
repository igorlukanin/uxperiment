const r = require('rethinkdb');
const Promise = require('bluebird');

const setup = require('./setup');


const connection = setup.getConnection({
    users: [{
        name: 'key',
        predicate: r.row('keys'),
        options: { multi: true }
    }]
});


const isOperationSuccessful = result => result.errors === 0;

const getUsers = () => connection.then(c => r.table('users')
    .coerceTo('array')
    .run(c));

const getUserByKey = key => connection.then(c => r.table('users')
    .getAll(key, { index: 'key' })
    .coerceTo('array')
    .run(c)
    .then(result => new Promise((resolve, reject) => {
        if (result.length === 1) {
            resolve(result);
        }
        else {
            reject('No user with key: ' + key);
        }
    })));

const upsertUser = user => connection.then(c => r.table('users')
    .insert(user)
    .run(c)
    .then(isOperationSuccessful));


module.exports = {
    getUsers,
    getUserByKey,
    upsertUser
};