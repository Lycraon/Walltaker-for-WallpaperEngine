//Constant variables
const name = "walltaker-wallpaper-engine";
const vNr_str = "v0.1.0";

//all area names
const areas = ["none","top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","canvas"];

//all reactions
const reacts = {
	"":"[]",
	"disgust":"😓",
	"horny":"😍",
	"came":"💦",
}

//Settings
var settings = {
	'overrideURL' : "", // Put an Url here to only show this url (must be link to picture/video (static pages on e621))
	'linkID' : "",
	'api_key' : "",
	'textColor' : "255 255 255",
	'background-color': "0 0 0",
	'background-opacity': "1",
	'fontSize': "100%", //x-small,small, medium, large or px / em / %
	'interval' : "10000", //ms do not run with small numbers(<1000) for long sessions
	'objFit'  : "contain",
	'textPos' : "top-left",
	'reactPos': "top-center",
	'showTooltips': "true",
	'showSetterData': "true",
	'listSetterLinks': "true",
	'responsePos': "top-center",
	'setterInfoPos': "bottom-left",
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
		var reloadCanvas = false;
		var realoadSetter = false;
	 
		if(properties.linkID){
				settings["linkID"] = properties.linkID.value;
				lastUrl = "";
				getJSON();
		}
			
		if(properties.api_key){
			settings["api_key"] = properties.api_key.value;
			
			if(!settings["api_key"].length == 8){
			settings["reactPos"] = "none";
			settings["responsePos"] = "none";
			}
			reloadCanvas = true;
			
		}
	 
		if(properties.interval)
		settings["interval"] = parseInt(properties.interval.value) *1000;
	
		if(properties.objfit){
				settings["objFit"] = properties.objfit.value;		
				reloadCanvas = true;
		}
	
		if(properties.backg_color)
		settings["background-color"] = properties.backg_color.value;
		
		if(properties.text_color)
		settings["textColor"] = properties.text_color.value;
	
		if(properties.area_maxWidth)
		settings["maxAreaWidth"] = properties.area_maxWidth.value + "vw";
		
		if(properties.font_size)
		settings["fontSize"] = properties.font_size.value;
	
		if(properties.set_by){
		settings["textPos"]	= properties.set_by.value;
		reloadCanvas = true;
		}
		
		if(properties.setterData){
			settings["showSetterData"]	= ""+properties.setterData.value+"";
			reloadCanvas = true;
		}
		
	
		if(properties.setterLinks){
		settings["listSetterLinks"]	= ""+properties.setterLinks.value+"";
		realoadSetter = true;
		}
		
		if(properties.setterInfo){
		settings["setterInfoPos"]	= properties.setterInfo.value;
		reloadCanvas = true;
		}
			
		if(properties.reaction){
		settings["reactPos"]	= properties.reaction.value;
		settings["responsePos"]	= properties.reaction.value;
		reloadCanvas = true;
		}
		
		if(properties.zoom_w)
		settings["zoom_w"] = properties.zoom_w.value;			
		
		if(properties.zoom_h)
		settings["zoom_h"] = properties.zoom_h.value;	
		
		if(properties.canv_x)
		settings["canv_x"] = properties.canv_x.value;		
			
		if(properties.canv_y)
		settings["canv_y"] = properties.canv_y.value;	
		
		if(reloadCanvas){
			overrideUpdate = true;
			getJSON();
		}else ChangeSettings();
		
		if(realoadSetter)
		UpdateSetterInfo(lastSetBy);			
	 }
};

//start Checks for Updates
if(settings["overrideURL"]) setCustomUrl(settings["overrideURL"]);
else UpdateCanvas();


function setCustomUrl(url){
	console.log("custom url "+settings["overrideURL"]);
	var str = "";
	str += '<Img id="bImg" class="bImg" src="'+url+'"/>';
	str += '<video id="bVid" class="bImg" src="'+url+'"/ autoplay loop></video>';
	
	console.log(str);
	
	var el = document.createElement("div");
	el.id="canvas";
	document.body.appendChild(el);
	$("#canvas").html(str);	
	
	
	var elem = document.getElementById("bImg");
	elem.addEventListener("load",function(){document.getElementById("bImg").style.visibility = "visible";ChangeSettings();});
	
	elem = document.getElementById("bVid");
	elem.addEventListener("loadeddata",function(){document.getElementById("bVid").style.visibility = "visible";ChangeSettings();});
	ChangeSettings();
}

