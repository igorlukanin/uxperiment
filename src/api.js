const compression = require('compression');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');

const users = require('./users');


const port = config.get('api.port');


const checkKey = (req, res) => users.getByKey(req.params.key || '')
    .then(user => res.json({ success: true }))
    .catch(err => res.json({ success: false, err }));

const processSketchUpload = (req, res) => users.getByKey(req.body.key || '')
    .then(user => {
        // TODO: Save data

        res.json({ success: true });
    })
    .catch(err => res.json({ success: false, err }));


express()
    .use(compression())
    .use(bodyParser.json())
    .get('/keys/:key', checkKey)
    .post('/sketch', processSketchUpload)
    .listen(port, () => console.info('API started at port ' + port));