const uuid = require('uuid');

const db = require('./db');


const create = (user, document) => db.upsertDocument({
    userId: user.id,
    document
});

const getAllByUserId = id => db.getDocumentsByUserId(id);


module.exports = {
    create,
    getAllByUserId
};