//changes Settings mostly CSS stuff
 function ChangeSettings() {
		var color = settings["background-color"]+" "+ bOpacity;
		var css = "";
		
		//*
		css+= "* {\n";
		css+= "	font-size: " + settings["fontSize"] + ";\n";
		css+= "}\n\n";
	
		//body
		css+= "body {\n";
		css+= "	background-color: " + GetRGBColor(color) + "!important;\n";
		css+= "}\n\n";
		
		//.areas
		css+= ".area{\n";
		css+= '	max-width: '+settings["maxAreaWidth"]+';\n'
		css+= "}\n\n";
		
		//.texts
		css+= ".text{\n";
		css+= "	color:"+GetRGBColor(settings["textColor"])+";\n";
		css+= "}\n\n";
		
		//#canvas
		css+= "#canvas {\n";
		css+= "	width: "+settings["zoom_w"]+"% !important;\n"
		css+= "	height: "+settings["zoom_h"]+"% !important;\n"
		css+= "	margin-top: "+settings["canv_y"]+"% !important;\n"
		css+= "	margin-left: "+settings["canv_x"]+"% !important;\n"
		css+= "}\n\n";
		
		//#bImg
		css+= ".bImg {\n";
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
	if(settings["api_key"].length == 8){
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
			success: function(data){overrideUpdate=true;setNewPost(data);},
			failure: function(errMsg) {}
		});
	}
}


function setNewPost(data){
			if(settings["overrideURL"]) return;
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
				if(settings["textPos"] && settings["textPos"] != "none")
				if(data.set_by){
					var setBy = '<p id="setBy" class="text">👤set_by: '+ data.set_by +'</p>';
					variables[settings["textPos"]] += setBy;
					lastSetBy = data.set_by;	
					
				
				}else 
				if(settings["textPos"] && settings["textPos"] != "none")
				if(lastSetBy && lastUrl == data.post_url){
					var setBy = '<p id="setBy" class="text">👤set_by: '+ lastSetBy +'</p>';
				
					variables[settings["textPos"]] += setBy;
				}else lastSetBy = null;
					
				if(settings["showSetterData"] == "true" && settings["setterInfoPos"] && settings["setterInfoPos"] != "none")
				variables[settings["setterInfoPos"]] += '<div id="SetterInfo"></div>';
				
				//reaction buttons
				if(settings["reactPos"] && settings["reactPos"] != "none")
				if(settings["api_key"].length == 8){
					var react = '<div id="buttons">';
					react += '<button type="button" id="btn_hate" >😓</button>';
					react += '<button type="button" id="btn_love" >😍</button>'; 
					react += '<button type="button" id="btn_cum"  >💦</button>'; 
					react += '</div>';
					
					if(settings["showTooltips"] == "true"){
					react += '<div id="btn_tooltips" class="tooltipBar">';
					react += '<p id="tt_hate">Hate it</p>';
					react += '<p id="tt_love">Love it</p>';
					react += '<p id="tt_came">I came</p>';					
					react += '</div>';
					react += '<p class="spacer"></p>'
					}
							
					variables[settings["reactPos"]] += react;
				}

				//current response to link
				if(settings["responsePos"] && settings["responsePos"] != "none"){
					var response = '<p class="text" height="auto" margin="0" text->';
					
					if(data.response_type)
					response += reacts[data.response_type];
					
					if(data.response_text)
					response += ": "+ data.response_text;
				
					response+=' </p>';
					
					variables[settings["responsePos"]] += response;
				}
				
				//post Image
				if(data.post_url && data.post_url != ""){
						bOpacity = settings["background-opacity"];
						variables["canvas"] += '<Img id="bImg" class="bImg" src="'+data.post_url+'"/>';
						variables["canvas"] += '<video id="bVid" class="bImg" src="'+data.post_url+'"/ autoplay loop></video>';
						
					
				}else bOpacity = "0";
				
				
				//sets the html for each area with the coresponding variables
				areas.forEach( (ar,index) => {
					var name = ar;
						if(index >0){

						$("#"+name).html(variables[name]);	
						
						
					}
				});
				
				//Event functions 
				var elem = document.getElementById("bImg");
				elem.addEventListener("load",function(){document.getElementById("bImg").style.visibility = "visible";});
				
				elem = document.getElementById("bVid");
				elem.addEventListener("loadeddata",function(){document.getElementById("bVid").style.visibility = "visible";});
				
				if(settings["reactPos"] && settings["reactPos"] != "none")
				if(settings["api_key"].length == 8){
					elem = document.getElementById("btn_hate");
					elem.addEventListener("click",function(){postReaction("disgust")});
					if(settings["showTooltips"]){
					elem.addEventListener("mouseenter",function(){document.getElementById("tt_hate").style.visibility = "visible";});
					elem.addEventListener("mouseleave",function(){document.getElementById("tt_hate").style.visibility = "collapse";});
					}
					
					elem = document.getElementById("btn_love");
					elem.addEventListener("click",function(){postReaction("horny")});
					if(settings["showTooltips"]){
					elem.addEventListener("mouseenter",function(){document.getElementById("tt_love").style.visibility = "visible";});
					elem.addEventListener("mouseleave",function(){document.getElementById("tt_love").style.visibility = "collapse";});
					}
					
					elem = document.getElementById("btn_cum");
					elem.addEventListener("click",function(){postReaction("came")});
					if(settings["showTooltips"]){
					elem.addEventListener("mouseenter",function(){document.getElementById("tt_came").style.visibility = "visible";});
					elem.addEventListener("mouseleave",function(){document.getElementById("tt_came").style.visibility = "collapse";});
					}
					
				}
				
				//sets current dat for next check
				lastUrl = data.post_url;
							
				lastResponseType = data.response_type;
				lastResponseText = data.response_text;
				
				//calls ChangeSettings to update css / style 
				ChangeSettings();
				
				//Get infos of setter
				UpdateSetterInfo(data.set_by);
					
			}
}

