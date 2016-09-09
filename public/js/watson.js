  function analyzeText(file, langIn, langOut, res, req) {
      var params = {
        images_file: fs.createReadStream(file) // must be a .zip file containing images
      };

      visual_recognition.recognizeText(params, function(err, resRecognizeText) {
        var outText = "";
        if (err) {
          console.log('recog error: ' + err);
          res.end("Watson is experiencing difficulties... Please try again.");
        } else {
          var count = 0, total = 0, average = 0;
          var json = JSON.parse(JSON.stringify(resRecognizeText, null, 2));

          for (var item in json.images) {
            for (var index in json.images[item].words) {
              outText += json.images[item].words[index].word + " ";
              total += json.images[item].words[index].score;
              count++;
            } //End nested for
          } //End for

          average = total / count
          if (average > 0.5 && langIn !== 'en') {
            translate(outText, langIn, langOut, res, req);
          } //End nested if
          else if (average > 0.5 && langIn == 'en') {
            res.end(outText);
          } else {
            res.end("An error occured during image processing. Please try again.");
          }//End nested if
        }//End if
      });//End recognizeText
    } //End analyzeTest

  function translate(textIn, langIn, langOut, req, res) {
    language_translator.translate({
      text: textIn,
      source: langIn,
      target: langOut
    }, function(err, translation) {
      if (err) {
        console.log('translation error: ' + err);
        res.end("An error occurred during translation.. Please try again.");
      } else {
        var translatedText = "";
        var jsonTranslated = JSON.parse(JSON.stringify(translation, null, 2));

        for (var key in jsonTranslated.translations) {
          translatedText += jsonTranslated.translations[key].translation;
        }//End for

        res.end(translatedText);
      }//End if
    });//End watson translate
  }//End translate