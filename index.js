/**
 * Created by johnlin on 2017/7/4.
 */
var childProcess = require('child_process');

/**
*  app 基本配置后的express;
*/
var app = require('./config/express');

/**
 用户登录页面
 */
app.use('/', require('./routes/login'));

/**
 用户登录验证页面
 */
app.use('/loginCheck', require('./routes/loginCheck'));

/**
选择账号连接页面
 */
app.use('/user', require('./routes/user'));

/**
 配置页面
 */
app.use('/conf', require('./routes/conf'));

/**
 选择连接页面验证
 */
app.use('/sshConnect', require('./routes/sshConnect'));

/**
 * 命令操作页面
 */
app.use('/cmd', require('./routes/cmd'));

/**
 * 上传文件的POST地址
 */
app.use('/uploadFile', require('./routes/uploadFile'));

/**
 * 上传privateKey的POST地址
 */
app.use('/privateKey', require('./routes/privateKey'));

/**
 * spark-submit的POST地址
 */
app.use('/sparkSubmit', require('./routes/sparkSubmit'));

/**
ssh后台远程操作，execCommand地址
*/
app.use('/ssh', require('./routes/ssh'));

var server = app.listen(8080, function () {
    console.log('Listen on localhost:8080/');
    childProcess.exec('start http://localhost:8080/');
});