LoopSetterUpdate();

function LoopSetterUpdate(){
	if(!settings["overrideURL"])
	UpdateSetterInfo(lastSetBy);
	
	setTimeout(LoopSetterUpdate, settings["interval"]);
};

async function UpdateSetterInfo(username){
	console.log("Updating Setter Info of " + username)
	if(username && settings["showSetterData"] == "true")	{
						var userData = await getUserInfo(username);
						
						//online and friend status
						if(userData){
							var setBy = '👤set_by: ';
							if(userData.friend)
							setBy += '♥️ ';
						
							
							
							if(userData.self)
							setBy += "you ";	
							else
							setBy += username;						
							if(userData.online){
								setBy += ' 🟢';
							}
							
							$("#setBy").html(setBy);
							
							//info of links
							if(settings["setterInfoPos"] && settings["setterInfoPos"] != "none")
							if(userData.links){

							
								var elInfo = document.createElement("p");
								elInfo.classList.add('text');
								var strInfo = 'Links: ' + userData.links.length;
								elInfo.innerHTML = strInfo;
								
								document.getElementById("SetterInfo").innerHTML = "";
								document.getElementById("SetterInfo").appendChild(elInfo);
								//list of links
								if(settings["listSetterLinks"] == "true" ){
									for(var i=0;i< userData.links.length;i++){
										var elLink = document.createElement("p");
										elLink.classList.add('text');
										elLink.style.paddingTop = "0";
										
										var linkInfo = "";
										if(userData.links[i]){
										
										linkInfo += " ➔ [";
										
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
										document.getElementById("SetterInfo").appendChild(elLink);
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
		
		if(settings["api_key"].length == 8)
		url += "?api_key="+settings["api_key"];
		
		let tmp = await fetch(url);
		json = await tmp.json();	
		return json;
		
	}
	

var intervalID = null;

//Loops getJson (= get Data from Website)
function UpdateCanvas(){
	if(!settings["overrideURL"])
	getJSON();
	
	intervalID = setTimeout(UpdateCanvas, settings["interval"]);
};






