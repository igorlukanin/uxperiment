const config = require('config');
const r = require('rethinkdb');


const connection = r.connect({
    host: config.get('rethinkdb.host'),
    port: config.get('rethinkdb.port'),
    db: config.get('rethinkdb.db')
});

const isOperationSuccessful = result => result.errors === 0;

const selectUsers = () => connection.then(c => r.table('users')
    .coerceTo('array')
    .run(c));

const upsertUser = user => connection.then(c => r.table('users')
    .insert(user)
    .run(c)
    .then(isOperationSuccessful));


module.exports = {
    selectUsers,
    upsertUser
};