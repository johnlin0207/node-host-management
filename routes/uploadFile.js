/**
 * Created by johnlin on 2017/7/11.
 */
var fs = require('fs');
var express = require('express');
var router = express.Router();
var upload = require('../middleware/multer');
router.post('/', upload.single('myfile'), function (req, res) {
    // 没有附带文件
    if (!req.file) {
        res.send(['>>>>错误，上传文件为空！']);
        return;
    }

    var filename = req.file.originalname;
    //当前使用的主机名
    var user = req.session.currentHost;
    //req.query.isThirdPart将“isThirdPart=1”解析为1
    var url = req.query.isProgramJar ? user.programJar : user.thirdPartDir;

    ssh.connect(req.session.account)
        .then(function () {
            ssh.putFile(CONSTANT.BASE_PATH + '/temp/' + filename, url + filename)
                .then(function () {
                    //console.log("The File thing is done");
                    fs.unlinkSync(CONSTANT.BASE_PATH + '/temp/' + filename);
                }, function (error) {
                    console.log("Something's wrong");
                    console.log(error);
                    res.send(['>>>>不能连接主机，请确认你的登录信息或网络状况！']);
                })
                .then(function () {
                    ssh.execCommand('ls', {cwd: url}).then(function (result) {
                        if (!result.stderr) {
                            // windows cmd 中以\n为换行
                            var resultArray = result.stdout.split('\n');
                            resultArray.unshift('>>>>上传成功！');
                            res.send(resultArray);
                        } else {
                            res.send(result.stderr.split('\n'));
                        }
                    });
                })
        });
});
var CONSTANT = require('../config/constant');
var node_ssh = require('node-ssh');

//var config = require('../config/_config');
ssh = new node_ssh();

module.exports = router;