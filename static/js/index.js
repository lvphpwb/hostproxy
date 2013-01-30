$(function() {
    var hostproxy = function() {
        var that = this;
        $('#domainadd').click(function() {
            var domain = $('#domain').val();
            var ip_str = $('#ip').val();
            //note 判断域名是否已添加
            if(domain.length > 0){
                if(that.config[domain]) {
                    $("#addmsg").text("新增域名:  "+domain+"  已经存在！").attr('class', 'label label-important');
                    return;
                }
                $.ajax({
                    url : '/ajax/save?rn=' + Math.random(),
                    type : 'get',
                    dataType : 'json',
                    data : {domain:domain, ip:ip_str},
                    success : function(data){
                        console.log(data);
                        if(data.status == 'ok'){
                            $('#domain').val('');
                            $('#ip').val('');
                            $("#addmsg").text("多个绑定IP用空格分开！").attr('class', 'label');

                            that.config = data.config;
                            that._list( that.config );
                        }else{
                            $("#addmsg").text(data.msg).attr('class', 'label label-important');
                        }
                    }
                });
            }else{
                $("#addmsg").text("请输入要添加的域名！").attr('class', 'label label-important');
            }
        });
        $('tbody').find('.deletedomain').live('click', function(){
            var domain = $(this).parent().children()[0].innerHTML;
            if( confirm("确认要删除域名："+domain+" ?") ) {
                $.ajax({
                    url : '/ajax/delete?rn=' + Math.random(),
                    type : 'get',
                    dataType : 'json',
                    data : {domain:domain},
                    success : function(data){
                        console.log(data);
                        that.config = data.config;
                        that._list( that.config );
                    }
                });
            }
        });
        $('tbody').find('.addhostip').live('click', function(){
            var domain = $(this).parent().parent().attr('class');
            var ip = $(this).parent().find('.newip').val();
            if(ip.length > 0){
                $.ajax({
                    url : '/ajax/addip?rn=' + Math.random(),
                    type : 'get',
                    dataType : 'json',
                    data : {domain:domain, ip:ip},
                    success : function(data){
                        console.log(data);
                        that.config = data.config;
                        that._list( that.config );
                    }
                });
            }else{
                alert('输入IP！');
            }
        });
        $('tbody').find('.setbindip').live('change', function(){
            var domain = $(this).parent().parent().attr('class');
            var type = $(this).attr('settype');
            var ip = $(this).val();
            $.ajax({
                url : '/ajax/setbind?rn=' + Math.random(),
                type : 'get',
                dataType : 'json',
                data : {domain:domain, ip:ip, type:type},
                success : function(data){
                    console.log(data);
                    that.config = data.config;
                    that._list( that.config );
                }
            });
        });
        $('tbody').find('.deleteip').live('click', function(){
            var domain = $(this).parent().parent().attr('class');
            var ip = $(this).parent().text();
            $.ajax({
                url : '/ajax/deleteip?rn=' + Math.random(),
                type : 'get',
                dataType : 'json',
                data : {domain:domain, ip:ip},
                success : function(data){
                    console.log(data);
                    that.config = data.config;
                    that._list( that.config );
                }
            });
        });
    }
    hostproxy.prototype = {
        _list: function(data) {
            var list = $('tbody').empty();
            for(var domain in data) {
                var tr_html = '<tr class="' + domain + '">\
                    <td style="vertical-align: middle;">\
                        <div class="btn-group">\
                            <button class="btn">' + domain + '</button>\
                            <button class="btn deletedomain"><i class="icon-remove" title="删除"></i></button>\
                            <button class="btn dropdown-toggle" data-toggle="dropdown">\
                                <span class="caret"></span>\
                            </button>\
                            <ul class="dropdown-menu">';
                if(data[domain].ip){
                    for(var i=0;i<data[domain].ip.length;i++){
                        tr_html += '<li class="' + domain + '"><a class="delip">' + data[domain].ip[i] + '<i class="icon-remove deleteip" style=" margin-left: 5px; cursor: pointer;" title="删除"></i></a></li>';
                    }
                }
                tr_html += '</ul>\
                        </div>\
                    </td>\
                    <td>\
                        <select class="setbindip" settype="bindip" style="width: 135px; margin-bottom: 0px;">\
                ';
                if(data[domain].ip){
                    tr_html += '<option value="">无绑定</option>';
                    for(var i=0;i<data[domain].ip.length;i++){
                        if(data[domain].bindip && data[domain].ip[i] == data[domain].bindip){
                            tr_html += '<option value="' + data[domain].ip[i] + '" selected="selected">' + data[domain].ip[i] + '</option>';
                        }else{
                            tr_html += '<option value="' + data[domain].ip[i] + '">' + data[domain].ip[i] + '</option>';
                        }
                    }
                }else{
                    tr_html += '<option value="">无绑定</option>';
                }
                tr_html += '</select>\
                    </td>\
                    <td>\
                        <select class="setbindip" settype="firefoxip" style="width: 135px; margin-bottom: 0px;">\
                            <option value="">无特殊绑定</option>\
                ';
                if(data[domain].ip){
                    for(var i=0;i<data[domain].ip.length;i++){
                        if(data[domain].firefoxip && data[domain].ip[i] == data[domain].firefoxip){
                            tr_html += '<option value="' + data[domain].ip[i] + '" selected="selected">' + data[domain].ip[i] + '</option>';
                        }else{
                            tr_html += '<option value="' + data[domain].ip[i] + '">' + data[domain].ip[i] + '</option>';
                        }
                    }
                }
                tr_html += '</select>\
                    </td>\
                    <td>\
                        <select class="setbindip" settype="chromeip" style="width: 135px; margin-bottom: 0px;">\
                            <option value="">无特殊绑定</option>\
                ';
                if(data[domain].ip){
                    for(var i=0;i<data[domain].ip.length;i++){
                        if(data[domain].chromeip && data[domain].ip[i] == data[domain].chromeip){
                            tr_html += '<option value="' + data[domain].ip[i] + '" selected="selected">' + data[domain].ip[i] + '</option>';
                        }else{
                            tr_html += '<option value="' + data[domain].ip[i] + '">' + data[domain].ip[i] + '</option>';
                        }
                    }
                }
                tr_html += '</select>\
                    </td>\
                    <td>\
                        <select class="setbindip" settype="ieip" style="width: 135px; margin-bottom: 0px;">\
                            <option value="">无特殊绑定</option>\
                ';
                if(data[domain].ip){
                    for(var i=0;i<data[domain].ip.length;i++){
                        if(data[domain].ieip && data[domain].ip[i] == data[domain].ieip){
                            tr_html += '<option value="' + data[domain].ip[i] + '" selected="selected">' + data[domain].ip[i] + '</option>';
                        }else{
                            tr_html += '<option value="' + data[domain].ip[i] + '">' + data[domain].ip[i] + '</option>';
                        }
                    }
                }
                tr_html += '</select>\
                    </td>\
                    <td style="vertical-align: middle;">\
                        <input type="text" class="newip" style=" margin-bottom: 0px; margin-right: 10px;width: 135px;"/><input type="button" class="btn btn-info addhostip" value="添加"/>\
                    </td>\
                </tr>';
                list.append( tr_html );
            }
        },
        init: function() {
            var that = this;
            $.getJSON('/ajax/init?rn=' + Math.random(),function(data) {
                that.config = data;
                that._list(data);
            });
        }
    }
    var hp = new hostproxy();
    hp.init();
});