const http = require('http');
var url = require('url');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs');
const { fork } = require('child_process' );
const express = require('express');


var port = 8083
const currentFolder = __dirname;


const app = express();

app.get('/', function(req, res){  
    // send html form
    res.sendFile(path.join(currentFolder + '/form.html'))

});

// process an image
app.post('/post', function(req, res){
    const pathUrl = currentFolder + '/processImage.js'

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.zipfile.path;
        var newpath = currentFolder + '/' + files.zipfile.name;

        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            const child2 = fork(pathUrl);
            child2.send(newpath);
  
            child2.on('message', output =>{
                const processedimg = __dirname + '/' + output.url ;
                fs.readFile(processedimg, function(err, data){
                    if(err){
                        console.log("error ocuured", err);
                    } else{
                        res.writeHead(200, {'content-Type': 'image/jpeg'});
                        res.write(data);
                    }
                });
           });

        });

       
    });
});


app.listen(port);

var n = require('os').networkInterfaces()

var myIp = module.exports = function () {
    var ip = []
    for(var k in n) {
    var inter = n[k]
    for(var j in inter)
        if(inter[j].family === 'IPv4' && !inter[j].internal)
        return inter[j].address
    }
}
var ipString = String(myIp());


console.log('Server IP address:' + ipString + ':' + port);

