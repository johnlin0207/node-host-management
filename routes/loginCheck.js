/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var router = express.Router();
var urlencodedParser = require('../middleware/bodyParse');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = require('../config/databaseUrl');
//var DB_CONN_STR = 'mongodb://localhost:27017/option';
var CONSTANT = require('../config/constant');

var len, users = {}, userID;
var username, userName;
var password;
router.post('/', urlencodedParser, function (req, res) {
    username = req.body.username;
    password = req.body.password;
    //查询user
    var selectData = function (db, callback) {
        //连接到表
        var collection = db.collection('user');
        //查询数据
        var whereStr = {"userName": username};
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
            //console.log("查询到的此账户信息"+JSON.stringify(result));
            //users为查询到的结果组装的数据
            //console.log("result结果是：" + JSON.stringify(result));
            if (result.length !== 0) {
                //将结果赋值给users对象
                users.username = result[0].userName;
                users.password = result[0].password;
                if (users.username === username && users.password === password) {
                    users.authority = result[0].authority;
                    req.session.currentUser = users.username;
                    userName = users.username;
                    userID = result[0].userID;

                    //根据user查询对应的主机
                    var hosts = {};
                    var _selectData = function (db, callback) {
                        //连接到表
                        var collection = db.collection('host');
                        //查询数据
                        var whereStr = {};
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
                        _selectData(db, function (result) {
                            len = result.length;
                            var hostId;
                            //组装hosts数据
                            for (var i = 0; i < len; i++) {
                                hostId = result[i].hostName;
                                //hosts是一个{}，包含键名为hostId的{}，该对象包含该类主机的所有信息
                                hosts[hostId] = {};
                                hosts[hostId].IP = result[i].IP;
                                hosts[hostId].privateKeyUrl = result[i].privateKeyUrl;
                                hosts[hostId].programJar = result[i].programJar;
                                hosts[hostId].thirdPartDir = result[i].thirdPartDir;
                                hosts[hostId].logDir = result[i].logDir;
                            }
                            req.session.hostInfo = hosts;
                            if (userID) {
                                req.session.selections = [];
                                var hostSelections = req.session.selections;
                                //lostHost是存在于某个账户中可以管理的主机，但该主机已被删除
                                //hostValue是某个账户中可以管理的主机
                                var lostHost = [],hostValue = [];
                                //hostSelections.userID=userID;
                                for (var i = 0; i < users.authority.length; i++) {
                                    hostValue.push(users.authority[i]); //hostValue是拥有的所有主机,host1,host2...
                                    //拿账号拥有的主机去所有的主机里匹配，若所有的主机中不存在该账号中的某个主机则跳过
                                }
                                var Len = hostValue.length;
                                //遍历账户拥有的主机
                                for (var j = 0; j < Len; j++) {
                                    //遍历所有现存的主机
                                    for (var i = 0; i < len; i++) {
                                        if (hostValue[j] === result[i].hostName) {
                                            //selection临时保存该账户中一个存在的有效主机名和ip,最终将selection依次push进session.selections
                                            var selection = {};
                                            selection['hostValue'] = hostValue[j];
                                            selection['hostIP'] = hosts[hostValue[j]].IP;
                                            hostSelections.push(selection);
                                            break;
                                        }
                                    }
                                    if (i === len) {
                                        //若该账户的其中一个主机名在所有现存的主机中遍历一遍都没有找到结果
                                        lostHost.push(hostValue[j]);
                                        //res.json({status:"other",lostData:lostHost});
                                    }
                                }
                                res.json({status: true, lostData: lostHost});
                                //res.redirect("/user")
                            }
                            db.close();
                        });
                    });
                } else {
                    //console.log("匹配失败!");
                    res.json({status: false})
                }
            } else {
                //console.log("匹配失败!");
                res.json({status: false})
            }
        });
        db.close();
    });
});

router.get('/account', function (req, res) {
    res.send(userName)
});
//验证admin
router.get('/verify', function (req, res) {
    if (username === "admin") {
        res.send(true)
    }
});
router.get('/animation', function (req, res) {
    res.sendFile(CONSTANT.BASE_PATH + '/views/animation.html');
});

module.exports = router;