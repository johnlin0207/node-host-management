/**
 * Created by johnlin on 2017/7/11.
 */
var session = require('express-session');

exports = module.exports = session({
    secret: 'keyboard cat',
    resave: false,
    cookie: {maxAge: 5 * 60 * 60000 },
    saveUninitialized: false
});