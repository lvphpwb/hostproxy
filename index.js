var http = require('http');
const PROXYHOST = 'http://develop.proxy/';
var proxy_server = require('./proxy.server');
var proxy_service = require('./proxy.service');

http.createServer(function (request, response) {
    //note 判断请求
    if( request.url.substr(0, PROXYHOST.length) == PROXYHOST ) {
        proxy_server.run(request, response);
    }else {
        proxy_service.set_server_prefix( PROXYHOST ); // 用于修正部分静态访问
        proxy_service.run(request, response);
    }
}).listen(8000, "0.0.0.0");
console.log('setup at '+PROXYHOST+'\r\nproxy started at 0.0.0.0:8000\n');