const uuid = require('uuid');

const db = require('./db');


const createSnapshot = (user, document) => db.upsertDocument({
    userId: user.id,
    document
});


module.exports = {
    createSnapshot
};