const compression = require('compression');
const config = require('config');
const cookieParser = require('cookie-parser');
const ect = require('ect');
const express = require('express');

const db = require('../db');
const documents = require('../documents');
const google = require('../google');
const users = require('../users');


const port = config.get('website.port');


const getUserData = req => users.getByToken(req)
    .then(user => Promise.all([
        user,
        documents.getAllByUserId(user.id)
    ]))
    .then(result => ({
        user: result[0],
        documents: result[1]
    }));


express()
    .use(compression())
    .use(cookieParser())

    .use('/', express.static('static'))
    .use('/fonts', express.static('node_modules/lato-font/fonts'))
    .use('/fonts/lato.css', express.static('node_modules/lato-font/css/lato-font.min.css'))

    .get('/', (req, res) => res.render('index'))

    .get('/status.json', (req, res) => db.getCounts()
        .then(counts => res.json(counts)))

    .get('/login', (req, res) => res.redirect(google.getOAuthUrl()))

    .get('/login/result', (req, res) => google.getOAuthUser(req.query.code)
        .then(users.create)
        .then(user => users.setToken(user, res).redirect('/user'))
        .catch(err => res.render('index')))

    .get('/user', (req, res) => getUserData(req)
        .then(data => res.render('user', data))
        .catch(err => res.render('index')))

    .set('view engine', 'ect')
    .set('views', __dirname + '/../../views/website')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../../views/website'
    }).render)
    .listen(port, () => console.info('Website started at port ' + port));