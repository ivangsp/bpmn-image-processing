const https = require('https');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs-extra');
const express = require('express');
const Bpmn = require('bpmn-engine');

const currentFolder = __dirname;
const app = express();
var public = path.join(__dirname, 'public');
app.use('/', express.static(public));

var request = require('request');


app.get('/', function(req, res){
    // send html form
    res.sendFile(path.join(public, 'form.html'));
});


app.post('/post', function(req, res){

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Read the file
        readContent(files.zipfile.path, function(err, result){

            // const id = Math.floor(Math.random() * 10000);
            var processXml =  result;
            const engine = new Bpmn.Engine({
                name: 'script task example',
                source: processXml
            });

            engine.execute(
                {
                    variables: {
                        scriptTaskCompleted: false,
                        rootDir: __dirname,
                        finishedDownloadingImg: false,
                        finishedDownloadingModule: false
                    },
                    services: {
                        https: {
                            module: 'https'
                        },
                        fs: {
                            module: 'fs'
                        },
                        AdmZip: {
                            module: 'adm-zip'
                        }
                    }
                },
                (err, execution) =>
                {
                    if (err){
                        throw err;
                    }

                    execution.once('end', (definition) => {

                        if (execution.variables.finishedDownloadingModule && execution.variables.finishedDownloadingImg) {
                            console.log("finished downloading jimp module", new Date().getTime());
                            res.redirect("/processed-image")
                        }

                    });
                });
        });

    });

});

app.get('/processed-image', function(req, res) {
    var Jimp = require(__dirname + "/downloaded_modules"+ "/node_modules" +"/jimp");
    fs.readFile('logo2.png', function(err, data){
        if (err) throw error;

        Jimp.read(data, function (err, lenna) {
            if (err) throw err;
            lenna.resize(256, 256)
                .quality(60)
                .greyscale()
                .write(__dirname + "/new.jpg", function(err, data1){
                    fs.unlink('logo2.png');
                    // fs.unlink(__dirname + "/downloaded_modules"+ "/node_modules")
                    // rimraf(__dirname + "/downloaded_modules"+ "/node_modules", function () {
                    //     console.log('done');
                    // });
                    fs.removeSync(__dirname + "/downloaded_modules"+ "/node_modules");
                    res.sendFile(__dirname + "/new.jpg")
                });

        });


    });
});

function readContent(path, callback) {
    fs.readFile(path,'utf-8', function (err, content) {
        if (err) return callback(err)
        callback(null, content)
    })
}





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

app.listen(process.env.PORT || 3000, function(){
    console.log('Server IP address:' + ipString + +':' + this.address().port, app.settings.env);
});




