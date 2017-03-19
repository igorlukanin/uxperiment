const config = require('config');
const ect = require('ect');
const s3 = require('aws-sdk/clients/s3');


const renderer = ect({
    root: __dirname + '/../views/pager',
    ext: '.ect'
});


const settings = config.get('s3');
const client = new s3(settings);


const createFile = (path, contentType, content) => new Promise((resolve, reject) => {
    const params = {
        Bucket: settings.bucket,
        ACL: 'public-read',
        Key: path,
        ContentType: contentType,
        Body: content
    };

    client.putObject(params, (err, data) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(data);
        }
    });
});

const createHtmlFile = (id, name, content) => createFile(id + '/' + name + '.html', 'text/html', content);

const create = snapshot => {
    renderer.render('index', snapshot, (err, html) => {
        return createHtmlFile(snapshot.document.id, 'index', html);
    });
};


module.exports = {
    create
};