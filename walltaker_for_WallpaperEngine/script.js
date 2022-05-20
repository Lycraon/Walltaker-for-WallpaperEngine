const name = "walltaker-wallpaper-engine";
const vNr_str = "v0.3.0";

const areas = ["none","top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","canvas"];
const reacts = {
	"":"[]",
	"disgust":"",
	"horny":"😍",
	"came":"💦",
}

var settings = {
	'linkID' : "",
	'api_key' : "",
	'textColor' : "255 255 255",
	'background-color': "0 0 0",
	'background-opacity': "1",
	'interval' : "10000",
	'objFit'  : "contain",
	'textPos' : "top-left",
	'reactPos': "top-center",
	'showSetterData': "true",
	'listSetterLinks': "true",
	'responsePos': "top-center",
	'setterInfoPos': "top-left",
	'zoom_w': "100",
	'zoom_h': "100",
	'canv_x': "0",
	'canv_y': "0"
};
var lastUrl = "";
var lastSetBy = "";
var lastResponseType = "";
var lastResponseText = "";

var Url = "";
var overideUpdate = false;
var bOpacity = settings["background-opacity"];



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
		settings["background-color"] = properties.backg_color.value;

	
		if(properties.objfit){
			settings["objFit"] = properties.objfit.value;		
			
			lastUrl = "";
			getJSON();
		}
		
		if(properties.zoom_w)
		settings["zoom_w"] = properties.zoom_w.value;			
		
		
		if(properties.zoom_h)
		settings["zoom_h"] = properties.zoom_h.value;	
		
		if(properties.canv_x)
		settings["canv_x"] = properties.canv_x.value;		
			
		if(properties.canv_y)
		settings["canv_y"] = properties.canv_y.value;	
		
		ChangeSettings();
	 }
};

UpdateCanvas();


        


 function ChangeSettings() {
		//$(".text").css("color",GetRGBColor(textColor));	
        var color = settings["background-color"]+" "+ bOpacity;
		$("body").css("background-color",GetRGBColor(color));
		$("#canvas").css("width",settings["zoom_w"] + "%");
		$("#canvas").css("height",settings["zoom_h"] + "%");
		$("#canvas").css("margin-top",settings["canv_x"] + "px");
		$("#canvas").css("margin-left",settings["canv_y"].value + "px");
		
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
			var rgb = temp.slice(0, 3);
            rgb = rgb.map(function _cap(c) {
                return Math.ceil(c * 255);
            });
		
			var customColorAsCSS = "";
		
			if(temp.length > 3)
			customColorAsCSS = 'rgba(' + rgb+','+temp[3]+ ')';
			else
			customColorAsCSS = 'rgb(' + rgb+')';
			//if(temp.length > 2) 
				    //else return customColorAsCSS = 'rgb(' + temp + ')';
				
			return customColorAsCSS;
        
	
}

function react(reactType){	

		var txt = ""
		
		console.log("Posting reaction to Link " + settings["linkID"] );
			
		 $.ajax({
			type: "POST",		
			url: "https://walltaker.joi.how/api/links/"+ settings["linkID"] +"/response.json",
			data: JSON.stringify({ "api_key": settings["api_key"], "type" : reactType, "text" : txt}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){setNewPost(data);},
			failure: function(errMsg) {}
		});
	
}


