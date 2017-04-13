const config = require('config');
const moment = require('moment');
const uuid = require('uuid/v4');

const db = require('./db');


const cookieName = config.get('website.authCookie.name');
const cookieLifetimeDays = config.get('website.authCookie.expireDays');


const create = profile => {
    const user = {
        id: profile.id,
        cookieToken: uuid(),
        keys: [ uuid() ],
        profile
    };

    return db.upsertUser(user).then(result => user);
};

const getAll = () => db.getUsers();

const getById = id => db.getUserById(id);

const getByKey = key => db.getUserByKey(key);

const setToken = (user, res) => {
    res.cookie(cookieName, user.cookieToken, {
        expires: moment().add(cookieLifetimeDays, 'days').toDate(),
        httpOnly: true,
        secure: false // TODO: Use HTTPS and change
    });

    return res;
};

const getByToken = req => {
    const token = req.cookies[cookieName];

    if (token === undefined) {
        return Promise.reject('No cookie token');
    }

    return db.getUserByCookieToken(token);
};


module.exports = {
    create,
    getAll,
    getById,
    getByKey,
    setToken,
    getByToken
};