const uuid = require('uuid');

const db = require('./db');


const create = (user, document) => db.upsertDocument({
    userId: user.id,
    ready: false,
    document
});

const getAllByUserId = id => db.getDocumentsByUserId(id);

const feedAllUnready = () => db.feedUnreadyDocuments();

const setReady = id => db.setDocumentReady(id);


module.exports = {
    create,
    getAllByUserId,
    feedAllUnready,
    setReady
};