/**
 * Created by johnlin on 2017/7/5.
 */
$(function () {
    var submitBtn = $("#btn-submit"),
        paramsInput = $('#params'),
        resultContent = $('#result'),
        deleteBtn = $('#result-delete'),
        menuList = $('.menu-bar li'),
        inputComm = $('.inputComm');
    listFile = $('.listFile'),
        sparkSubmit = $('.spark-submit'),
        // listFileCheck = $('.listFile-check'),
        programJar = $('.programJar');
    resultWrapper = $('#result-content'),
        normalPanel = $('.normal-panel'),
        uploadPanel = $('.upload-panel'),
        sparkSubmitPanel = $('.spark-submit-panel');

    resultWrapper.slimScroll({
        height: '550px',
        color: '#fff'
    });
    var scrollBar = $('.slimScrollBar').eq(0);
    var uploadIcon = $('.uploadIcon').eq(0);
    var totalProgress = $('.totalProgress').eq(0);

    var isUploadShow = false;
    var isSparkPanelShow = false;
    var isNormalPanelShow = true;
    var data = {};

    //获取spark-submit页面的下拉框数据的ajax
    $("#autoIn").on("click", function () {
        $("#master").val("spark://" + userIp + ":7077");
    });
    $.ajax({
        type: "GET",
        url: "/loginCheck/account",
        async: true,
        success: function (data) {
            //console.log("请求账号后返回的数据"+data);
            $("#loginName").text(data);
        }
    });

    var optionData;
    var ajaxGet = function () {
        $.ajax({
            type: "GET",
            url: "/cmd/getData",
            async: false, //必须同步
            dataType: "json",
            success: function (res) {
                optionData = res[0];
                //console.log("getData: " + JSON.stringify(optionData));
                /* if (optionData.length === 0) {
                 location.reload();
                 }*/
            }
        });
    };

    function sortNumber(a, b) {
        return a - b
    }

    //渲染spark-submit页面的下拉框数据
    var sparkOp = function (optionData) {
        if (optionData !== [] && optionData !== undefined && (optionData.dm.length || optionData.dm.length || optionData.dm.length !== 0)) {
            var _data = optionData.dm.sort(sortNumber);
            for (i in _data) {
                if (_data[i] !== '') {
                    $("#driver-memory").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                }
            }
            var _data = optionData.ec.sort(sortNumber);
            //console.log(_data);
            for (i in _data) {
                if (_data[i] !== '') {
                    $("#executor-cores").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                }
            }
            var _data = optionData.em.sort(sortNumber);
            //console.log(_data);
            for (i in _data) {
                if (_data[i] !== '') {
                    $("#executor-memory").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                }
            }
        }
    };

    //请求数据并渲染spark-submit页面的下拉菜单
    ajaxGet();
    //console.log("请求到的optionData：" + JSON.stringify(optionData));
    sparkOp(optionData);

    //获取用户对应的主机IP和主机名
    var userIp;
    $.ajax({
        type: "GET",
        url: "/cmd/getIp",
        async: true,
        dataType: "json",
        success: function (res) {
            //控制Master的placeholder
            userIp = res.ip;
            $("#master").attr("placeholder", "必填（spark://" + res.ip + ":7077）");
            $("#userName").text(res.userName);
            /*if (res.userName !== "root") { //不是登陆的root用户
             $("#logName").attr("disabled", "disabled");
             }*/
        }
    });

    // 点击功能列表时显示对应的子选项
    menuList.on('click', function () {
        $('.menu-bar li.active').removeClass('active');
        $(this).addClass('active');
        // 如果点击普通，出现普通面板,其他面板消失
        if ($(this).index() === 0) {
            $(".uploadIcon").css("display", "none");
            $("#btn-download").css("display", "none");
            normalPanel.removeClass('f-dpnone');
            isNormalPanelShow = true;
            if (isSparkPanelShow) {
                sparkSubmitPanel.addClass('f-dpnone');
                isSparkPanelShow = false;
            }
            if (isUploadShow) {
                uploadIcon.addClass('f-dpnone');
                uploadPanel.addClass('f-dpnone');
                isUploadShow = false;
            }
            resultContent.html('');
            $("#params").val("");
        }
        if ($(this).index() === 1) {
            data.type = "click";
            data.cmd = "option1";
            $(".uploadIcon").css("display", "none");
            $("#btn-download").css("display", "inline-block");
            $("#params").attr("placeholder", "下载时输入文件或文件夹路径，点击下载后请等待，文件越大时间越长");
            normalPanel.removeClass('f-dpnone');
            isNormalPanelShow = true;

            if (isSparkPanelShow) {
                sparkSubmitPanel.addClass('f-dpnone');
                isSparkPanelShow = false;
            }
            if (isUploadShow) {
                uploadIcon.addClass('f-dpnone');
                uploadPanel.addClass('f-dpnone');
                isUploadShow = false;
            }
            // 点击“查看文件内容”显示log目录
            resultContent.html('');
            $("#params").val("");
            //console.log(data);
            Ajax(data);
        } else {
            $("#params").attr("placeholder", "请输入参数");
        }
        // 如果点击上传按钮，出现上传面板，其他面板消失
        if ($(this).index() === 2) {
            data.type = "click";
            data.cmd = "option2";
            $(".uploadIcon").css("display", "block");
            $("#btn-download").css("display", "none");
            uploadIcon.removeClass('f-dpnone');
            uploadPanel.removeClass('f-dpnone');
            isUploadShow = true;
            if (isSparkPanelShow) {
                sparkSubmitPanel.addClass('f-dpnone');
                isSparkPanelShow = false;
            }
            if (isNormalPanelShow) {
                normalPanel.addClass('f-dpnone');
                isNormalPanelShow = false;
            }
        }
        // 如果点击spark-submit，出现相关表单，其他面板消失
        if ($(this).index() === 3) {
            data.type = "";
            $(".uploadIcon").css("display", "none");
            $("#btn-download").css("display", "none");
            sparkSubmitPanel.removeClass('f-dpnone');
            isSparkPanelShow = true;

            if (isNormalPanelShow) {
                normalPanel.addClass('f-dpnone');
                isNormalPanelShow = false;
            }
            if (isUploadShow) {
                uploadIcon.addClass('f-dpnone');
                uploadPanel.addClass('f-dpnone');
                isUploadShow = false;
            }
        }
        // return false;
    });

    // “第三方jar包”或“程序jar包”点击后查询对应目录的内容
    var ajaxListFileCheck = function () {
        var urlJar;
        if ($('input#radio1:checked').length) {
            urlJar = "isThirdPart=1";
        } else {
            urlJar = "isProgramJar=1";
        }
        if ($('.upload-panel input:checked')) {
            $.ajax({
                url: '/ssh?' + urlJar,
                type: 'POST',
                data: data,
                success: ajaxOutput
            })
        } else {
            // ajaxListFile();
        }
    };

    //点击“上传文件”后默认显示“第三方jar包目录”中的内容
    $(".listFile-check").on("click", function () {
        resultContent.html('');
        ajaxListFileCheck();
    });
    $("#radio1").on('click', function () {
        resultContent.html('');
        ajaxListFileCheck();
    });
    $("#radio2").on('click', function () {
        resultContent.html('');
        ajaxListFileCheck();
    });

    // 为ajxa添加onprogress事件
    var xhrOnProgress = function (func) {
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof func === "function" && xhr.upload) {
                xhr.upload.onprogress = func;
            }
            return xhr;
        }
    };

    // 使用提交按钮提交命令
    submitBtn.on("click", function () {
        submitBtn.attr('disabled', 'disabled');
        var data = {};
        data.cmd = $('.menu-bar li.active').data('cmd');
        data.params = $('#params').val();
        data.type = 'submit';
        paramsInput.val("");
        /**
         * option2 === 文件上传
         * option3 === spark-submit
         */
        if (data.cmd === 'option2') {

            var formData = new FormData();
            formData.append("myfile", document.getElementById("upload").files[0]);

            //第三方包选中length=1
            var isThirdPart = $('.upload-panel .thirdPart:checked').length;
            var url = isThirdPart ? '/uploadFile' : '/uploadFile?isProgramJar=1';
            $.ajax({
                url: url,
                type: "POST",
                xhr: xhrOnProgress(function (e) {
                    var complete = Number.parseInt(e.loaded / e.total * 100);
                    var progressBar = $('.upload-panel .progress-bar');
                    progressBar.css('width', complete + '%');
                    if (complete === 100) {
                        setTimeout(function () {
                            $('.progress-bar').css('width', 0);
                        }, 3000);
                    }
                }),
                data: formData,
                /**
                 *必须false才会自动加上正确的Content-Type
                 */
                contentType: false,
                /**
                 * 必须false才会避开jQuery对 formdata 的默认处理
                 * XMLHttpRequest会对 formdata 进行正确的处理
                 */
                processData: false,
                success: ajaxOutput,
                error: function () {
                    alert("上传失败！");
                }
            });
        } else if (data.cmd === 'option3') {
            var sparkSubmitSelections = $('.spark-submit-panel input:checked');
            // spark-submit
            sparkSubmitSelections.each(function (index, elem) {
                var _this = $(this);
                var selection = _this.parent().siblings('select');
                //若是带有下拉框的
                if (selection.length) {
                    var name = selection.attr('name');
                    data[name] = selection.val();
                    //data.name=selection.val();
                } else {
                    var name = _this.attr('name');
                    data[name] = _this.val();
                    //data.name=_this.val();
                }
            });
            data.exeClass = $('#exeClass').val();
            data.master = $('#master').val();
            data.thirdJar = $("#thirdPart").val();
            // data.uploadFileName = $('#uploadFileName').val();
            data.inputParam = $('#inputParam').val();
            data.logName = $('#logName').val().split('.')[0];
            data.jar = $('#jar').val();
            data.other = $('#other').val().split('\n').toString();
            //data.exeClass,data.master,data.jar必填，data.driverMemory,data.cores,data.executorMemory有其一即可
            if (!data.exeClass || !data.master || !data.jar || (!data.driverMemory && !data.cores && !data.executorMemory)) {
                alert('必填参数未填写！');
                submitBtn.removeAttr('disabled');
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/sparkSubmit/process', //发送给/sparkSubmit拼接option3(spark-submit)的表单内容
                    data: data,
                    success: submitOutput,
                    error: function () {
                        alert("指令提交失败！");
                    }
                });
                //$('.spark-submit-panel input').val('');
                //$('.spark-submit-panel textarea').val('');
            }
            // console.log(data);
        }
        //点击输入命令和查看文件与下载
        else {
            // console.log("点击提交按钮上传的数据" + data);
            Ajax(data);
            /*var p = $('<p></p>').html(data );
             resultContent.prepend(p);*/
        }
    });

    //点击下载按钮
    $("#btn-download").on("click", function () {
        var data = {};
        data.params = $('#params').val();
        console.log("输入的参数是" + JSON.stringify(data));
        $.ajax({
            type: "POST",
            url: "/ssh/download",
            data: data,
            success: function (data) {
                if (data) {
                    console.log("跳转");
                    window.location = '/ssh/downloadFile';
                } else {
                    alert("出错了，请检查路径！");
                }
            },
            error: function () {
                alert("指令提交失败！");
            }
        });
    });

    // “直接输入命令”和“查看文件内容”里的提交按钮点击
    // 提交输入的命令
    var Ajax = function (data) {
        $.ajax({
            type: "POST",
            url: "/ssh",
            data: data,
            success: ajaxOutput,
            error: function () {
                alert("指令提交失败！");
            }
        });
    };

    // 使用回车提交命令(点击回车提交)
    $(document).on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            submitBtn.trigger("click");
        }
    });
    //使用回车提交命令(点击回车提交)
    /*  $(document).keydown(function (e) {
     if (e.keyCode === 13) {
     e.preventDefault();
     submitBtn.trigger("click");
     }
     });*/

    //*****点击“spark-submit”后清除控制台内容*****
    var cleanRes = function () {
        resultContent.html('');
    };
    sparkSubmit.on('click', cleanRes);

    // 控制输出结果，按钮disable状态
    var text;
    var ajaxOutput = function (data) {
        //console.log("ajax接收到的数据" + JSON.stringify(data));
        // $('#result').val(res);
        var pwd = data.pwd;
        //var len = data.cont.length;
        text = "<hr />" + '> ' + data.params + '<br />';
        var a = '';
        for (i in data.cont) {
            a = a + pwd + " " + data.cont[i] + '<br />';
        }
        var p = $('<p></p>').html(text + a);
        resultContent.prepend(p);
        // 输出内容后，滚动到底部
        /*   var height = resultContent.height();
         var scrollHeight = scrollBar.height();
         var fixHeight = 550;
         var padding = 10;
         if(height > fixHeight){
         scrollBar.css('top', height  - scrollHeight + padding);
         resultWrapper.scrollTop(height - fixHeight + padding);
         }*/
        submitBtn.removeAttr('disabled');
    };

    var submitOutput = function (data) {
        // $('#result').val(res);
        var text = '输出结果：<br />';
        var formatRes = '';
        for (var item in data) {
            formatRes = formatRes + data[item] + '<br />';
        }
        var p = $('<p></p>').html(text + formatRes);
        resultContent.prepend(p);

        submitBtn.removeAttr('disabled');
    };
    deleteBtn.on('click', function () {
        resultContent.html('');
    });
});