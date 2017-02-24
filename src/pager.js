const documents = require('./documents');
const page = require('./page');


documents.feedAllUnready().then(cursor => {
    cursor.each((err, change) => {
        const document = change.new_val;

        // TODO: Remove later
        if (document.id != 'dd7baddf-32dd-41af-b1c3-1f239ef45f04') {
            return;
        }

        // console.log(document);

        page.create(document);
    });

    console.info('Pager started.');
});