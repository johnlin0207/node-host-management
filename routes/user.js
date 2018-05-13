/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');

router.get('/', function (req, res) {
    var hostSelections = req.session.selections;
    // res.sendFile(__dirname+'/views/user.html');
    if (hostSelections) {
        res.render('user', {hostSelections: hostSelections});
    } else {
        res.redirect('/login');
    }
});

module.exports = router;