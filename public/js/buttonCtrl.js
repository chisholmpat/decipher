$("#uploadTrigger").click(function(){
   $("#uploadFile").click();
});

$("#captureTrigger").click(function(){
   $("#captureFile").click();
  //console.log($('#captureFile')[0].files[0]);
   
  $('#captureFile').change('on', function() {
  	//setTimeout(resize(), 5000);
  	resize();
  });

});


//Resize after change
var resize = function() {
		$('#test').click();
		console.log($('#captureFile')[0].files[0]);
	}