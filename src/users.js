const uuid = require('uuid');

const db = require('./db');


const create = () => db.upsertUser({
    keys: [ uuid.v4() ]
});

const getAll = () => db.getUsers();

const getById = id => db.getUserById(id);

const getByKey = key => db.getUserByKey(key);


module.exports = {
    create,
    getAll,
    getById,
    getByKey
};