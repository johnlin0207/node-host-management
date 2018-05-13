/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var router = express.Router();
//var urlencodedParser = require('../middleware/bodyParse');
var CONSTANT = require('../config/constant');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = require('../config/databaseUrl');
//var DB_CONN_STR = 'mongodb://localhost:27017/option';
fs = require('fs');
var ip;

router.get('/', function (req, res) {
    var account = req.session.account;
    //console.log("account是："+account);
    if (account) {
        res.ip = account.host;
        res.username = account.username;
        res.sendFile(CONSTANT.BASE_PATH + '/views/cmd.html');
    } else {
        res.redirect('/login');
    }
});

router.get('/getIp', function (req, res) {
    var account = req.session.account;
    if (account) {
        res.send({ip: account.host, userName: account.username});
    } else {
        res.redirect('/login');
    }
});
//查询
router.get('/getData', function (req, res) {
    ip = req.session.account.host;
    var currentAccount = req.session.currentUser;

    //先查询一遍现有的数据
    var selectData = function (db, callback) {
        //连接到表
        var collection = db.collection('site');
        //查询数据
        var whereStr = {ip: ip, account: currentAccount};
        collection.find(whereStr).toArray(function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    };
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        //console.log("连接成功！");
        selectData(db, function (result) {
            db.close();
            res.send(result);

        });
    });
});

module.exports = router;