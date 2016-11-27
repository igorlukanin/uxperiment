const compression = require('compression');
const config = require('config');
const ect = require('ect');
const express = require('express');
const fs = require('fs');
const hash = require('honesthash')({ speed: 1 });
const multer = require('multer');
const Promise = require('bluebird');
const rmrf = Promise.promisify(require('rimraf'));

const git = require('./git');

const dataDirectory = config.get('data.directory');
const dataUrl = config.get('data.url');
const port = config.get('website.port');

const upload = multer({ storage: multer.memoryStorage() });


const createId = () => hash.hex(process.hrtime()).substr(0, 16);

const startWebsite = () => express()
    .use(compression())
    .use('/', express.static('static'))

    .use('/dropzone.js', express.static('node_modules/dropzone/dist/min/dropzone.min.js'))
    .use('/dropzone.css', express.static('node_modules/dropzone/dist/min/dropzone.min.css'))

    .get('/', (req, res) => res.render('index'))

    .post('/upload', upload.array('file'), (req, res) => {
        if (req.files.length > 0) {
            const id = createId();
            const path = dataDirectory + '/' + id;

            fs.mkdirSync(path);

            const index = {
                files: []
            };

            req.files.forEach(file => {
                index.files.push(file.originalname);

                const descriptor = fs.openSync(path + '/' + file.originalname, 'w');
                fs.writeSync(descriptor, file.buffer, 0, file.size);
                fs.closeSync(descriptor);
            });

            fs.writeFileSync(path + '/index.json', JSON.stringify(index));

            git.add(path, 'index.json')
                .then(() => Promise.all(index.files.map(file => git.add(path, file))))
                .then(() => git.commit(path, id))
                .then(() => git.push(path, 'origin', 'master'));

            return res.send(id);
        }
        else {
            return res.sendStatus(500);
        }
    })

    .get('/experiment/:id', (req, res) => {
        const id = req.params.id;
        const index = JSON.parse(fs.readFileSync(dataDirectory + '/' + id + '/index.json'));

        return res.render('experiment', {
            id,
            index
        });
    })

    .set('view engine', 'ect')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../views'
    }).render)
    .listen(port, () => console.info('Website started at port ' + port));


const updateDataDirectory = () => rmrf(dataDirectory)
    .then(() => git.clone(dataUrl, dataDirectory))
    .then(() => console.info('Data directory cloned'));


updateDataDirectory()
    .then(startWebsite)
    .catch(err => console.err(err));