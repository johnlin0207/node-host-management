/**
 * Created by johnlin on 2017/7/11.
 */
var bodyParser = require('body-parser');

urlencodedParser = bodyParser.urlencoded({ extended: true });

exports = module.exports = urlencodedParser;