var fs = require('fs'),url = require('url');
const MIMETYPE = {
    'html':'text/html',
    'htm':'text/html',
    'js':'text/javascript',
    'png':'image/png',
    'css': 'text/css',
    'ico': 'image/ico',
    'zip': 'application/zip',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'jpe': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'csv': 'text/comma-separated-values',
    'txt': 'text/plain'
};
const PROXYCONF = './proxy.config.js';
const STATICDIR = './static';

function in_array(obj, arr) {
    if(typeof obj == 'string') {
        for(var i in arr) {
            if(arr[i] == obj) {
              return true;
            }
        }
    }
    return false;
} 

function proxyserver () {
    this.reload_config();
}
proxyserver.prototype.config = null;
proxyserver.prototype.reload_config = function() {
    this.config = JSON.parse( fs.readFileSync( PROXYCONF ) );
}
proxyserver.prototype.save_config = function() {
    fs.writeFileSync(PROXYCONF, JSON.stringify(this.config) );
}

proxyserver.prototype.run = function(request, response) {
    var that = this;
    var requesturl = url.parse( request.url );
    var path = requesturl.path;
    if(path == '/') {
        path = path + 'index.html';
    }
    var ext = path.split('.').pop();
    // 如果是静态资源
    if(MIMETYPE[ext]) {
        fs.stat( STATICDIR + path, function(err,stats) {
            if(err) {
                console.log(err);
                that.error_404(response);
            }else{
                response.writeHead(200, {"Content-Type": MIMETYPE[ext]});
                response.write( fs.readFileSync( STATICDIR + path ) );
                response.end();
            }
        });
    } else {
        var query = require('querystring').parse( requesturl.query );
        switch(requesturl.pathname) {
            case '/ajax/save':
                that.reload_config();
                if( that.config[ query['domain'] ] ) {
                    response.end( JSON.stringify({status:'err', msg:"新增域名:  " + query['domain'] + "  已经存在！"}) );
                }else{
                    var ip_str = query['ip'];
                    if(ip_str.length>0){
                        var ip_arr = [];
                        var ip_tmp = ip_str.split(' ');
                        for(var i=0;i<ip_tmp.length;i++){
                            if(ip_tmp[i].length>0){
                                ip_arr.push(ip_tmp[i]);
                            }
                        }
                        that.config[ query['domain'] ] = {ip: ip_arr};
                    }else{
                        that.config[ query['domain'] ] = {};
                    }
                    that.save_config();
                    response.end( JSON.stringify({status:'ok', config:that.config}) );
                }
            break;
            case '/ajax/init':
                that.reload_config();
                response.end( JSON.stringify(that.config) );
            break;
            case '/ajax/delete':
                delete(that.config[ query['domain'] ]);
                that.save_config();
                response.end( JSON.stringify({status:'ok', config:that.config}) );
            break;
            case '/ajax/addip':
                var domain = query['domain'];
                var ip = query['ip'];
                if(domain && ip){
                    if(that.config[ domain ].ip){
                        if(!in_array(ip, that.config[ domain ].ip)){
                            that.config[ domain ].ip.push(ip);
                        }
                    }else{
                        that.config[ domain ].ip = [];
                        that.config[ domain ].ip.push(ip);
                    }
                }
                that.save_config();
                response.end( JSON.stringify({status:'ok', config:that.config}) );
            break;
            case '/ajax/setbind':
                var domain = query['domain'];
                var ip = query['ip'];
                var type = query['type'];
                if(domain && type){
                    that.config[ domain ][type] = ip;
                }
                that.save_config();
                response.end( JSON.stringify({status:'ok', config:that.config}) );
            break;
            case '/ajax/deleteip':
                var domain = query['domain'];
                var ip = query['ip'];
                if(domain && ip && that.config[ domain ].ip && in_array(ip, that.config[ domain ].ip)){
                    var tmparr = [];
                    for(var i=0;i<that.config[ domain ].ip.length;i++){
                        if(that.config[ domain ].ip[i] != ip){
                            tmparr.push(that.config[ domain ].ip[i]);
                        }
                    }
                    that.config[ domain ].ip = tmparr;
                    if(that.config[ domain ].bindip && that.config[ domain ].bindip == ip){
                        that.config[ domain ].bindip = '';
                    }
                    if(that.config[ domain ].firefoxip && that.config[ domain ].firefoxip == ip){
                        that.config[ domain ].firefoxip = '';
                    }
                    if(that.config[ domain ].chromeip && that.config[ domain ].chromeip == ip){
                        that.config[ domain ].chromeip = '';
                    }
                    if(that.config[ domain ].ieip && that.config[ domain ].ieip == ip){
                        that.config[ domain ].ieip = '';
                    }
                }
                that.save_config();
                response.end( JSON.stringify({status:'ok', config:that.config}) );
            break;
        }
    }
}
proxyserver.prototype.error_404 = function(response) {
    response.writeHead( 404, 'Not Found');
    response.end("抱歉，您请求的资源不存在。");
}
module.exports = new proxyserver();