/**
 * Created by johnlin on 2017/7/11.
 */
var express = require('express');
var router = express.Router();
var urlencodedParser = require('../middleware/bodyParse');
var CONSTANT = require('../config/constant');
var fs = require('fs');
//var config = require('../config/_config'),
//options = config.options;
var node_ssh = require('node-ssh');

ssh = new node_ssh();
router.post('/', urlencodedParser, function (req, res) {
    var _cmd;
    var retRes = {};
    // console.log("刚接收到的菜单标号" + JSON.stringify(req.body) + "----------------------------------");
    if (req.body.type === 'click') { //点击了“查看文件内容”菜单或点击了上传文件中的“第三方jar包”或者“程序jar包”
        _cmd = 'ls';
        req.body.params = _cmd;
        // console.log("触发了click,此时的命令是" + _cmd);
    } else {  //命令提交
        _cmd = req.body.params;
        // console.log("输入的命令是：" + _cmd);

        if (_cmd === ' ') {
            res.send(['>>>>错误，你的指令为空！']);
        }
        if (_cmd === "ls") {
            _cmd = 'pwd';

        }
        //spark-submit菜单内容
        if (_cmd.indexOf('spark-submit') !== -1) {
            var cmdArray = _cmd.split(' --');
            var result = [];
            for (var i = 0; i < cmdArray.length; i++) {
                var numberStr = cmdArray[i].match(/\s\d+/g);
                if (numberStr) {
                    var isFind = false;
                    var number = numberStr[0].trim() - 0;
                    var params = cmdArray[i].split(numberStr);
                    var param = params[0];
                    if (number > 10 && param.indexOf('driver-memory') !== -1) {
                        cmdArray[i] = param + ' 10';
                        isFind = true;
                    }
                    if (!isFind && number > 10 && param.indexOf('total-executor-cores') !== -1) {
                        cmdArray[i] = param + ' 10';
                        isFind = true;
                    }
                    if (!isFind && number > 10 && param.indexOf('executor-memory') !== -1) {
                        cmdArray[i] = param + ' 10';
                        isFind = true;
                    }
                    if (params[1]) {
                        cmdArray[i] += params[1];
                    }
                }
                result.push(cmdArray[i]);
            }
            _cmd = result.join(' --');
            res.send([_cmd]);
        }
    }

    // ssh连接操作
    var hostInfo = req.session.hostInfo;
    var user = hostInfo[req.session.host];
    var directory;
    //var user = config[req.session.host];
    if (req.body.cmd == "option0") {
        //发送命令，默认位置是~；jar包目录是其对应的目录
        directory = "~";
    }
    else if (req.body.cmd == "option1") {  //该用户的LOG目录
        directory = user.logDir;
    }
    else if (req.body.cmd == "option2") {
        directory = req.query.isThirdPart ? user.thirdPartDir : user.programJar;
    }

    if (req.body.params === "ls") {
        // console.log(_cmd);
        ssh.connect(req.session.account)
            .then(function () {
                //  var host = req.session.host;
                //  Command
                ssh.execCommand(_cmd, {cwd: directory})
                    .then(function (result) {
                        if (!result.stderr) {

                            if (_cmd === "pwd") {
                                retRes.pwd = result.stdout+"/";
                                _cmd = req.body.params;
                            } else {
                                retRes.pwd = directory;
                                retRes.cont = result.stdout;
                                result.params = _cmd;
                            }
                        } else {
                            res.send(result.stderr.split('\n'));
                        }
                    })
                    .then(function () {
                        ssh.execCommand(_cmd, {cwd: directory}).then(function (result) {
                            if (!result.stderr) {
                                retRes.cont = result.stdout.split('\n');
                                retRes.params = req.body.params;
                                res.send(retRes);
                            } else {
                                res.send(result.stderr.split('\n'));
                            }
                        });
                    }, function () {
                        res.send(['>>>>不能连接主机，请确认你的登录信息或网络状况！']);
                    });
            }, function () {
                res.send(['>>>>不能连接主机，请确认你的登录信息或网络状况！']);
            })

    } else {
        ssh.connect(req.session.account)
            .then(function () {
                //  var host = req.session.host;
                // Command
                ssh.execCommand(_cmd, {cwd: directory})
                    .then(function (result) {
                        if (!result.stderr) {
                            //顺序执行
                            retRes.pwd = "";
                            retRes.cont = result.stdout.split('\n');
                            retRes.params = req.body.params;
                            res.send(retRes);
                            //console.log(retRes);
                        } else {
                            res.send(result.stderr.split('\n'));
                        }
                    })
            }, function () {
                res.send(['>>>>不能连接主机，请确认你的登录信息或网络状况！']);
            })
    }
});

//从目标主机下载至服务器
var targetName;
router.post('/download', urlencodedParser, function (req, res) {

    var path = req.body.params;
    //删除两头的空格
    path = path.replace(/^\s+|\s+$/g, "");
    var index = path.lastIndexOf("\/");
    //如果最后一个字符是/则取最后两个/之间的字符串作为targetName
    if(index===path.length-1){
        path=path.substring(0,path.length-1);
    }
    //目标名称
    index = path.lastIndexOf("\/");
    targetName = path.substring(index + 1, path.length);
    //路径
    var dir = path.replace(targetName, "");
    //test -d aaa =>> echo $?==='0'是文件夹
    ssh.execCommand("test -d " + targetName + " ; echo $?", {cwd: dir}).then(function (result) {
        var getFile = function (targetName, path) {
            ssh.getFile(CONSTANT.BASE_PATH + '/temp/' + targetName, path).then(function (Contents) {
                res.send(true);
                if (targetName.indexOf(".zip") !== -1) {
                    //删除主机中的压缩包
                    ssh.execCommand("rm " + targetName, {cwd: dir}).then(function (result) {
                    });
                }
            }, function (error) {
                console.log("Something's wrong");
                console.log(error);
                res.send(false);
            });
        };

        //若是文件
        if (parseInt(result.stdout)) {
            //console.log("it's a file");
            //发送命令来判断该名称是不是文件夹（0），是的话先执行压缩命令，下载压缩包后返回成功再去linux执行删除该压缩包命令
            //如果该名称是文件（1）则直接下载该文件
            getFile(targetName, path);
        }
        //文件夹
        if (!parseInt(result.stdout)) {
            //console.log("it's a dir");
            //压缩文件夹,把*目录压缩为xxx.zip命令：zip -r xxx.zip ./*
            ssh.execCommand('zip -r ' + targetName + '.zip ./' + targetName, {cwd: dir}).then(function (result) {
                targetName = targetName + ".zip";
                path = dir + targetName;
                getFile(targetName, path);
            })
        }
    });
});

//从服务器传输到客户端
router.get('/downloadFile', function (req, res) {
    //console.log(CONSTANT.BASE_PATH + '/temp/' + fileName);
    res.download(CONSTANT.BASE_PATH + '/temp/' + targetName, targetName, function (err) {
        if (err) {
            console.log(err);
        } else {
            //console.log('downloading successful');
            fs.unlinkSync(CONSTANT.BASE_PATH + '/temp/' + targetName);
        }
    });
});

module.exports = router;