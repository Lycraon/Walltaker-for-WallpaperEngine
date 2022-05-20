//Constant variables
const name = "walltaker-wallpaper-engine";
const vNr_str = "v0.4.0";

//all area names
const areas = ["none","top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","canvas"];

//all reactions
const reacts = {
	"":"[]",
	"disgust":"",
	"horny":"😍",
	"came":"💦",
}

//Settings
var settings = {
	'linkID' : "",
	'api_key' : "",
	'textColor' : "255 255 255",
	'background-color': "0 0 0",
	'background-opacity': "1",
	'fontSize': "100%", //x-small,small, medium, large or px / em / %
	'interval' : "10000",
	'objFit'  : "contain",
	'textPos' : "top-left",
	'reactPos': "top-center",
	'showSetterData': "true",
	'listSetterLinks': "true",
	'responsePos': "top-center",
	'setterInfoPos': "top-left",
	'maxAreaWidth': "20vw", 
	'zoom_w': "100", //%
	'zoom_h': "100", //%
	'canv_x': "0", //px
	'canv_y': "0" //px
};

//Global variables
var lastSetBy = "";
var lastResponseType = "";
var lastResponseText = "";

var Url = "";
var overrideUpdate = false;
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
		
		if(properties.font_size)
		settings["fontSize"] = properties.font_size.value;
	
		if(properties.backg_color)
		settings["background-color"] = properties.backg_color.value;

		if(properties.objfit){
			settings["objFit"] = properties.objfit.value;		
			
			lastUrl = "";
			getJSON();
		}
		
		if(properties.area_maxWidth)
		settings["maxAreaWidth"] = properties.area_maxWidth.value + "vw";


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

//start Checks for Updates
UpdateCanvas();


        

//changes Settings mostly CSS stuff
 function ChangeSettings() {
		var color = settings["background-color"]+" "+ bOpacity;
		var css = "";
		
		//body
		css+= "body {\n";
		css+= "	background-color: " + GetRGBColor(color) + ";\n";
		css+= "}\n\n";
		
		//.areas
		css+= ".area{\n";
		css+= '	max-width: '+settings["maxAreaWidth"]+';\n'
		css+= "}\n\n";
		
		//.texts
		css+= ".text{\n";
		css+= "	color:"+GetRGBColor(settings["textColor"])+";\n";
		css+= "	font-size: " + settings["fontSize"] + ";\n";
		css+= "}\n\n";
		
		//#canvas
		css+= "#canvas {\n";
		css+= "	width: "+settings["zoom_w"]+"%;\n"
		css+= "	height: "+settings["zoom_w"]+"%;\n"
		css+= "	margin-top: "+settings["canv_y"]+"%;\n"
		css+= "	margin-left: "+settings["canv_x"]+"%;\n"
		css+= "}\n\n";
		
		//#bImg
		css+= "#bImg {\n";
		css+= '	background-repeat: no-repeat;\n';
		css+= "	object-fit:"+settings["objFit"]+"!important;\n";
		css+= '	position: absolute;\n';
		css+= "}\n\n";
		
		
		//wallpaperEngined liked to override header so this makes sure the header is correct
		document.head.innerHTML = '<meta charset="utf-8"><link rel="stylesheet" href="style.css" type="text/css"><script type="text/javascript" src="jquery.js"></script><script type="text/javascript" src="script.js"></script><style id="dynStyle"></style><style id="dynCSS"></style>';
		
		//setting content of dynCSS (style element)
		document.getElementById("dynCSS").innerHTML = css;
	}
	

//takes WallpaperEngine color string and converts it into (usable) rgb/rgba format
function GetRGBColor(customColor){
	//split string into values
	var temp = customColor.split(' ');
			var rgb = temp.slice(0, 3);
			
			//cap rgb values at 255
            rgb = rgb.map(function _cap(c) {
                return Math.ceil(c * 255);
            });
		
			var customColorAsCSS = "";
		
			//length is 3 for rgb values
			if(temp.length > 3)
			customColorAsCSS = 'rgba(' + rgb+','+temp[3]+ ')';
			else
			customColorAsCSS = 'rgb(' + rgb+')';

				
			return customColorAsCSS;
}

