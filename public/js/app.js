
//var language = document.getElementById("languageSelect");
var language= $('#languageSelect')[0]; //should be equal to getElementById need ())[0]<-- because have to indicate a single dom object
var choice = false;

function translateText(event, form) {
	var postData = new FormData();
	var url;
	postData.append('language', language.options[language.selectedIndex].value);

	if (choice == false) {
		console.log('picture selected');
		postData.append('userPhoto', form.userPhoto.files[0], form.userPhoto.files[0].name);
		url = '/api/photo';
	}
	else {
		console.log('text selected');
		postData.append('inputText', $("#inputText").val());
		url = '/text';
	}
			$.ajax({
			url:url,
			data: postData,
			type: 'POST',
			processData: false,
			contentType: false,
			success: function(responseData, status) {
				//document.getElementById("translatedText").innerHTML = responseData;
				$('#translatedText').html(responseData);// replaces above
				console.log(status);
			}
		});
	event.preventDefault();
	return false;
}

/*========================
				ANGULAR
========================*/
var app = angular.module('myApp',[]);

app.controller('button',function($scope){
	$scope.showMe=false;

	$scope.$watch('showMe',function(){
	$scope.enterText=$scope.showMe ? 'Capture photo':'Enter Text';

	if ($scope.showMe == false)
		choice = false;
	else 
		choice = true;
	});
});

app.directive('imageCapture',function(){
  return{
    restrict:'E',
    templateUrl:'image-capture.html'
  };
});
app.directive('decipherPane', function(){
	return{
		restrict:'E',
		templateUrl:'decipher-pane.html'
	};
});
app.directive('desiredLanguage', function(){
	return{
		restrict:'E',
		templateUrl:'desired-language.html'
	};
});

function btnCheck(){

}
