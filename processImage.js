var path = require('path');
var Jimp = require("jimp");

var new_img =  '/img2';
class ImageProcess{

    convertImage(img){
        new_img = __dirname + new_img  + path.extname(img);
       // open a file called "lenna.png"
        Jimp.read(img, function (err, lenna) {
            if (err) throw err;
            lenna.resize(256, 256)            // resize
                .quality(60)                 // set JPEG quality
                .greyscale()                 // set greyscale
                .write(new_img);            // save
        });
        return new_img;
    }
}

module.exports = new ImageProcess();
