/**
 * Created by johnlin on 2017/7/13.
 */
var express = require('express');
var router = express.Router();
var urlencodedParser = require('../middleware/bodyParse');
var node_ssh = require('node-ssh');

ssh = new node_ssh();
router.post('/process', urlencodedParser, function (req, res) {
    var conf = {
        driverMemory: ' --driver-memory ',
        cores: ' --total-executor-cores ',
        executorMemory: ' --executor-memory '
    };
    var data = req.body;
    //console.log("data是：" + JSON.stringify(data));
    var driverMemory = data.driverMemory;
    var cores = data.cores;
    var executorMemory = data.executorMemory;
    var resultStr = '/app/spark/bin/spark-submit ';
    resultStr += '--class ' + data.exeClass + ' ';
    resultStr += '--master ' + data.master + ' ';
    var host = req.session.currentHost;
    //console.log("resultStr111111是：" + resultStr);
    if (data.thirdJar) {
        resultStr += '--jar ';
        var thirdJar = data.thirdJar.split(",");
        for (i in thirdJar) {
            resultStr += host.programJar + thirdJar[i] + ' ';
        }
    }
    if (data.other) {
        var others = data.other.split(";");
        for (i in others) {
            resultStr += '--conf ' + others[i] + ' ';
        }
    }
    if (driverMemory) {
        if (driverMemory - 0 > 10) {
            driverMemory = '10';
        }
        resultStr += conf.driverMemory + driverMemory + 'g ';
    }
    if (cores) {
        if (cores - 0 > 10) {
            cores = '10';
        }
        resultStr += conf.cores + cores + ' ';
    }
    if (executorMemory) {
        if (executorMemory - 0 > 10) {
            executorMemory = '10'
        }
        resultStr += conf.executorMemory + executorMemory + 'g ';
    }
    var time = new Date().getTime();
    resultStr += host.programJar + data.jar + ' ';
    if (data.inputParam) {
        var inputParam = data.inputParam.split(" ");
        for (i in inputParam) {
            resultStr += inputParam[i] + ' ';
        }
        resultStr += data.inputParam + ' ';
    }
    if (data.logName) {
        //创建以时间戳为名字的文件夹/app/logs/1000000,日志位置:/app/logs/1000000/logName.log
        resultStr += '>> ' + host.logDir + time + "/" + data.logName;
    }
    if (data.nohup) {
        resultStr = 'nohup ' + resultStr + ' &';
    }
    var mkdirCom;
    if (data.logName === "") {
        mkdirCom = "";
    } else {
        mkdirCom = "mkdir " + time;
    }
    ssh.connect(req.session.account)
        .then(function () {
            //console.log("test1");
            //创建以时间戳为log的目录，并将log放入其中
            ssh.execCommand(mkdirCom, {cwd: host.logDir})
                .then(function (result) {
                    if (result.stderr) {
                        res.send(result.stderr.split('\n'));
                    } else {
                        //console.log("在时间戳文件夹输入的命令：" + resultStr);
                        //在该时间戳文件夹下执行submit提交过来的命令
                        ssh.execCommand(resultStr, {cwd: host.logDir + time})
                            .then(function (result) {
                                //console.log("test5");
                                if (result.stderr) {
                                    res.send(result.stderr.split('\n'));
                                } else {
                                    //返回拼接的字符串
                                    ssh.execCommand('echo \'' + resultStr + '\' | cat >> ' + data.logName + '.log', {cwd: host.logDir + time})
                                        .then(function (result) {
                                            if (!result.stderr) {
                                                var resultArray = result.stdout.split('\n');
                                                resultArray.unshift(resultStr);
                                                res.send(resultArray);
                                            } else {

                                                res.send(result.stderr.split('\n'));
                                            }
                                        })
                                }
                            });
                    }
                })
        }, function () {
            res.send(['>>>>不能连接主机，请确认你的登录信息或网络状况！']);
        });
});

module.exports = router;