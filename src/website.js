const compression = require('compression');
const config = require('config');
const ect = require('ect');
const express = require('express');

const users = require('./users');


const port = config.get('website.port');

const sendPrettyJSON = (res, json) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json, null, 2));
};


express()
    .use(compression())
    .use('/static', express.static('static'))

    .get('/', (req, res) => res.render('index'))

    // TODO: Make these endpoints secure
    .get('/users.json', (req, res) => users.getAll().then(users => sendPrettyJSON(res, users)))
    .post('/users.json', (req, res) => users.create().then(user => sendPrettyJSON(res, user)))

    .set('view engine', 'ect')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../views'
    }).render)
    .listen(port, () => console.info('Website started at port ' + port));