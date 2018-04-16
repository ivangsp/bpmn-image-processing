const http = require('http');
var url = require('url');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs');
const express = require('express');
var Jimp = require("jimp");
const  {performance}  = require('perf_hooks');




var port = 8083
const currentFolder = __dirname;


const app = express();

app.get('/', function(req, res){  
    // send html form
    res.sendFile(path.join(currentFolder + '/form.html'))

});

// process an image
app.post('/post', function(req, res){
    var t1 = performance.now();

    const pathUrl = currentFolder + '/processImage.js'

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.zipfile.path;
        var newpath = currentFolder + '/' + files.zipfile.name;

        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;

            // const img = ImageProcess.convertImage(newpath)
            Jimp.read(newpath, function (err, lenna) {
                if (err) throw err;
               lenna.resize(256, 256)            // resize
                    .quality(60)                 // set JPEG quality
                    .greyscale()                 // set greyscale
                    .write(__dirname + "/new.jpg", function(err, data1){
                        
                        fs.readFile(__dirname + "/new.jpg", function(err, data){
                            var t2 = performance.now();
                            console.log("the time taken to process an image took " + (t2-t1) + "milliseconds")
                            if(err) throw err
                            res.writeHead(200, {'content-Type': 'image/jpg'});
                            res.write(data);
                
                        });
                    });            

            });

            

        });

       
    });
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
// var n = require('os').networkInterfaces()

// var myIp = module.exports = function () {
//     var ip = []
//     for(var k in n) {
//     var inter = n[k]
//     for(var j in inter)
//         if(inter[j].family === 'IPv4' && !inter[j].internal)
//         return inter[j].address
//     }
// }
// var ipString = String(myIp());


// console.log('Server IP address:' + ipString + ':' + port);

