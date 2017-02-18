const compression = require('compression');
const config = require('config');
const ect = require('ect');
const express = require('express');


const port = config.get('website.port');


const processSketchUpload = (req, res) => {
    console.log(JSON.stringify(req.body));

    res.json({ success: true });
};


express()
    .use(compression())
    .use('/static', express.static('static'))
    .get('/', (req, res) => res.render('index'))
    .set('view engine', 'ect')
    .engine('ect', ect({
        watch: true,
        root: __dirname + '/../views'
    }).render)
    .listen(port, () => console.info('Website started at port ' + port));