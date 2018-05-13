/**
 * Created by Johnlin on 2017/8/17.
 */
var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');
var urlencodedParser = require('../middleware/bodyParse');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = require('../config/databaseUrl');
//var DB_CONN_STR = 'mongodb://localhost:27017/option';

router.get('/', function (req, res) {
    //非admin用户拦截
    var account = req.session.currentUser;
    //console.log("account:::"+account);
    if (account === "admin") {
        res.sendFile(CONSTANT.BASE_PATH + '/views/conf.html');
    } else {
        res.redirect('/login');
    }
});

//查询所有的账户信息
//$addToSet添加，$set设置
var len, Result;
router.get('/data', function (req, res) {

    var selectData = function (db, callback) {
        //连接到表
        var collection = db.collection('user');
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
        selectData(db, function (result) {

            Result = result;
            len = result.length;
            var _username = [], hostAuth = [];
            for (var i = 0; i < len; i++) {
                hostAuth[i] = {};
                //找出所有账户名,排除admin
                if (result[i].userName !== 'admin') {
                    _username.push(result[i].userName);
                    hostAuth[i]._username = result[i].userName;
                    hostAuth[i].auth = result[i].authority;
                }
            }
            //从host表中找出所有主机名及其IP
            var _selectHost = function (db, callback) {
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
                _selectHost(db, function (result) {
                    //console.log("host的查询结果是"+JSON.stringify(result));
                    db.close();
                    len = result.length;
                    var host = [];
                    for (var i = 0; i < len; i++) {
                        host[i] = {};
                        host[i].hostName = result[i].hostName;
                        host[i].IP = result[i].IP;
                    }
                    //console.log("hosts：" + JSON.stringify(host));
                    var data = {};
                    data.authority = host;
                    data.username = _username;
                    data.accountAuth = hostAuth;
                    //console.log(JSON.stringify(data));
                    res.send(data);

                });
            });
        });
    });
});

//查询此账户下的主机
router.post('/thisAccountAuthority', urlencodedParser, function (req, res) {
    var data = req.body;
    //console.log("接收到数据时"+data.account);
    var selectData = function (db, callback) {
        //连接到表
        var collection = db.collection('user');
        //查询数据
        var whereStr = {userName: data.account};
        //console.log("wherestr:" + JSON.stringify(whereStr));
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
            //console.log("请求到的数据是：" + JSON.stringify(result));
            if (result.length !== 0) {
                res.send(result[0].authority);
            }
            db.close();

        });
    });
});

