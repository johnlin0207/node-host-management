/**
 * Created by johnlin on 2017/7/11.
 */
var fs = require('fs');
var express = require('express');
var router = express.Router();
var CONSTANT = require('../config/constant');
var urlencodedParser = require('../middleware/bodyParse');
var node_ssh = require('node-ssh');

ssh = new node_ssh();

router.post('/', urlencodedParser, function (req, res) {
    var account = {};
    //hostInfo是现存的所有的主机信息
    var hostInfo = req.session.hostInfo;
    //host是要登录的主机地址,hostUser是要登录的用户名
    var host = req.body.host, hostUser = req.body.hostUser;
    if (hostUser) {
        var user = hostInfo[host];
        req.session.currentHost = user; //当前主机所有信息
        account.host = user.IP;
        account.username = hostUser;
        //req.session.hostName=account.username;
        try {
            account.privateKey = fs.readFileSync(CONSTANT.BASE_PATH + user.privateKeyUrl).toString();
            req.session.account = account; //此条主机对应的信息
            req.session.host = host; //当前主机IP

            //console.log(JSON.stringify(req.session.account));
            ssh.connect(req.session.account) //host,username,privateKey
                .then(function () {
                    res.send({status: 1, userName: account.username});

                }, function () {
                    res.send({status: 0});
                });
        } catch (e) {
            res.send(e);
        }
    } else {
        res.status(404).send('404 Not Found!');
    }
});

module.exports = router;