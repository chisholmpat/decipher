function translate(event, form) {
	var postData = new FormData();
	postData.append('userPhoto', form.userPhoto.files[0], form.userPhoto.files[0].name);

	$.ajax({
		url:'/api/photo',
		data: postData,
		type: 'POST',
		processData: false,
		contentType: false,
		success: function(responseData, status) {
			//alert(responseData);
			document.getElementById("translatedText").innerHTML = responseData;
		}
	});

	event.preventDefault();

	return false;
}