//添加账户,编辑账户，添加主机和删除账户
router.post('/submit', urlencodedParser, function (req, res) {
    //console.log("接收到的"+req.body);
    var data = req.body;
    //console.log("######"+JSON.stringify(data));
    //添加用户
    if (data.option === "option1") {
        //查询数据库中是否已存在此账户,也可用selectData后返回的结果判断
        for (var i = 0; i < len; i++) {
            //若已存在该账户
            Result[i] = {};
            if (Result[i].userName === data.userName) {
                res.send(false);
                break;
            }
        }
        //不存在此账户
        if (i === len) {
            //console.log("数据库中不存在此账户，新建");
            //新建userName为userName的空对象
            var updateData = function (db, callback) {
                //连接到表
                var collection = db.collection('user');
                //新建userID,userName,password的对象
                var whereStr = {"userID": "userID_" + len, "userName": data.userName, 'password': data.passwd};
                //console.log("whereStr是：" + JSON.stringify(whereStr));
                collection.insert(whereStr, function (err, result) {
                    if (err) {
                        console.log('Error:' + err);
                        return;
                    }
                    callback(result);
                });
            };
            MongoClient.connect(DB_CONN_STR, function (err, db) {
                //console.log("连接成功！");
                updateData(db, function (result) {
                    //console.log("insert Success!!");
                    var _updateData = function (db, callback) {
                        //连接到表
                        var collection = db.collection('user');
                        //更新数据
                        var whereStr = {"userName": data.userName, "password": data.passwd};
                        //数据库操作一次只能添加一个字段，故将数组分多次添加进数据库
                        for (var i = 0; i < data.authority.length; i++) {
                            (function (i) {
                                var updateStr = {$addToSet: {'authority': data.authority[i]}};
                                collection.update(whereStr, updateStr, function (err, result) {
                                    if (err) {
                                        console.log('Error:' + err);
                                        return;
                                    }
                                    //循环到数组的最后一个项调用callback
                                    if (i === data.authority.length - 1) {
                                        callback(result);
                                    }
                                });
                            })(i)
                        }
                    };
                    MongoClient.connect(DB_CONN_STR, function (err, db) {
                        //console.log("连接成功！");
                        _updateData(db, function (result) {
                            //新建完成返回false
                            db.close();
                            res.send(true);
                            //res.send(result);
                        });
                    });
                });
            });
        }
    }

    //添加主机
    //填写信息校验
    if (data.option === "option2") {
        //查询此主机是否存在     //查询IP是否存在
        var selectData = function (db, callback) {
            //连接到表
            var collection = db.collection('host');
            //查询数据
            var whereStr = {"hostName": data.hostName};
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
                //console.log(result);
                //若查询到结果
                if (result.length !== 0) {
                    res.send(false);
                } else {
                    //没有查到结果则创建主机配置信息
                    var insertData = function (db, callback) {
                        //连接到表
                        var collection = db.collection('host');
                        //更新数据
                        var _data = {
                            "hostName": data.hostName,
                            "IP": data.address,
                            "privateKeyUrl": "/privateKey/" + data.privateKeyName,
                            "programJar": data.proJar,
                            "thirdPartDir": data.thirdJar,
                            "logDir": data.log
                        };
                        collection.insert(_data, function (err, result) {
                            if (err) {
                                console.log('Error:' + err);
                                return;
                            }
                            callback(result);
                        });
                    };
                    MongoClient.connect(DB_CONN_STR, function (err, db) {
                        //console.log("连接成功！");
                        insertData(db, function (result) {
                            //console.log(result);
                            //将新建的主机名插入admin的authority下
                            var _updateData = function (db, callback) {
                                //连接到表
                                var collection = db.collection('user');
                                //更新数据
                                var whereStr = {"userName": "admin"};
                                var updateStr = {$addToSet: {"authority": data.hostName}};
                                //console.log(JSON.stringify(whereStr));
                                //console.log(updateStr);
                                collection.update(whereStr, updateStr, function (err, result) {
                                    if (err) {
                                        console.log('Error:' + err);
                                        return;
                                    }
                                    callback(result);
                                });
                            };
                            MongoClient.connect(DB_CONN_STR, function (err, db) {
                                _updateData(db, function (result) {
                                    //console.log(result)
                                });

                            });
                            db.close();
                            res.send(true);
                        });
                    });
                }
            });
        });
    }

    //编辑账户
    if (data.option === "option3") {
        var updateData = function (db, callback) {
            //连接到表
            var collection = db.collection('user');
            //更新数据
            var whereStr = {"userName": data.editAccount};

            collection.update(whereStr, {$set: {'authority': []}}, function (err, result) {
                if (err) {
                    console.log('Error:' + err);
                }
            });

            for (var i = 0; i < data.authority.length; i++) {
                (function (i) {
                    var updateStr;
                    //只编辑了权限
                    if (data.changePasswd === "") {
                        updateStr = {$addToSet: {'authority': data.authority[i]}};
                    }//只编辑了密码
                    else if (data.authority === "") {
                        updateStr = {$set: {"password": data.changePasswd}};
                    } else if (data.authority === undefined) {
                        updateStr = {$set: {"password": data.changePasswd}};
                    }
                    else {//更改了所有
                        updateStr = {
                            $addToSet: {'authority': data.authority[i]},
                            $set: {"password": data.changePasswd}
                        };
                    }
                    collection.update(whereStr, updateStr, function (err, result) {
                        if (err) {
                            console.log('Error:' + err);
                            return;
                        }
                        //循环到数组的最后一个项调用callback
                        if (i === data.authority.length - 1) {
                            callback(result);
                        }
                    });
                })(i)
            }
        };
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            //console.log("连接成功！");
            updateData(db, function (result) {
                //操作成功
                db.close();
                res.send(true);
            });
        });
    }

    //删除账户
    if (data.option === "option4") {
        //console.log("删除的" + data.delSelect);
        var delData = function (db, callback) {
            //连接到表
            var collection = db.collection('user');
            //删除数据
            for (var i = 0; i < data.delSelect.length; i++) {

                (function (i) {
                    var whereStr = {"userName": data.delSelect[i]};
                    //删除此账户
                    collection.remove(whereStr, function (err, result) {
                        if (err) {
                            console.log('Error:' + err);
                        }
                       /* if (i === data.delSelect.length - 1) {
                            callback(result);
                        }*/
                    });
                    //删除该账户下的内存核心配置
                    var _collection = db.collection('site');
                    var _whereStr = {"account": data.delSelect[i]};
                    _collection.remove(_whereStr, function (err, result) {
                        //console.log('要删除的'+JSON.stringify(whereStr));
                        if (err) {
                            console.log('Error:' + err);
                        }
                        if (i === data.delSelect.length - 1) {
                            callback(result);
                        }
                    });
                })(i);
            }
        };
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            //console.log("连接成功！");
            delData(db, function (result) {
                //console.log(result);
                db.close();
                res.send(true);
            });
        });
    }
});

