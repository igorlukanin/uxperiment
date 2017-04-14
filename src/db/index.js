const r = require('rethinkdb');
const Promise = require('bluebird');

const setup = require('./setup');
const result = require('./result');


const connection = setup.getConnection({
    users: [{
        name: 'key',
        predicate: r.row('keys'),
        options: { multi: true }
    }, {
        name: 'cookieToken',
        predicate: r.row('cookieToken')
    }],
    documents: [{
        name: 'userId',
        predicate: r.row('userId')
    }, {
        name: 'ready',
        preducate: r.row('ready')
    }]
});


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

const getUserByCookieToken = cookieToken => connection.then(c => r.table('users')
    .getAll(cookieToken, { index: 'cookieToken' })
    .run(c)
    .then(result.toUnit));

const getDocumentById = id => connection.then(c => r.table('documents')
    .get(id)
    .run(c)
    .then(result => result === null
        ? Promise.reject()
        : result
    ));

const getDocumentsByUserId = userId => connection.then(c => r.table('documents')
    .getAll(userId, { index: 'userId' })
    .without({ document: 'pages' })
    .coerceTo('array')
    .run(c));

const feedUnreadyDocuments = () => connection.then(c => r.table('documents')
    .getAll(false, { index: 'ready' })
    .changes({ includeInitial: true })
    .run(c));

const setDocumentReady = id => connection.then(c => r.table('documents')
    .get(id)
    .update({ ready: true })
    .run(c));

const upsertEntity = (entity, table, conflict = 'update') => connection.then(c => r.table(table)
    .insert(appendDateToEntity(entity), { conflict })
    .run(c)
    .then(result.check));

const upsertUser = user => upsertEntity(user, 'users');

const upsertDocument = document => upsertEntity(document, 'documents', 'replace');

const getCounts = () => connection.then(c => r.do([
    r.table('users').count(),
    r.table('documents').count()
]).run(c).then(result => ({
    users: result[0],
    documents: result[1]
})));


module.exports = {
    getUsers,
    getUserById,
    getUserByKey,
    getUserByCookieToken,
    getDocumentsByUserId,
    getDocumentById,
    feedUnreadyDocuments,
    setDocumentReady,
    upsertUser,
    upsertDocument,
    getCounts
};