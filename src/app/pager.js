const documents = require('../documents');
const pages = require('../pages');


documents.feedAllUnready().then(cursor => {
    cursor.each((err, change) => {
        const snapshot = change.new_val;

        if (snapshot === null) {
            return;
        }

        pages
            .create(snapshot)
            .then(() => {
                documents.setReady(snapshot.id);
                console.log(snapshot.id);
            });
    });

    console.info('Pager started.');
});