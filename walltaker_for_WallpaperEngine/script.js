const name = "walltaker-wallpaper-engine";
const vNr_str = "v0.1.0";

const areas = ["none","top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","canvas"];
const reacts = ["","disgust","horny","came"];
const emojis = ["[]","","😍","💦"];

var settings = {
	'linkID' : "",
	'api_key' : "",
	'textColor' : "255 255 255",
	'interval' : "10000",
	'objFit'  : "contain",
	'textPos' : "top-left",
	'reactPos': "top-center",
	'responsePos': "top-center"
};
var lastUrl = "";
var Url = "";





window.wallpaperPropertyListener = {
     applyUserProperties: function(properties) { 
		if(properties.api_key)
		settings["api_key"] = properties.api_key.value;
	 
		if(properties.linkID){
				settings["linkID"] = properties.linkID.value;
				lastUrl = "";
				getJSON();
			}
	 
		if(properties.interval) 
		settings["interval"] = parseInt(properties.interval.value) *1000;
	 
		if(properties.text_color)
		settings["textColor"] = properties.text_color.value;
		
	
		if(properties.backg_color)
		$("body").css("background-color",GetRGBColor(properties.backg_color.value));
	
		if(properties.objfit){
			settings["objFit"] = properties.objfit.value;		
			
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
		ChangeSettings();
	 },
};

UpdateCanvas();


        


 function ChangeSettings() {
		//$(".text").css("color",GetRGBColor(textColor));		
		
		var css = "";
		
		css+= ".text{\n";
		css+= "	color:"+GetRGBColor(settings["textColor"])+";\n";
		css+= "}\n\n";
		
		css+= "#bImg {\n";;
		css+= '	background-repeat: no-repeat;\n';
		css+= "object-fit:"+settings["objFit"]+"!important;\n";
		css+= 'position: absolute;\n';
		css+= "}\n\n";
		var dynStyle = document.createElement("Style");
		dynStyle.id = "dynCSS";
		document.head.innerHTML = '<meta charset="utf-8"><link rel="stylesheet" href="style.css" type="text/css"><script type="text/javascript" src="jquery.js"></script><script type="text/javascript" src="script.js"></script><style id="dynStyle"></style><style id="dynCSS"></style>';
		document.getElementById("dynCSS").innerHTML = css;
	}
	

	
function GetRGBColor(customColor){
	var temp = customColor.split(' ');
		
            temp = temp.map(function _cap(c) {
                return Math.ceil(c * 255);
            });
		
            return customColorAsCSS = 'rgb(' + temp + ')';
	
}

function react(reactType){	

		var type = reacts[reactType];
		
		
	
		
		var txt = ""
		
		
			
		 $.ajax({
			type: "POST",		
			url: "https://walltaker.joi.how/api/links/"+ settings["linkID"] +"/response.json",
			data: JSON.stringify({ "api_key": settings["api_key"], "type" : type, "text" : txt}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){setNewPost(data);},
			failure: function(errMsg) {}
		});
	
}

function setNewPost(data){
			
			if((data && lastUrl != data.post_url) || overideUpdate == true ){
				overideUpdate = false;
				
				var variables = {
					'top-left': "",
					'top-center': "",
					'top-right': "",
					'bottom-left': "",
					'bottom-center': "",
					'bottom-right': "",
					'canvas': "",
					'test': ""
				}

				

				if(data.set_by){
					var setBy = '<p class="text">set_by: '+ data.set_by +'</p><br>';
				
					variables[settings["textPos"]] += setBy;
				}
					
					
				var react = '<div id="buttons">';
					react += '<button type="button" name="btn_hate" onclick="react(1)">hate it</button>';
					react += '<button type="button" name="btn_love" onclick="react(2)">love it</button>'; 
					react += '<button type="button" name="btn_cum" onclick="react(3)">I came</button>'; 
					react += '</div>';
								
				variables[settings["reactPos"]] += react;

				var response = '<p class="text" width="auto" height="auto" margin="0" text->';
				
				
				if(data.response_type){
					for(var i =0; i< reacts.length;i++){
						if(data.response_type == reacts[i])
						response += emojis[i];
					}
				}
				
				if(data.response_text)
				response += ": "+ data.response_text;
			
				response+='</p>';
				
				variables[settings["responsePos"]] += response;
				
				//variables["canvas"] += '<div id="bImg"></div>';
				if(data.post_url && data.post_url != ""){
						$("body").css("background-color", "black");
						//Url = data.post_url;
						variables["canvas"] += '<Img id="bImg" src="'+data.post_url+'"/>';
						//display += '<p class="text">'+interval+'</p>'
						//display += '<p class="text">Last Change:'+ data.updated_at  +'</p>'
						//display += '<p class="text">'+objFit+'</p>'
						
					
				}else $("body").css("background-color", "transparent");	
				
		
				//$("#bImg").css("object-fit",objFit);
				
				
				areas.forEach( (ar,index) => {
					var name = ar;
						if(index >0){

						$("#"+name).html(variables[name]);	
						
						
					}
				});
				
				//$("#canvas").html(variables["canvas"]);	
		
				lastUrl = data.post_url;	
				
				
				
				ChangeSettings();
				
			}
}


function getJSON(){
		$.ajaxSetup({
		   xhrFields: { withCredentials:true },
		   crossDomain: true,
		   beforeSend:  function(request) {
				request.setRequestHeader("Wallpaper-Engine-Client", vNr_str);
				//request.setRequestHeader("Cookie", "user_agent="+name+"/"+vNr_str);
				//request.setRequestHeader("User-Agent" , name + '/' + vNr_str);
			} 
		});
		
		window.navigator.__defineGetter__('userAgent', function () {
			return name + '/' + vNr_str;
		});
		
		$.getJSON("https://walltaker.joi.how/api/links/" + settings["linkID"] + ".json", function(data){setNewPost(data);} );
		
		
	}
	

var intervalID = null;
function UpdateCanvas(){
	getJSON();
	
	intervalID = setTimeout(UpdateCanvas, settings["interval"]);
};






