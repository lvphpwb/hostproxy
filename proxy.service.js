var http = require('http'),
    fs   = require('fs'),
    crypto = require('crypto');
const PROXYCONF = './proxy.config.js';
// 代理类
function pservice() {
    this.reload_config();
    var that = this;
    fs.watch(PROXYCONF, function(e, filename) {
        if(e == 'change' || e == 'rename') {
            that.reload_config();
        }
    });
}
pservice.prototype.config = null;
pservice.prototype.reload_config = function() {
    this.config = JSON.parse( fs.readFileSync( PROXYCONF ) );
}
// 服务器内置页前缀，用于访问静态文件
pservice.prototype.set_server_prefix = function(prefix) {
    this.server_prefix = prefix;
}
// *************************************************
// 主入口函数
pservice.prototype.run = function(request, response) {
    var requesturl = require('url').parse( request.url );
	if( typeof(requesturl.port) == 'undefined' ){
		requesturl.port = '80';
	}
    console.log(request.url);
    // 请求选项
    var options = {
        'method':  request.method,
        'headers': request.headers,
        'host':    requesturl.hostname,
        'path':    requesturl.path,
        'port':    requesturl.port
    };
    //note 判断host
    var query = require('querystring').parse( requesturl.query );
    var requesthost = options.host;
    if( this.config[ requesthost ] ) {
        //最后替换 HOST
        if(this.config[requesthost]['bindip']){
            options.headers['host'] = requesthost;
            options.host = this.config[ requesthost ]['bindip'];
        }
        var useragent = options.headers['user-agent'];
        var rgexp = /Firefox/ig;
        if(rgexp.test(useragent) && this.config[ requesthost ].firefoxip){
            options.headers['host'] = requesthost;
            options.host = this.config[ requesthost ]['firefoxip'];
        }
        var rgexp = /Chrome/ig;
        if(rgexp.test(useragent) && this.config[ requesthost ].chromeip){
            options.headers['host'] = requesthost;
            options.host = this.config[ requesthost ]['chromeip'];
        }
        var rgexp = /MSIE/ig;
        if(rgexp.test(useragent) && this.config[ requesthost ].ieip){
            options.headers['host'] = requesthost;
            options.host = this.config[ requesthost ]['ieip'];
        }
    }else{
        delete options.headers['host'];
    }
    // 代理请求
    var that = this;
    var proxy_request = http.request( options ,function(proxy_response) {
        //console.log(proxy_response);
        response.writeHead( proxy_response.statusCode, proxy_response.headers);
        proxy_response.on('data', function(chunk) {
            response.write( chunk );
        });
        proxy_response.on('end', function() {
            response.end();
        });
    });
    // 代理错误处理
    proxy_request.on('error', function(err) {
        var message = err.toString();
        switch(err.errno) {
            case 'ENOTFOUND':
                message = "请求的域名 <b>"+requesthost+"</b> 无法解析";
            break;
            case 'ECONNREFUSED':
                message = "无法连接都服务器，请确定配置IP是否正确！";
            break;    
        }
        //console.log(options);
        message = fs.readFileSync('static/error.html').toString().replace(/\{error_message\}/ig, message);
        message = message.replace(/\{PROXYHOST\}/ig, that.server_prefix);
        response.end(message);
    });
    // 请求数据转发
    request.on('data',function(chunk) {
        proxy_request.write( chunk );
    });
    request.on('close', function() {
        proxy_request.end();
    });
    request.on('end', function() {
        proxy_request.end();
    });
}
module.exports = new pservice();