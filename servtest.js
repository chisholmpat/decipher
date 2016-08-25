/* ================================
		Required modules
   ================================ */
var express = require("express");
var multer = require('multer');
var watson = require('watson-developer-cloud');
var path = require('path')
var crypto = require('crypto');
var fs = require('fs');
var languageTranslatorV2 = require(
  'watson-developer-cloud/language-translator/v2');
var jimp = require('jimp');
require("./public/js/resize.js");
//Server var / Global
var app = express();

/* ================================
		Init Server, Set path
   ================================ */
//Set port to 3000
app.set('port', 3000);
//Define the default server path to /public
app.use(express.static(__dirname + '/public'));
//Generic error handling middle-ware, which passes uncaught exceptions to the default Node error handler
app.use(errorHandler);
//Listen to port 3000, and process environment
app.listen(process.env.PORT || 3000, function() {
  console.log("Hosted on port 3000. Ctrl + c to close the server");
});

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}//End errorHandler

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
      })
    }
  })
  
//Store Multer results
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
		Classifiers
   ================================ */
app.get('/test', function(req, res) {
  // var params = {
  // name: 'poodle', 
  // poodle_positive_examples: fs.createReadStream('./uploads/positive.zip'),
  // negative_examples: fs.createReadStream('./uploads/negative.zip')
  // };
  // visual_recognition.createClassifier(params, function(err, res) { 
  // 	if (err) {
  //     	console.log(err);
  // }
  //  	else {
  //     	console.log(JSON.stringify(res, null, 2));
  //     }
  // });
  visual_recognition.listClassifiers({}, function(err, response) {
    if (err) console.log(err);
    else console.log(JSON.stringify(response, null, 2));
  });
});

/* ================================
    GET data from Client
   ================================ */
   
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
    jimp.read(req.file.path, function(err, file) {
      file.resize(200, 200).quality(100).write(filename, function(
        err) {
        if (err) {
          console.log(err);
        } else {
          analyzeText(filename);
          fs.unlinkSync(req.file.path);
        } //End else
      }); //End write function
    }); //End read function
    //console.log(req.file);
  }); //End upload function
  
  function analyzeText(file) {
      var params = {
        images_file: fs.createReadStream(file) // must be a .zip file containing images
      };
      visual_recognition.recognizeText(params, function(err,
        resRecognizeText) {
        if (err) {
          console.log(err);
          res.end(
            "Watson is experiencing difficulties... Please try again."
          )
        } else {
          var outText = "";
          var json = JSON.parse(JSON.stringify(resRecognizeText, null,
            2));
          for (var item in json.images) {
            for (var index in json.images[item].words) {
              outText += json.images[item].words[index].word + " ";
            }
          }
          translate(outText);
        }
      });
    } //End analyzeTest

  function translate(outText) {
      language_translator.translate({
        text: outText,
        source: 'en',
        target: 'es'
      }, function(err, translation) {
        if (err) console.log('error:', err);
        else {
          var translatedText = "";
          var jsonTranslated = JSON.parse(JSON.stringify(translation,
            null, 2));
          for (var key in jsonTranslated.translations) {
            translatedText += jsonTranslated.translations[key].translation;
          }
          res.end(translatedText);
        }
      });
    } //End translate
}); //End post
