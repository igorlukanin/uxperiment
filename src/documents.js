const config = require('config');

const db = require('./db');
const metrika = require('./metrika');



const create = (user, document) => db.getDocumentById(document.id)
    .then(previous => {
        previous.document = document;
        previous.ready = false;

        return db.upsertDocument(previous);
    })
    .catch(err => metrika.create(document.name)
        .then(counter => db.upsertDocument({
            id: document.id,
            userId: user.id,
            ready: false,
            document,
            counter
        })
    ));

const getPreviewLink = document => `${config.get('proxy.url')}/${document.document.id}/`;

const getCounterLink = document => `https://metrika.yandex.ru/dashboard?id=${document.counter.id}`

const getAllByUserId = id => db.getDocumentsByUserId(id)
    .then(documents => documents.map(document => {
        document.links = {
            preview: getPreviewLink(document),
            counter: getCounterLink(document)
        };

        return document;
    }));

const feedAllUnready = () => db.feedUnreadyDocuments();

const setReady = id => db.setDocumentReady(id);


module.exports = {
    create,
    getAllByUserId,
    feedAllUnready,
    setReady
};