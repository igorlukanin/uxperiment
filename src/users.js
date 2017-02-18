const uuid = require('uuid');

const db = require('./db');


const create = () => db.upsertUser({
    keys: [ uuid.v4() ]
});

const getAll = () => db.selectUsers();


module.exports = {
    create,
    getAll
};