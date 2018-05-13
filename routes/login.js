/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');

router.get('/', function(req, res){
    res.sendFile(CONSTANT.BASE_PATH + '/views/login.html');
});

module.exports = router;