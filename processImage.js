var path = require('path');
var Jimp = require("jimp");

var new_img =  'img2';

const convertImage = (img, cb) =>{
    new_img = new_img  + path.extname(img);
   // open a file called "lenna.png"
    Jimp.read(img, function (err, lenna) {
        if (err) throw err;
        lenna.resize(256, 256)            // resize
            .quality(60)                 // set JPEG quality
            .greyscale()                 // set greyscale
            .write(new_img, cb);            // save
    });
}

process.on('message', (img) => {
    convertImage(img, function(err, response){
        if(err === null){
            process.send({url: new_img});
        }else{
            console.log("An error occured while processing an image:", err)
        }
        
    });
   
});
