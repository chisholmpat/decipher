
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
var app = angular.module('option',[]);
app.controller('nameMe' , function(){

});
app.directive()
