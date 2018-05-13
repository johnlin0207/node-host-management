/**
 * Created by johnlin on 2017/7/9.
 */
$(function () {
    var submitBtn = $('#btn-submit');
    document.onkeydown = function (event) {
        var e = event || window.event;
        if (e && e.keyCode == 13) { // enter 键
            fun();
        }
    };
    var fun = function () {
        var username = $('#username').val();
        var password = $('#password').val();
        $("#main").css("opacity", "0.5");
        $.ajax({
            url: "/loginCheck/animation",
            type: "GET",
            success: function (data) {
                $("#animation").html(data);
                $("#animation").css("display", "block");
            }
        });

        $.ajax({
            type: "POST",
            url: "/loginCheck",
            data: {
                username: username,
                password: password
            },
            success: function (data) {
                $("#animation").css("display", "none");
                $("#main").css("opacity", "1");
                if (data.status === true) {
                    if (data.lostData.length !== 0) {
                        alert("未找到该账户管理的部分主机，包含：" + data.lostData);
                    }
                    window.location.href = "/user";
                }
                if (data.status === false) {
                    $("#animation").css("display", "none");
                    $("#main").css("opacity", "1");
                    alert("用户名或密码错误");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });

    };
    submitBtn.on('click', function () {
        fun();
    });
});