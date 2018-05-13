/**
 * Created by Johnlin on 2017/8/17.
 */
$(function () {
    $("#radio").change(function () {
        var radio = $("#radio input:radio:checked").val();
        if (radio === "option1") {
            $("#addAccount").css("display", "block");
            $("#confHost").css("display", "none");
            $("#edit").css("display", "none");
            $("#delAccount").css("display", "none");
            $("#editHost").css("display", "none");
        }
        if (radio === "option2") {
            $("#addAccount").css("display", "none");
            $("#confHost").css("display", "block");
            $("#edit").css("display", "none");
            $("#delAccount").css("display", "none");
            $("#editHost").css("display", "none");
        }
        if (radio === "option3") {
            $("#addAccount").css("display", "none");
            $("#confHost").css("display", "none");
            $("#edit").css("display", "block");
            $("#delAccount").css("display", "none");
            $("#editHost").css("display", "none");
        }
        if (radio === "option4") {
            $("#addAccount").css("display", "none");
            $("#confHost").css("display", "none");
            $("#edit").css("display", "none");
            $("#delAccount").css("display", "block");
            $("#editHost").css("display", "none");
        }
        if (radio === "option5") {
            $("#addAccount").css("display", "none");
            $("#confHost").css("display", "none");
            $("#edit").css("display", "none");
            $("#delAccount").css("display", "none");
            $("#editHost").css("display", "block");
            $("#btn_sub").css('visibility','hidden');
        }else{
            $("#btn_sub").css('visibility','visible');
        }
    });

    //初始化，获取数据，渲染下拉选项
    $.ajax({
        type: "GET",
        url: "/conf/data",
        async: true,
        dataType: "json",
        success: function (data) {
            //console.log("数据是：" + JSON.stringify(data));
            var authority = data.authority;
            //var Len = authority.length;
            //var len;
            for (i in authority) {
                //console.log(authority[i].hostName);
                //添加账户中的添加权限
                $("#authority").append('<option value="' + authority[i].hostName + '">"' + authority[i].hostName + "   " + authority[i].IP + '"</option>');
                //编辑账户管理的权限
                $("#editAuthority").append('<option value="' + authority[i].hostName + '">"' + authority[i].hostName + "   " + authority[i].IP + '"</option>');
                //配置主机中的选择
                $("#selectHost").append('<option value="' + authority[i].IP + '">"' + authority[i].hostName + "   " + authority[i].IP + '"</option>');
            }

            $("#authority").multiselect();
            $("#editAuthority").multiselect();
            //$("#delAuthority").multiselect();
            //配置内存核心
            var username = data.username;
            for (i in username) {
                //admin账户不可删除与配置内存及核心
                if (data.username[i] !== "admin") {
                    $("#delSelect").append('<option value="' + username[i] + '">"' + username[i] + '"</option>');
                    $("#selectAccount").append('<option value="' + username[i] + '">"' + username[i] + '"</option>');
                }
                //编辑账户项的选择账户内放入所有账户
                $("#editAccount").append('<option value="' + username[i] + '">"' + username[i] + '"</option>');
            }
            $("#delSelect").multiselect('rebuild');
        }
    }).then(function () {
        var editAccount = $("#editAccount option:eq(0)").val();
        var data = {};
        data.account = editAccount;
        var array = [];
        $.ajax({
            type: 'post',
            url: '/conf/thisAccountAuthority',
            data: data,
            success: function (res) {
                if (res) {
                    for (var i in res) {
                        array.push(res[i]);
                    }
                    $("#editAuthority").multiselect('select', array);
                }
            }
        });
    });

    //配置内存核心
    var delSelectVal;
    var delSelect = $("#del_select");//下拉选择框
    var editAjax = function () {
        $.ajax({
            type: "POST",
            url: "/conf/confData",
            data: editData,
            async: false,
            dataType: "json",
            success: function (data) {
                //console.log("前台请求到的数据是：" + JSON.stringify(data));
                optionData = data;
                //console.log("dm::" + JSON.stringify(data));
                if (optionData.length !== 0) {
                    var _data = optionData[0].dm.sort(sortNumber);
                    $("#del_select").empty();
                    for (i in _data) {
                        if (_data[i] !== '') {
                            $("#del_select").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                        }
                    }
                    //用于获取删除下拉框的第一项值
                    delSelectVal = $("#del_select option:eq(0)").val();
                    delSelect.change(function () {
                        delSelectVal = delSelect.find("option:selected").val();
                    });
                } else {
                    alert("此账户的该主机暂无数据，请配置！");
                }
            }
        });
    };
    var selectAccount;
    var selectIP;
    var editData = {};
    var optionData;
    var _delTypes = $("#delTypes");
    $("#selectAccount").change(function () {
        selectAccount = $("#selectAccount").val();
        jQuery("#del_select").empty();
        if (selectAccount && selectIP !== undefined) {
            //console.log("selectAccount: " + selectAccount + "selectHost: " + selectIP);
            editData.option = "option5";
            editData.selectAccount = selectAccount;
            editData.ip = selectIP;
            //console.log(JSON.stringify(editData));
            editAjax();
        }
    });
    $("#selectHost").change(function () {
        selectIP = $("#selectHost").val();
        jQuery("#del_select").empty();
        if (selectAccount && selectIP !== undefined) {
            //console.log("selectAccount: " + selectAccount + "selectHost: " + selectIP);
            editData.option = "option5";
            editData.selectAccount = selectAccount;
            editData.ip = selectIP;
            //console.log(JSON.stringify(editData));
            editAjax();
        }
    });

    function sortNumber(a, b) {
        return a - b
    }

    var delTypesId;
    delTypesId = _delTypes.find("option:selected").val();
    _delTypes.change(function () {
        delTypesId = _delTypes.find("option:selected").val();
    });
    _delTypes.change(function () {
        delSelectVal = $("#del_select option:eq(0)").val();
        delTypesId = _delTypes.val();
        jQuery("#del_select").empty();
        editAjax();
        if (optionData !== []) {
            if (delTypesId === "dm") {

                var _data = optionData[0].dm.sort(sortNumber);
                //console.log("dm" + _data);
                jQuery("#del_select").empty();
                for (i in _data) {
                    if (_data[i] !== '') {
                        $("#del_select").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                    }
                }
                delSelectVal = $("#del_select option:eq(0)").val();

            }
            if (delTypesId === "ec") {

                var _data = optionData[0].ec.sort(sortNumber);
                //console.log("ec" + _data);
                jQuery("#del_select").empty();
                for (i in _data) {
                    if (_data[i] !== '') {
                        $("#del_select").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                    }
                }
                delSelectVal = $("#del_select option:eq(0)").val();

            }
            if (delTypesId === "em") {
                //if (optionData.length !== 0) {
                var _data = optionData[0].em.sort(sortNumber);
                //console.log("em" + _data);
                jQuery("#del_select").empty();
                for (i in _data) {
                    if (_data[i] !== '') {
                        $("#del_select").append("<option val='" + _data[i] + "'>" + _data[i] + "</option>");
                    }
                }
                delSelectVal = $("#del_select option:eq(0)").val();
            }
        }
    });
    //提交添加的数据
    var addData = {};
    var _addTypes = $("#addTypes");
    var num_add = $("#num_add");
    var addButton = $("#addButton");
    var addTypesId = _addTypes.find("option:selected").val();
    _addTypes.change(function () {
        addTypesId = $("#addTypes").find("option:selected").val();
        //console.log("添加框选择的是:" + addTypesId);
    });
    //###########填写校验#############
    addButton.on("click", function () {
        addData.addTypesId = addTypesId;
        addData.addValue = num_add.val();
        addData.selectAccount = selectAccount;
        addData.ip = selectIP;
        //console.log("添加的数据是：" + JSON.stringify(addData));
        if (selectAccount && selectIP !== undefined && addData.addValue !== '') {

            //console.log(addData);
            $.ajax({
                type: "POST",
                url: "/conf/addData",
                async: false,
                data: addData,
                dataType: "json",
                success: function (res) {
                    //console.log(res);
                    //location.reload();
                    alert("添加成功！");
                    _delTypes.trigger("change");
                }
            });
        } else {
            alert("先选择账户与主机！并填写必要信息");
        }
    });
    //提交删除
    var delData = {};
    var delButton = $("#delButton");//提交按钮
    delButton.on("click", function () {
        delData.delTypesId = delTypesId;
        delData.delSelectVal = delSelectVal;
        delData.selectAccount = selectAccount;
        delData.ip = selectIP;
        $.ajax({
            type: "POST",
            url: "/conf/delData",
            async: true,
            data: delData,
            dataType: "json",
            success: function (res) {
                //console.log(res);
                //location.reload();
                alert("删除成功！");
                //删除下拉更新
                _delTypes.trigger("change");
            }
        });
    });

    //在编辑账户里边选择账户后查询对应的权限
    //提交
    var uploadStatus = true;
    var Ajax = function (data) {

        $.ajax({
            type: "POST",
            url: "/conf/submit",
            async: true,
            dataType: "json",
            data: data,
            success: function (data) {
                if (data === true && uploadStatus === true) {
                    alert("操作成功！");
                    location.reload();
                }
                if (data === false) {
                    alert("此名称已存在！");
                }
            }
        });
    };

    var fileName = function (data) {
        var Data = {};
        Data.fileName = data.hostName;
        //console.log("Data::" + Data);
        $.ajax({
            type: "POST",
            url: "/privateKey/fileName",
            async: false,
            data: Data,
            success: function (data) {
                //console.log(data);
            },
            error: function () {
                alert("上传连接失败！");
            }
        });
    };
    var uploadFile = function () {
        //console.log("调用了上传的ajax");
        var formData = new FormData();
        formData.append("myfile", document.getElementById("privateKey").files[0]);
        //console.log("FORMDATA：：" + formData);
        $.ajax({
            type: "POST",
            url: "/privateKey",
            async: false,
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
            success: function (data) {
                if (data === true) {
                    uploadStatus = true;
                } else {
                    uploadStatus = false;
                }

            },
            error: function () {
                alert("上传连接失败！");
            }
        });
    };

    //选择的私钥
    $("#privateKey").on('change', function (e) {
        //e.currentTarget.files 是一个数组，如果支持多个文件，则需要遍历
        data.privateKeyName = e.currentTarget.files[0].name;
    });

    $("#editAccount").change(function () {
        var data = {};
        data.account = $("#editAccount").val();
        var array = [];
        $.ajax({
            type: 'post',
            url: '/conf/thisAccountAuthority',
            data: data,
            success: function (res) {
                for (var i in res) {
                    array.push(res[i]);
                }
                $.ajax({
                    type: "GET",
                    url: "/conf/data",
                    async: true,
                    dataType: "json",
                    success: function (data) {

                        var authority = data.authority;
                        $("#editAuthority").empty();
                        for (i in authority) {
                            $("#editAuthority").append('<option value="' + authority[i].hostName + '">"' + authority[i].hostName + "   " + authority[i].IP + '"</option>');
                        }

                        $("#editAuthority").multiselect('rebuild');
                        $("#editAuthority").multiselect('select', array);
                    }
                });
            }
        });
    });
    var data = {};
    $(document).on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $("#btn_sub").trigger("click");
        }
    });
    $("#btn_sub").on("click", function () {
        var check;
        var radio = $("#radio input:radio:checked").val();
        if (radio === "option1") {
            data.option = "option1";
            data.userName = $("#userName").val();
            data.passwd = $("#passwd").val();
            data.passwdAgain = $("#passwdAgain").val();
            data.authority = $("#authority").val();
            check = data.userName && data.passwd && data.passwdAgain && data.authority;
            //全部填了且两次密码相同
            if (check !== "" && (data.passwd === data.passwdAgain)) {

                Ajax(data);
            } else {
                alert("填写必要字段且两次密码须相同！");
            }
        }
        if (radio === "option2") {
            // alert("privateKeyName::"+(data.privateKeyName!==undefined));
            data.option = "option2";
            data.hostName = $("#hostName").val();
            if (data.privateKeyName !== undefined) {
                data.privateKeyName = data.privateKeyName + "_" + data.hostName;
            }
            data.address = $("#address").val();
            //data.privateKey = $("#privateKey").val();
            data.proJar = $("#proJar").val();
            data.thirdJar = $("#thirdJar").val();
            data.log = $("#log").val();
            check = data.hostName && data.address && data.proJar && data.thirdJar && data.log;
            if (check !== '' && data.privateKeyName !== undefined) {
                //console.log("点了option3的提交");
                fileName(data);
                uploadFile();
                Ajax(data);
            } else {
                alert("填写所有字段！");
            }
        }
        if (radio === "option3") {
            data.authority = $("#editAuthority").val();
            data.option = "option3";
            data.editAccount = $("#editAccount").val();
            data.changePasswd = $("#changePasswd").val();
            data.changePasswdAgain = $("#changePasswdAgain").val();
            check = data.editAccount && data.changePasswd || data.editAccount && data.authority;
            //全部填了且两次密码相同
            if (check !== '' && (data.changePasswd === data.changePasswdAgain)) {
                Ajax(data);
            } else {
                alert("填写必要字段且两次密码须相同！");
            }
        }
        if (radio === "option4") {
            data.option = "option4";
            data.delSelect = $("#delSelect").val();
            check = data.delSelect;
            if (check !== null) {
                Ajax(data);
            }else{
                alert('请先选择！');
            }
        }
    });
});