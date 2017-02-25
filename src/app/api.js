const bodyParser = require('body-parser');
const compression = require('compression');
const config = require('config');
const express = require('express');
const uuid = require('uuid');

const documents = require('../documents');
const users = require('../users');


const port = config.get('api.port');


const checkKey = (req, res) => users.getByKey(req.params.key || '')
    .then(user => res.json({ success: true }))
    .catch(err => res.json({ success: false, err }));

const createNewId = (req, res) => users.getByKey(req.body.key || '')
    .then(user => res.json({ success: true, id: uuid.v4() }))
    .catch(err => res.json({ success: false, err }));

const processSketchUpload = (req, res) => users.getByKey(req.body.key || '')
    .then(user => documents
        .create(user, req.body.document)
        .then(() => res.json({ success: true })))
    .catch(err => res.json({ success: false, err }));


express()
    .use(compression())
    .use(bodyParser.json())
    .get('/keys/:key', checkKey)
    .post('/ids', createNewId)
    .post('/sketch', processSketchUpload)
    .listen(port, () => console.info('API started at port ' + port));