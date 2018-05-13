/**
 * Created by Johnlin on 2017/8/21.
 */
var express = require('express');
var router = express.Router();
var urlencodedParser = require('../middleware/bodyParse');
//var upload = require('../middleware/multer_key');

var multer = require('multer');
var CONSTANT = require('../config/constant');
var data;
router.post('/fileName', urlencodedParser, function (req, res) {
    //console.log("req.body是：：" + req.body);
    data = req.body;
    //console.log("filename" + JSON.stringify(data.fileName));
    res.send(true)
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, CONSTANT.BASE_PATH + '/privateKey');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + "_" + data.fileName);
        //console.log("中间件的filename " + data.fileName);
    }
});
var upload = multer({storage: storage});


router.post('/', upload.single('myfile'), function (req, res) {
    // 没有附带文件
    /* if (!req.file) {
     // res.send(['>>>>错误，上传文件为空！']);
     res.send(false);
     }*/
    res.send(true);
});

module.exports = router;