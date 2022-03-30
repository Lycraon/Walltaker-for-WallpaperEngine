var linkID = "";
var lastUrl = "";
var interval = 10000;
var objFit = "contain";

window.wallpaperPropertyListener = {
     applyUserProperties: function(properties) { 
		if(properties.linkID){
			linkID = properties.linkID.value;
			lastUrl = "";
			getJSON();
		}
	 
		if(properties.interval) 
		interval = parseInt(properties.interval.value) *1000;
	 
		if(properties.text_color)
		$(".text").css("color",GetRGBColor(properties.text_color.value));
	
		if(properties.backg_color)
		$("body").css("background-color",GetRGBColor(properties.backg_color.value));
	
		if(properties.objFit){
			objFit = properties.objFit.value;
			lastUrl = "";
			getJSON();
		}
		
		if(properties.zoom_w)	
		$("#canvas").css("width",properties.zoom_w.value + "%");
		
		if(properties.zoom_h)
		$("#canvas").css("height",properties.zoom_h.value + "%");
		
		if(properties.canv_x)
		$("#canvas").css("margin-top",properties.canv_x.value + "px");
		
		if(properties.canv_y)
		$("#canvas").css("margin-left",properties.canv_y.value + "px");
	 },
};


UpdateCanvas();
var intervalID = null;


 function ChangeSettings() {
		
		$(".text").css("color",$("#tpc").css("color"));
		
		
	}

function GetRGBColor(customColor){
	var temp = customColor.split(' ');
		
            temp = temp.map(function _cap(c) {
                return Math.ceil(c * 255);
            });
		
            return customColorAsCSS = 'rgb(' + temp + ')';
	
}

function showNotification() {
 
}


function getJSON(){
		$.ajaxSetup({
		  headers : {   
			'User-Agent' : 'Wallpaper Engine Wallpaper'
		  }
		});
		$.getJSON("https://walltaker.joi.how/links/" + linkID + ".json", function(data){
			//$("#tpc").html('Last Update:'+ data.updated_at);
			
			if((data && lastUrl != data.post_url) || overideUpdate == true ){
				overideUpdate = false;
				showNotification()
					
				var display = ""; 
				if(data.set_by)
				display += '<a href="https://walltaker.joi.how/users/' + data.set_by + '" rel="external" target="_blank" class="text">set_by: '+ data.set_by +'</a><br>';

				if(data.post_url && data.post_url != ""){

						$("body").css("background-color", "black");
						//display += '<p class="text">'+interval+'</p>'
						//display += '<p class="text">Last Change:'+ data.updated_at  +'</p>'
						//display += '<p class="text">'+objFit+'</p>'
						display += '<img id="bImg" src ="'+data.post_url+'" style="object-fit: '+objFit+';">';
					
				}else $("body").css("background-color", "transparent");	
				
		
				
				$("#canvas").html(display);
				lastUrl = data.post_url;	
				
				
				
				ChangeSettings();
				
			}
			
		});
		
		
	}
	


function UpdateCanvas(){
	getJSON();
	
	intervalID = setTimeout(UpdateCanvas, interval);
};



