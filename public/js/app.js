
//var language = document.getElementById("languageSelect");
var language= $('#languageSelect')[0]; //should be equal to getElementById need ())[0]<-- because have to indicate a single dom object



function translate(event, form) {
	var postData = new FormData();
	postData.append('userPhoto', form.userPhoto.files[0], form.userPhoto.files[0].name);
	postData.append('language', language.options[language.selectedIndex].value);

	$.ajax({
		url:'/api/photo',
		data: postData,
		type: 'POST',
		processData: false,
		contentType: false,
		success: function(responseData, status) {
			//document.getElementById("translatedText").innerHTML = responseData;
			$('#translatedText').html(responseData);// replaces above
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
