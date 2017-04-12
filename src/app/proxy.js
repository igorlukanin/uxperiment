const compression = require('compression');
const config = require('config');
const express = require('express');
const got = require('got');

const documents = require('../documents');
const users = require('../users');


const port = config.get('s3.bucket');
const port = config.get('proxy.port');


const getS3Uri = path => `https://s3.amazonaws.com/${bucket}/${path}/index.html`;


express()
    .use(compression())
    .get('/:id', (req, res) => got.stream(getS3Uri(req.params.id)).pipe(res))
    .listen(port, () => console.info('Proxy started at port ' + port));