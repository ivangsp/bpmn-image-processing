const https = require('https');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs-extra');
const express = require('express');
const Bpmn = require('bpmn-engine');
const AdmZip = require('adm-zip');

const currentFolder = __dirname;
const app = express();
var public = path.join(__dirname, 'public');
app.use('/', express.static(public));

var request = require('request');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'timeTaken.csv',
    header: [
        {id: 'p1', title: 'DIST'},
        {id: 'p2', title: 'LOCAL'},
    ]
});

var time_p1;
var time_p2;
var start_time;
var end_time;



app.get('/', function(req, res){
    // send html form
    res.sendFile(path.join(public, 'form.html'));
});

app.get('/home', function(req, res){
    // send html form
    res.sendFile(path.join(public, 'form2.html'));
});


app.post('/post', function(req, res){
    start_time = +new Date();

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Read the file
        fs.readFile(files.zipfile.path, function(err, result){

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
                            res.redirect("/processed-image")
                        }

                    });
                });
        });

    });

});

app.post('/post-zipfile', (req, res) => {
    const t1 = +new Date();
    const download_dir = __dirname + '/downloaded_modules';
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Read the file
        fs.readFile(files.zipfile.path, function (err, result) {
            var zip = new AdmZip(result);
            zip.extractAllTo(download_dir, true);

            var fileName;
            // read the image from d files
            fs.readdirSync(download_dir+'/home').forEach(file => {
                let ext = file.split('.').pop();
                if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
                    fileName = file;

                }
            });

            // process the image using jimp module
            fs.readFile(download_dir + '/home/' + fileName, function(err, data){
                if (err) throw error;
                var Jimp = require(download_dir+ "/home" +'/node_modules' +"/jimp");

                Jimp.read(data, function (err, lenna) {
                    if (err) throw err;
                    lenna.resize(256, 256)
                        .quality(60)
                        .greyscale()
                        .write(__dirname + "/new-image.jpg", function(err, data1){
                            fs.removeSync(__dirname + "/downloaded_modules"+ "/home");
                            const t2 = +new Date();
                            time_p2 = t2 - t1;
                            console.log('??>>>>', time_p2);

                            const records = [{p1: time_p1,  p2: time_p2}];

                            csvWriter.writeRecords(records)
                            .then(() => {
                                console.log('...Done');
                            });
                            res.sendFile(__dirname + "/new-image.jpg")
                        });

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
                    fs.removeSync(__dirname + "/downloaded_modules"+ "/node_modules");

                    end_time = +new Date();
                    time_p1 = end_time - start_time;
                    console.log('>>>>', time_p1);
                    res.sendFile(__dirname + "/new.jpg")
                });

        });


    });
});

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





