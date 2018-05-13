/*
/!**
 * Created by Johnlin on 2017/8/21.
 *!/
var multer  = require('multer');
var CONSTANT = require('../config/constant');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, CONSTANT.BASE_PATH + '/privateKey');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname+"_"+fileName);
        console.log("中间件的filename "+fileName);
    }
});
var upload = multer({ storage: storage });

exports = module.exports = upload;*/
