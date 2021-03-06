const Promise = require('bluebird');


const check = result => result.errors === 0
    ? Promise.resolve(result.generated_keys)
    : Promise.reject();

const toArray = cursor => cursor.toArray();

const toUnit = cursor => cursor.toArray().then(array => array.length !== 1
    ? Promise.reject('There must be one and only one result')
    : Promise.resolve(array[0]));


module.exports = {
    check,
    toArray,
    toUnit
};