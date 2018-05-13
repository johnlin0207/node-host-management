/**
 * Created by johnlin on 2017/7/11.
 */
var multer  = require('multer');
var CONSTANT = require('../config/constant');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, CONSTANT.BASE_PATH + '/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

exports = module.exports = upload;