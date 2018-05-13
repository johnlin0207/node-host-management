/**
 * Created by Johnlin on 2017/7/28.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    var account = req.session.account;
    // console.log(account);
    if(account){
        //res.ip=account.host;
       // res.username=account.username;
        res.send({ip:account.host,username:account.username});
        //console.log(account);
    }else{
        res.redirect('/login');
    }
});

module.exports = router;