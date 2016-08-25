/* ================================
		Required modules
   ================================ */
var express = require("express");
var multer = require('multer');
var watson = require('watson-developer-cloud');
var path = require('path')
var crypto = require('crypto');
var fs = require('fs');

var languageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');


var sharp = require('sharp');
require("./public/js/resize.js");

//Server var / Global
var app = express();

/* ================================
		Init Server, Set path
   ================================ */
//Set port to 3000
app.set('port' ,  3000);
//Define the default server path to /public
app.use(express.static(__dirname + '/public'));
//Listen to port 3000, and process environment
app.listen(process.env.PORT || 3000, function() {
	console.log("Hosted on port 3000. Ctrl + c to close the server");
});


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
var fields = [{
  name: 'userPhoto',
  maxCount: 1
}, {
  name: 'positive',
  maxCount: 1
}, {
  name: 'negative',
  maxCount: 1
}]

//Store Multer results
var upload = multer({
  storage: storage
}).fields(fields);


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
    if (err) {
      return res.end("Error uploading file.");
    }
    console.log(req.files['userPhoto']);
    var params = {
      images_file: fs.createReadStream(req.files['userPhoto'][0].path) // must be a .zip file containing images
    };

    visual_recognition.recognizeText(params, function(err, resRecognizeText) {
      if (err) {
        console.log(err);
      }
      else {
        var outText = "";
        var json = JSON.parse(JSON.stringify(resRecognizeText, null, 2));
        for (var item in json.images) {
          for (var index in json.images[item].words) {
            outText += json.images[item].words[index].word + " ";
          }
        } 
        translate(outText);
      }   
    }); 
  });

 function translate(outText) {
    language_translator.translate({
      text: outText, 
      source : 'en', 
      target: 'es' 
    },
      function (err, translation) {
        if (err)
          console.log('error:', err);
        else {
          var translatedText = "";
          var jsonTranslated = JSON.parse(JSON.stringify(translation, null, 2));
          for (var key in jsonTranslated.translations) {
            translatedText += jsonTranslated.translations[key].translation;
          }
         res.end(translatedText);
      }
    });
  }
});