//sends POST to Website and passes data to setNewPost
function postReaction(reactType){	

		//Reaction Text
		var txt = ""
		
		console.log("Posting reaction ("+reactType+","+txt+") to Link " + settings["linkID"] );
			
		//POST	
		 $.ajax({
			type: "POST",		
			url: "https://walltaker.joi.how/api/links/"+ settings["linkID"] +"/response.json",
			data: JSON.stringify({ "api_key": settings["api_key"], "type" : ""+reactType+"", "text" : txt}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){overideUpdate=true;setNewPost(data);},
			failure: function(errMsg) {}
		});
	
}


async function setNewPost(data){
			
			//Check for changes if false skip code
			//this is for perfomance (local & network)
			if((data && lastUrl != data.post_url) || data.response_type != lastResponseType || data.response_text != lastResponseText ||overrideUpdate == true ){
				//set in case override was ture
				overrideUpdate = false;
				console.log("Updating link data!" );
				
				//String variables for areas
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
				
				//setBy
				if(data.set_by){
					var setBy = '<p id="setBy" class="text">set_by: '+ data.set_by +'</p>';
					variables[settings["textPos"]] += setBy;
					lastSetBy = data.set_by;	
					
				}else if(lastSetBy && lastUrl == data.post_url){
					var setBy = '<p id="setBy" class="text">set_by: '+ lastSetBy +'</p>';
				
					variables[settings["textPos"]] += setBy;
				}else lastSetBy = null;
					
				
				//reaction buttons				
				var react = '<div id="buttons">';
					
				
					react += '<button type="button" id="btn_hate" >hate it</button>';
					react += '<button type="button" id="btn_love" >love it</button>'; 
					react += '<button type="button" id="btn_cum"  >I came</button>'; 
					react += '</div>';
								
				variables[settings["reactPos"]] += react;

				//current response to link
				var response = '<p class="text" height="auto" margin="0" text->';
				
				if(data.response_type)
				response += reacts[data.response_type];
				
				if(data.response_text)
				response += ": "+ data.response_text;
			
				response+='</p>';
				
				variables[settings["responsePos"]] += response;
				
				//post Image
				if(data.post_url && data.post_url != ""){
						bOpacity = settings["background-opacity"];
						variables["canvas"] += '<Img id="bImg" src="'+data.post_url+'"/>';
						
					
				}else bOpacity = "0";
				
				
				//sets the html for each area with the coresponding variables
				areas.forEach( (ar,index) => {
					var name = ar;
						if(index >0){

						$("#"+name).html(variables[name]);	
						
						
					}
				});
				
				//OnClick functions for reaction buttons
				var elem = document.getElementById("btn_hate");
				elem.addEventListener("click",function(){postReaction("disgust")});
				
				elem = document.getElementById("btn_love");
				elem.addEventListener("click",function(){postReaction("horny")});
				
				elem = document.getElementById("btn_cum");
				elem.addEventListener("click",function(){postReaction("came")});
				
				//sets current dat for next check
				lastUrl = data.post_url;
							
				lastResponseType = data.response_type;
				lastResponseText = data.response_text;
				
				//calls ChangeSettings to update css / style 
				ChangeSettings();
				
				//Get infos of setter
					if(settings["showSetterData"] == "true")	{
						var userData = await getUserInfo(data.set_by);
						
						//online and friend status
						if(userData){
							var setBy = 'set_by:';
							if(userData.friend)
							setBy += '♥️ ';
						
							setBy += data.set_by;
							
							if(userData.online){
								setBy += ' 🟢';
							}
							
							$("#setBy").html(setBy);
							
							//info of links
							if(userData.links){

							
								var elInfo = document.createElement("p");
								elInfo.classList.add('text');
								var strInfo = 'Links: ' + userData.links.length;
								elInfo.innerHTML = strInfo;
								document.getElementById(settings["setterInfoPos"]).appendChild(elInfo); 
								
								//list of links
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

//gets json from website
//on sucess: calls function setNewPost() (updates background + infos)
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
		
		$.getJSON("https://walltaker.joi.how/api/links/" + settings["linkID"] + ".json", function(data){setNewPost(data);} );
		
		}else console.log("Did not request Link -> linkId was empty");
	}
	
//gets Info from username and returns JSON object of response
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
		
		let url = "https://walltaker.joi.how/api/users/" + username + ".json";
		
		let tmp = await fetch(url);
		json = await tmp.json();	
		return json;
		
	}
	

var intervalID = null;

//Loops getJson (= get Data from Website)
function UpdateCanvas(){
	getJSON();
	
	intervalID = setTimeout(UpdateCanvas, settings["interval"]);
};






