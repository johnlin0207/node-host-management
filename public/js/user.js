/**
 * Created by johnlin on 2017/7/6.
 */
$(function () {
    $.ajax({
        type: "GET",
        url: "/loginCheck/verify",
        async: true, //若是异步，则#btn-conf的触发事件必须放此处处理
        success: function (data) {
            //如果是admin用户，data为true,会显示配置按钮
            if (data) {
                $("#btn-config").css("display", "block");
                $(".button-group").append('<button type="button" value="conf" id="btn-conf" style="display:block;margin-top: 12px" class="btn btn-success btn-block btn-submit">配置</button>');
                $('#btn-conf').on('click', function () {
                    window.location.href = "/conf";
                });
            }
        }
    });

    $('#btn-submit').on('click', function () {
        $.ajax({
            url: "/loginCheck/animation",
            type: "GET",
            success: function (data) {
                $("#animation").html(data);
            }
        });

        //ajax提交表单，并处理返回结果
        var data = {};
        data.host = $("#host ").children("option:selected").val();
        data.hostUser = $("#hostUser").val();
        $("#main").css("opacity", "0.5");
        $("#animation").css("display", "block");
        $.ajax({
            type: "POST",
            url: "/sshConnect",
            data: data,
            success: function (res) {
                //console.log("111"+JSON.stringify(res));
                $("#animation").css("display", "none");
                $("#main").css("opacity", "1");
                if (res.status === 0) {
                    alert("未找到此用户！");
                } else {
                    window.location.href = "/cmd";
                }
            },
            error: function () {
                $("#animation").css("display", "none");
                $("#main").css("opacity", "1");
                alert("网络连接失败！");
            }
        });
        //console.log(data);
        /*$.ajax({
            type: "POST",
            url: "/sparkSubmit/host",
            data: data
            //success: console.log("222"+JSON.stringify(data))
        })*/
    });

    // 使用回车提交命令
    $(document).keydown(function (event) {
        if (event.keyCode === 13) { //绑定回车
            $('#btn-submit').trigger("click");
        }
    });
});