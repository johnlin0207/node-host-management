/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var app = express();

app.set('views','./views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(require('../middleware/session'));

exports = module.exports = app;