//获取选择的当前账户与主机对应请求的数据
router.post('/confData', urlencodedParser, function (req, res) {
    var data = req.body;

    if (data.option === "option5") {
        var selectData = function (db, callback) {
            //连接到表
            var collection = db.collection('site');
            //查询数据
            var whereStr = {ip: data.ip, account: data.selectAccount};
            //console.log("wherestr:" + JSON.stringify(whereStr));
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
                //console.log("请求到的数据是：" + JSON.stringify(result));
                db.close();
                res.send(result);
            });
        });
    }
});

//增加内存等配置
router.post('/addData', urlencodedParser, function (req, res) {

    if (req.session.currentUser === "admin") {
        var data = req.body;
        var _data = data.addValue.split(" ");
        //验证要添加的当前账户及该主机对应的数据是否已存在
        //先查询一遍现有的数据
        var selectData = function (db, callback) {
            //连接到表
            var collection = db.collection('site');
            //查询数据
            var whereStr = {ip: data.ip, account: data.selectAccount};
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
                //console.log("结果是：" + JSON.stringify(result) + ", result.length:" + result.length);//[]
                //未找到则新建
                if (result.length === 0) {
                    //console.log("新建!!!");
                    newData(data);
                } else {
                    MongoClient.connect(DB_CONN_STR, function (err, db) {
                        //console.log("连接成功！");
                        _updateData(db, function (result) {
                            db.close();
                            res.send(true);
                        });
                    });
                }
            });
            db.close();
        });
    } else {
        res.redirect("/login");
    }
    var _updateData = function (db, callback) {
        //var key, count = 0;
        //连接到表
        var collection = db.collection('site');
        //更新数据
        var whereStr, updateStr;
        if (data.addTypesId === "dm") {
            whereStr = {ip: data.ip, account: data.selectAccount};
            updateStr = {$addToSet: {'dm': {$each: _data}}};
        }
        if (data.addTypesId === "ec") {
            whereStr = {ip: data.ip, account: data.selectAccount};
            updateStr = {$addToSet: {'ec': {$each: _data}}};
        }
        if (data.addTypesId === "em") {
            whereStr = {ip: data.ip, account: data.selectAccount};
            updateStr = {$addToSet: {'em': {$each: _data}}};
        }
        //console.log("whereStr" + JSON.stringify(whereStr));
        //console.log("updateStr" + JSON.stringify(updateStr));
        collection.update(whereStr, updateStr, function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    };

    var newData = function (data) {
        //console.log("添加的数据是：" + JSON.stringify(data));
        var updateData = function (db, callback) {
            //连接到表
            var collection = db.collection('site');
            //更新数据
            var info = {
                ip: data.ip, account: data.selectAccount, dm: [], ec: [], em: []
            };
            //console.log("data是："+data);
            //var updateStr = {$addToSet: {'dm': '', 'ec': '', 'em': ''}};
            collection.insert(info, function (err, result) {
                if (err) {
                    console.log('Error:' + err);
                    return;
                }
                callback(result);
            });
        };
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            //console.log("连接成功！");
            updateData(db, function (result) {
                //console.log("请求新建ip得到的结果：" + JSON.stringify(result));
                //res.send([]);
                MongoClient.connect(DB_CONN_STR, function (err, db) {
                    //console.log("连接成功！");
                    _updateData(db, function (result) {
                        db.close();
                        res.send(true);
                    });
                });
                db.close();
                //为新建的ip项添加属性
            });
        });
    };
});

router.post('/delData', urlencodedParser, function (req, res) {
    //var currentAccount = req.session.currentUser;
    if (req.session.currentUser === "admin") {
        var data = req.body;
        //var delData = Data.delSelectVal;
        //data.delSelectVal = parseInt(data.delSelectVal);
        //console.log("删除信息:" + JSON.stringify(data));
        var updateData = function (db, callback) {
            //连接到表
            var collection = db.collection('site');
            //更新数据
            var whereStr, updateStr;
            if (data.delTypesId === "dm") {
                whereStr = {ip: data.ip, account: data.selectAccount, dm: data.delSelectVal};
                updateStr = {$set: {'dm.$': ''}};
            }
            if (data.delTypesId === "ec") {
                whereStr = {ip: data.ip, account: data.selectAccount, ec: data.delSelectVal};
                updateStr = {$set: {'ec.$': ''}};
            }
            if (data.delTypesId === "em") {
                whereStr = {ip: data.ip, account: data.selectAccount, em: data.delSelectVal};
                updateStr = {$set: {'em.$': ''}};
            }
            //console.log(JSON.stringify(whereStr) + "#######" + JSON.stringify(updateStr));
            collection.update(whereStr, updateStr, function (err, result) {
                if (err) {
                    console.log('Error:' + err);
                    return;
                }
                callback(result);
            });
        };
        MongoClient.connect(DB_CONN_STR, function (err, db) {
            //console.log("连接成功！");
            updateData(db, function (result) {
                //console.log(result);
                db.close();
                res.send(true);
            });
        });
    } else {
        res.redirect("/login");
    }
});

module.exports = router;