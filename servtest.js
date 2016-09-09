/* ================================
  Required modules
================================ */
const express = require("express");
const multer = require('multer');
const watson = require('watson-developer-cloud');
const path = require('path')
const crypto = require('crypto');
const fs = require('fs');
const languageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');
const jimp = require('jimp');
const bodyParser = require('body-parser');
const formidable = require("express-formidable");
require("./public/js/resize.js");
eval(fs.readFileSync('./public/js/watson.js') + '');
//Server var / Global
var app = express();
/* ================================
  Init Server, Set path
================================ */
//Set port to 3000
app.set('port', 3000);
//Define the default server path to /public
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(errorHandler);
//Listen to port 3000, and process environment
app.listen(process.env.PORT || 3000, function() {
  console.log("Hosted on port 3000. Ctrl + c to close the server");
});
//Extends the default error handler, passes uncaught exceptions by default to process
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    res.status(500);
    res.render('error', {
      error: err
    });
  } //End errorHandler
/* ================================
    Multer Module
================================ */
  //Multer settings for images
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex') + path.extname(file.originalname))
          }) //End hash function
      } //End diskStorage function
  }) //End storage def
var upload = multer({
  storage: storage
}).single('userPhoto');
/* ================================
  Watson API Credentials
================================ */
var visual_recognition = watson.visual_recognition({
  url: 'https://gateway-a.watsonplatform.net/visual-recognition/api',
  api_key: '45e6ad6fd4453ed9f57f46a9c3b8d7bad023061e', //Unique key via BlueMix
  version: 'v3',
  version_date: '2016-05-19'
});
var language_translator = new languageTranslatorV2({
  username: "c5393096-827e-49f8-961f-36120c6cda8a",
  password: "Igiv7HTwPRCD"
});
/* ================================
  Post to Multer API
================================ */
app.post('/api/photo', function(req, res) {
  upload(req, res, function(err) {
    if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      res.end("This application does not support that file extension.");
    }
    if (err) {
      res.end("Error uploading file.");
    }
    var filename = req.file.destination + Date.now() + "resized.png";
    var langIn = req.body.language, langOut = 'en';
    
    jimp.read(req.file.path, function(err, file) {
      if (err) {
        console.log('I/O error:' + err);
        res.end('An error occured while processing your image. Please try again.');
      } else {
        file.resize(200, 200).quality(100).write(filename, function(err) {
          if (err) {
            console.log('I/O error: ' + err);
            res.end('An error occured while processing your image. Please try again.');
          } else {
            analyzeText(filename, langIn, langOut, res, req);
            fs.unlinkSync(req.file.path);
          } //End else
        }); //End write function
      } //End if
    }); //End read function
  }); //End upload function
}); //End post
/* ================================
  Post to /text
================================ */
app.use(formidable.parse()); //Handles parsing data contained in FormData objects
//Executes translation function on text
app.post('/text', function(req, res) {
  var inputText = req.body.inputText;
  var langIn = req.body.language,langOut = 'en';
  translate(inputText, langIn, langOut, req, res);
});//End post