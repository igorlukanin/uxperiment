const compression = require('compression');
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');


const port = config.get('api.port');


const processSketchUpload = (req, res) => {
    console.log(JSON.stringify(req.body));

    res.json({ success: true });
};


express()
    .use(compression())
    .use(bodyParser.json())
    .post('/sketch', processSketchUpload)
    .listen(port, () => console.info('API started at port ' + port));