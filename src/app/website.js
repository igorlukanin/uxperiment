const _ = require('lodash');
const compression = require('compression');
const config = require('config');
const ect = require('ect');
const express = require('express');

const documents = require('../documents');
const users = require('../users');


const port = config.get('website.port');
const bucket = config.get('s3.bucket');

const getLastSnapshot = snapshots => snapshots.reduce((last, current) =>
    last === undefined || current.datetime.getTime() > last.datetime.getTime() ? current : last, undefined);

const getLinkToSnapshot = snapshot => "https://s3.amazonaws.com/" + bucket + "/" + snapshot.document.id + "/index.html";

const showUserPage = (req, res) => Promise.all([
        users.getById(req.params.userId || ''),
        documents.getAllByUserId(req.params.userId || '')
    ])
    .then(result => {
        const user = result[0];

        const snapshotGroups = _.groupBy(result[1], 'document.id');
        const documents = Object.keys(snapshotGroups)
            .map(documentId => {
                const lastSnapshot = getLastSnapshot(snapshotGroups[documentId]);

                return {
                    documentId,
                    snapshots: {
                        count: snapshotGroups[documentId].length,
                        lastDateTime: lastSnapshot.datetime,
                        lastLink: getLinkToSnapshot(lastSnapshot),
                        metrikaLink: 'https://metrika.yandex.ru/dashboard?id=43828674'
                    }
                };
            });

        return res.render('user', {
            success: true,
            user,
            documents
        });
    })
    .catch(err => res.render('user', { success: false, err }));

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