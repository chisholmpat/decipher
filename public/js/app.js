
//var language = document.getElementById("languageSelect");
//var language= $("#languageSelect").trigger("click"); not work
var language= $('#languageSelect')[0]; //should be equal to getElementById
//var language=$("languageSelect").get(0);


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
			document.getElementById("translatedText").innerHTML = responseData;
		}
	});

	event.preventDefault();
	return false;
}
