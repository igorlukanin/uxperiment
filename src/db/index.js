const r = require('rethinkdb');
const Promise = require('bluebird');

const setup = require('./setup');


const connection = setup.getConnection({
    users: [{
        name: 'key',
        predicate: r.row('keys'),
        options: { multi: true }
    }],
    documents: [{
        name: 'userId',
        predicate: r.row('userId')
    }]
});


const isOperationSuccessful = result => result.errors === 0;

const appendDateToEntity = entity => {
    entity.datetime = r.now();
    return entity;
};

const getUsers = () => connection.then(c => r.table('users')
    .coerceTo('array')
    .run(c));

const getUserById = id => connection.then(c => r.table('users')
    .get(id)
    .run(c)
    .then(result => new Promise((resolve, reject) => {
        if (result !== null) {
            resolve(result);
        }
        else {
            reject('No user with id: ' + id);
        }
    })));

const getUserByKey = key => connection.then(c => r.table('users')
    .getAll(key, { index: 'key' })
    .coerceTo('array')
    .run(c)
    .then(result => new Promise((resolve, reject) => {
        if (result.length === 1) {
            resolve(result[0]);
        }
        else {
            reject('No user with key: ' + key);
        }
    })));

const getDocumentsByUserId = userId => connection.then(c => r.table('documents')
    .getAll(userId, { index: 'userId' })
    .without({ document: 'pages' })
    .coerceTo('array')
    .run(c));

const upsertEntity = (entity, table) => connection.then(c => r.table(table)
    .insert(appendDateToEntity(entity))
    .run(c)
    .then(isOperationSuccessful))
    .catch(err => {
        console.log(err);
    });

const upsertUser = user => upsertEntity(user, 'users');

const upsertDocument = document => upsertEntity(document, 'documents');


module.exports = {
    getUsers,
    getUserById,
    getUserByKey,
    getDocumentsByUserId,
    upsertUser,
    upsertDocument
};