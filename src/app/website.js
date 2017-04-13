const compression = require('compression');
const config = require('config');
const ect = require('ect');
const express = require('express');

const documents = require('../documents');
const users = require('../users');


const port = config.get('website.port');


const showUserPage = (req, res) => Promise.all([
        users.getById(req.params.userId || ''),
        documents.getAllByUserId(req.params.userId || '')
    ])
    .then(result => res.render('user', {
        success: true,
        user: result[0],
        documents: result[1]
    }))
    .catch(err => res.redirect('/'));

const sendPrettyJSON = (res, json) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json, null, 2));
};


express()
    .use(compression())
    .use('/static', express.static('static'))

    .get('/', (req, res) => res.render('index'))

    // TODO: Make these endpoints secure
    .get('/users/:userId', showUserPage)
    .get('/users.json', (req, res) => users.getAll().then(users => sendPrettyJSON(res, users)))
    .post('/users.json', (req, res) => users.create().then(user => sendPrettyJSON(res, user)))

    .set('view engine', 'ect')
    .set('views', __dirname + '/../../views/website')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../../views/website'
    }).render)
    .listen(port, () => console.info('Website started at port ' + port));