async function setNewPost(data){
			
			if((data && lastUrl != data.post_url) || data.response_type != lastResponseType || data.response_text != lastResponseText ||overideUpdate == true ){
				overideUpdate = false;
				console.log("Updating link data!" );
				
				var variables = {
					'top-left': "",
					'top-center': "",
					'top-right': "",
					'bottom-left': "",
					'bottom-center': "",
					'bottom-right': "",
					'canvas': ""
					
				}

				/*
				if(data.username && settings["userPos"] && settings["userPos"] != " " && settings["userPos"] != "none"){
					console.log("fetching user info for " + data.username);
					
					
					
					var UserInfo = "";
				
					variables[settings["userPos"]] += UserInfo;
				}*/
				
				if(data.set_by){
					var setBy = '<p id="setBy" class="text">set_by: '+ data.set_by +'</p>';
					variables[settings["textPos"]] += setBy;
					lastSetBy = data.set_by;	
					
				}else if(lastSetBy && lastUrl == data.post_url){
					var setBy = '<p id="setBy" class="text">set_by: '+ lastSetBy +'</p>';
				
					variables[settings["textPos"]] += setBy;
				}else lastSetBy = null;
					
					
				var react = '<div id="buttons">';
					react += '<button type="button" name="btn_hate" onclick="react("disgust")">hate it</button>';
					react += '<button type="button" name="btn_love" onclick="react("horny")">love it</button>'; 
					react += '<button type="button" name="btn_cum" onclick="react("came")">I came</button>'; 
					react += '</div>';
								
				variables[settings["reactPos"]] += react;

				var response = '<p class="text" height="auto" margin="0" text->';
				
				if(data.response_type)
				response += reacts[data.response_type];
				
				if(data.response_text)
				response += ": "+ data.response_text;
			
				response+='</p>';
				
				variables[settings["responsePos"]] += response;
				
				//variables["canvas"] += '<div id="bImg"></div>';
				if(data.post_url && data.post_url != ""){
						//Url = data.post_url;
						bOpacity = settings["background-opacity"];
						variables["canvas"] += '<Img id="bImg" src="'+data.post_url+'"/>';
						//display += '<p class="text">'+interval+'</p>'
						//display += '<p class="text">Last Change:'+ data.updated_at  +'</p>'
						//display += '<p class="text">'+objFit+'</p>'
						
					
				}else bOpacity = "0";
				
				
				
				
				
				areas.forEach( (ar,index) => {
					var name = ar;
						if(index >0){

						$("#"+name).html(variables[name]);	
						
						
					}
				});
				
				//$("#canvas").html(variables["canvas"]);	
		
				lastUrl = data.post_url;
							
				lastResponseType = data.response_type;
				lastResponseText = data.response_text;
				
				ChangeSettings();
				
					if(settings["showSetterData"] == "true")	{
						var userData = await getUserInfo(data.set_by);
						
						if(userData){
							var setBy = 'set_by:';
							if(userData.friend)
							setBy += '♥️ ';
						
							setBy += data.set_by;
							
							if(userData.online){
								setBy += ' 🟢';
							}
							
							$("#setBy").html(setBy);

							//var userInfo = '<p class="text">';
							
							if(userData.links){

							
								var elInfo = document.createElement("p");
								elInfo.classList.add('text');
								var strInfo = 'Links: ' + userData.links.length;
								elInfo.innerHTML = strInfo;
								document.getElementById(settings["setterInfoPos"]).appendChild(elInfo); 
								if(settings["listSetterLinks"] == "true" ){
									for(var i=0;i< userData.links.length;i++){
										var elLink = document.createElement("p");
										elLink.classList.add('text');
										
										var linkInfo = "";
										if(userData.links[i]){
										
										linkInfo += " -- [";
										
										if(userData.links[i].id)
										linkInfo += userData.links[i].id;
									
										linkInfo += "] ";
										linkInfo += "last Response:";
										
										if(userData.links[i].response_type)
										linkInfo += reacts[userData.links[i].response_type] + " ";
									
										if(userData.links[i].response_text)
										linkInfo += userData.links[i].response_text
									
										linkInfo += " \n";
										
										}
										elLink.innerHTML = linkInfo;
										document.getElementById(settings["setterInfoPos"]).appendChild(elLink); 
									}
								}
								
								
							}

						}
					}
			}
}


function getJSON(){
		if(settings["linkID"]){
		$.ajaxSetup({
		   xhrFields: { withCredentials:true },
		   crossDomain: true,
		   beforeSend:  function(request) {
				request.setRequestHeader("Wallpaper-Engine-Client", vNr_str);
				console.log("fetching link " + settings["linkID"] );
				//request.setRequestHeader("Cookie", "user_agent="+name+"/"+vNr_str);
				//request.setRequestHeader("User-Agent" , name + '/' + vNr_str);
			} 
		});
		
		/*
		window.navigator.__defineGetter__('userAgent', function () {
			return name + '/' + vNr_str;
		});*/
		
		$.getJSON("https://walltaker.joi.how/api/links/" + settings["linkID"] + ".json", function(data){setNewPost(data);} );
		
		}else console.log("Did not request Link -> linkId was empty");
	}
	
async function getUserInfo(username){
	
		var json;
		$.ajaxSetup({
		   xhrFields: { withCredentials:true },
		   crossDomain: true,
		   beforeSend:  function(request) {
				request.setRequestHeader("Wallpaper-Engine-Client", vNr_str);
				console.log("fetching UserInfo of " + username);
				//request.setRequestHeader("Cookie", "user_agent="+name+"/"+vNr_str);
				//request.setRequestHeader("User-Agent" , name + '/' + vNr_str);
			} 
		});
		
		
		
		//$.getJSON("https://walltaker.joi.how/api/users/" + username + ".json",function(data){ 	} );
		let url = "https://walltaker.joi.how/api/users/" + username + ".json";
		
		let tmp = await fetch(url);
		json = await tmp.json();	
		return json;
		
	}
	

var intervalID = null;
function UpdateCanvas(){
	getJSON();
	
	intervalID = setTimeout(UpdateCanvas, settings["interval"]);
};






