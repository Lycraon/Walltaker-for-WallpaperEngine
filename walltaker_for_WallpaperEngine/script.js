//Constant variables
const name = "walltaker-wallpaper-engine";
const vNr_str = "v2.5.0";

//all area names
const areas = ["none","top-left","top-center","top-right","bottom-left","bottom-center","bottom-right","canvas"];

//all reactions
const reacts = {
	"":"[]",
	"disgust":"😓",
	"ok":"👍",
	"horny":"😍",
	"came":"💦",
}

const reactions = {
      standard:[
         "I like this one",
         "I don't like this one",
         "That's a nice one!",
		 "I love it!",
         "Great!",
         "Nice",
         "Cute!",
		 "More!",
		 "Thank you!",
		 "Next one please",
		 "YES!",
		 "Please?",
		 "Already had that one"
      ],
	  emojis:[
		"👀",
		"😣",
		"😋",
		"👍",
		"😁",
		"😶",
		"😓",
		"🤨",
		"😖",
		"🙁",
		"🫤",
		"😟",
		"😵‍💫",
		"🥺",
		"😯",
		"🤤",
		"😭",
		"🤯",
		"🙂"
	  ],
      lycraons:[
         ":3",
         "X3",
         ":)",
         ":/",
         ":(",
         "=3"
      ],
	  emoticons:[
	   "°ω°",
	   "^ω^",
	   "0ω0",
	   "0ω*",
	   "ฅ^•ﻌ•^ฅ",
	   "U'ᴥ'U",
	   "(ʋ◕ᴥ◕)",
	   "∪･ω･∪"
	  ],
	  custom: [
		" ",
		" ",
		" ",
		" ",
		" ",
		" "
	  ]
   }

//Settings
var settings = {
	'overrideURL' : "", // Put an Url here to only show this url (must be link to picture/video (static pages on e621))
	'volume' : "1",
	'linkID' : "",
	'api_key' : "",
	'textColor' : "255 255 255",
	'background-color': "0 0 0",
	'background-opacity': "1",
	'fontSize': "100%", //x-small,small, medium, large or px / em / %
	'interval' : "10000", //ms do not run with small numbers(<10000) for long sessions
	'objFit'  : "contain",
	'videocontrols' : "full",
	'loop' : "true",
	'autoplay' : "true",
	'textPos' : "top-left",
	'reactPos': "top-center",
	'reactPacks': [ ], //! only use strings ! !overrides WE settings!
	'showTooltips': "true",
	'showSetterData': "true",
	'listSetterLinks': "true",
	'responsePos': "top-center",
	'setterInfoPos': "bottom-left",
	'maxAreaWidth': "20vw", 
	'zoom_w': "100", //%
	'zoom_h': "100", //%
	'canv_x': "0", //px
	'canv_y': "0", //px
	'scrollSpeed' : "4"
};

//Global variables
var lastUrl = "";
var lastSetBy = "";
var lastResponseType = "";
var lastResponseText = "";
var lastCanvas = "";
var reactPacks = [];

reactPacks.push(settings["ractPacks"]);

var Url = "";
var overrideUpdate = false;
var bOpacity = settings["background-opacity"];
var reloadColors = true;

window.wallpaperPropertyListener = {
     applyUserProperties: function(properties) { 
		var reloadCanvas  = false;
		var realoadSetter = false;
		
		if(properties.vid_volume){
				settings["volume"] = properties.vid_volume.value;
		}
		
			
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
		
		//Setting min possible interval to avoid DOS spamming
		settings["interval"] = Math.min(settings["interval"],8500);
	
		if(properties.objfit){
				settings["objFit"] = properties.objfit.value;		
				reloadCanvas = true;
		}
		
		if(properties.videocontrols){
				settings["videocontrols"] = properties.videocontrols.value;		
		}
		
		if(properties.autoplay) {
			settings["autoplay"] = ""+properties.autoplay.value+"";
		}
		
		if(properties.loop) {
			settings["loop"] = ""+properties.loop.value+"";
		}
	
		if(properties.backg_color) {
			settings["background-color"] = properties.backg_color.value;
			reloadColors = true;
		}
		
		if(properties.text_color) {
			settings["textColor"] = properties.text_color.value;
			reloadColors = true;
		}
	
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
		
		
		if(properties.customreactions){		
			if(properties.customreactions.value == true)
				reactPacks.push("custom");
			else reactPacks = reactPacks.filter(x => x !== "custom");
			reloadCanvas = true;
		}
		
		
		if(properties.standardreactions){
			if(properties.standardreactions.value == true)
				reactPacks.push("standard");
			else reactPacks = reactPacks.filter(x => x !== "standard");
			reloadCanvas = true;
		}
		
		if(properties.lycraonsreactions){
			if(properties.lycraonsreactions.value == true)
				reactPacks.push("lycraons");
			else reactPacks = reactPacks.filter(x => x !== "lycraons");
			reloadCanvas = true;
		}
		
		if(properties.emoticonreactions){
			if(properties.emoticonreactions.value == true)
				reactPacks.push("emoticons");
			else reactPacks = reactPacks.filter(x => x !== "emoticons");
			reloadCanvas = true;
		}
		
		if(properties.emojireactions){
			if(properties.emojireactions.value == true)
				reactPacks.push("emojis");
			else reactPacks = reactPacks.filter(x => x !== "emojis");
			reloadCanvas = true;
		}
		
	
		if(properties.reaction1){
			reactions["custom"][0] = properties.reaction1.value;

			reloadCanvas = true;
		}	
		
		if(properties.reaction2){
			reactions["custom"][1] = properties.reaction2.value;

			reloadCanvas = true;
		}	
			
		if(properties.reaction3){
			reactions["custom"][2] = properties.reaction3.value;

			reloadCanvas = true;
		}	
			
		if(properties.reaction4){
			reactions["custom"][3] = properties.reaction4.value;

			reloadCanvas = true;
		}	
		
		if(properties.reaction5){
			reactions["custom"][4] = properties.reaction5.value;

			reloadCanvas = true;
		}
		
		if(properties.reaction6){
			reactions["custom"][5] = properties.reaction6.value;

			reloadCanvas = true;
		}
		
		if(properties.scrollspeed) {
			settings["scrollSpeed"] = properties.scrollspeed.value;
			console.log("speed:"+settings["scrollSpeed"]);
			reloadCanvas = true;
		}
		
		//-----------------------------------------------------------------------------------------------
		if(settings["overrideURL"]) 
			ChangeSettings();

			
		if(reloadCanvas){
			overrideUpdate = true;
			getJSON();
		}else ChangeSettings();
		
		if(reloadColors){
			ChangeSettings();
		}
		
		if(realoadSetter)
			UpdateSetterInfo(lastSetBy);	
	 }
};

//start Checks for Updates when page loaded
window.onload = function () {
    if(settings["overrideURL"]) setCustomUrl(settings["overrideURL"]);
	else if(!UpdateCanvasRunning)UpdateCanvas();
	
	console.log("window loaded!");
}


function setCustomUrl(url){
	lastUrl = url;
	ChangeSettings();
	console.log("custom url "+settings["overrideURL"]);
	var str = "";
	str += getBgHtml(url);
	
	console.log(str);
	
	$('#canvas').html(str);

	settings["showTooltips"]=false;
	setEvents();
	
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
		
		//bImg
		css+= ".bImg {\n";
		css+= '	background-repeat: no-repeat;\n';
		css+= "	object-fit:"+settings["objFit"]+"!important;\n";
		css+= '	position: absolute;\n';
		
		if(lastUrl){
			css+= '	content:url('+lastUrl+');\n'
		}else css+= '	content:url();\n'
			
		css+= "}\n\n";	
		
		//setting content of dynCSS (style element)
		$('#dynCSS').html(css);
		
		console.log("autoplay:" + (settings["autoplay"] == "true"));
		console.log("loop:" + (settings["loop"] == "true"));
		
		var bVid = document.getElementById("bVid");
		
		bVid.controls = settings["videocontrols"] === "full";
		bVid.defaultMuted  = (settings["volume"] == 0);
		bVid.autoplay = (settings["autoplay"] == "true");
		bVid.loop = (settings["loop"] == "true");
		bVid.load();
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
	if(settings["api_key"].length != 8) return; 
		
	console.log("ractPacks:" + reactPacks.length);
	
	//Reaction Text
	var txt = ""
	if(reactPacks.length>0)
		txt = $('#btn_reactDD_value').html();
	
	console.log('Posting reaction ('+reactType+',"'+txt+'") to Link ' + settings["linkID"] );
		
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


function setNewPost(data){	
	if(settings["overrideURL"]) return;
	//Check for changes if false skip code
	//this is for perfomance (local & network)
	if(!data) return;

	if(lastUrl == data.post_url && data.response_type == lastResponseType && data.response_text == lastResponseText && overrideUpdate != true )
		return;
	
	//set in case override was ture
	overrideUpdate = false;
	console.log("Updating link data!" );
	
	if(data.post_url && data.post_url != ""){
			bOpacity = settings["background-opacity"];
			//bg += getBgHtml(data.post_url);
			
			var filetype = data.post_url.split('.').pop();
			
			SetVisible('#bImg');
			SetHidden('#bVid');
			document.getElementById("bVid").src = data.post_url;
			
			while(document.getElementById("temp"))
				$('#temp').remove();
			
			
			var img = document.createElement("Img");
			img.style.visibility = "hidden";
			img.src = data.post_url;
			img.id="temp";
			
			document.body.appendChild(img);

	}else{
		bOpacity = "0";
		//bg += getBgHtml(null);
		$('#bVid').attr("src", "");
	}
	
	//String variables for areas
	var variables = {
		'top-left': "",
		'top-center': "",
		'top-right': "",
		'bottom-left': "",
		'bottom-center': "",
		'bottom-right': ""
		//'canvas': ""				
	}

	/*
	if(data.username && settings["userPos"] && settings["userPos"] != " " && settings["userPos"] != "none"){
		console.log("fetching user info for " + data.username);
			
		var UserInfo = "";
	
		variables[settings["userPos"]] += UserInfo;
	}*/
	
	//setBy
	if(settings["textPos"] && settings["textPos"] != "none")
		variables[settings["textPos"]] += '<p id="setBy" class="text"></p>';
	
	if(data.set_by){
		console.log("lastSetBy => " + data.set_by);
		lastSetBy = data.set_by;
	} else if(!lastSetBy || lastUrl != data.post_url){
		console.log("new wallpaer without setBy => anon");
		lastSetBy = null;
	}
		
			
	if(settings["showSetterData"] == "true" && settings["setterInfoPos"] && settings["setterInfoPos"] != "none")
		variables[settings["setterInfoPos"]] += '<div id="SetterInfo"></div>';			
	
	//reaction buttons
	if(settings["reactPos"] && settings["reactPos"] != "none")
	if(settings["api_key"].length == 8){
		var react = "";
		var packs = reactPacks;
		
		if(settings["reactPacks"].length>0)
			packs=settings["reactPacks"];
		
		if(packs.length>0){
			react += '<div id="reactDrop">'
			react += '<button type="button" id="btn_reactDD" ><p id="btn_reactDD_value"> </p><p id="btn_reactDD_arrow">⏷</p></button>'; 
			react += '<div id="reactDD">';
			
			react += '<button id="reactDD_scrollBtn_up" class="reactDD_scrollBtn" '
			react +='style="visibility: hidden;"'
			react +='> ▲ </button>';
			
			react += '<div id="reactDD_scroll">';

			react += '<a href="#" class="reactDD_litxt"> </a>';
			
			
			for( const pack of packs){
				var packTexts = reactions[pack];
				
				if(packTexts)
				for(const packText of packTexts){
					
					if(packText.trim() != "")
						react += '<a href="#" class="reactDD_litxt">'+packText+'</a>';
				}
			}

			react += '</div>'; //reactDD_scroll
			
			react += '<button id="reactDD_scrollBtn_down" class="reactDD_scrollBtn" '
			react +='style="visibility: hidden;"'
			react +='> ▼ </button>';
			
			react += '</div>';
			react += '</div>';
		}
		react += '<p class="spacer"></p>';
		
		react += '<div id="buttons">'; //-----------------------------
		
		react += GetReactionButton('btn_hate','😓','tt_hate','Hate it' );
		react += GetReactionButton('btn_ok'  ,'👍','tt_ok'  ,'Thanks'  );
		react += GetReactionButton('btn_love','😍','tt_love','Love it!');
		react += GetReactionButton('btn_cum' ,'💦','tt_came','I came'  );
		
		react += '</div>';//------------------------------------------
		
		react += '</form>';
		react += '<p class="spacer"></p>';
		
				
		variables[settings["reactPos"]] += react;
	}

	//current response to link
	if(settings["responsePos"] && settings["responsePos"] != "none"){
		var response = '<p id="reactText" class="text" height="auto" margin="0" text->';
		
		if(data.response_type && reacts[data.response_type])
			response += reacts[data.response_type];
		
		if(data.response_type && reacts[data.response_type] && data.response_text)
			response += ": ";
		
		if(data.response_text)
			response += data.response_text;
	
		response+=' </p>';
		
		variables[settings["responsePos"]] += response;
	}
	
	//post Image
	var bg = "";
	
	//variables["canvas"] += bg;
	
	//sets the html for each area with the coresponding variables
	areas.forEach( (ar,index) => {
		var name = ar;
		if(index >0)
			$("#"+name).html(variables[name]);	
	});
	
	//Event functions 
	setEvents();
	
	//sets current dat for next check
	lastUrl = data.post_url;
				
	lastResponseType = data.response_type;
	lastResponseText = data.response_text;
	
	//calls ChangeSettings to update css / style 
	ChangeSettings();
	
	//Get infos of setter
	UpdateSetterInfo(data.set_by);

}

function GetReactionButton(id,emoji,ttId,tooltip){
	var html = "";
	
	html += '<button type="button" id="'+id+'" >' + emoji
	html += '<p id="'+ttId+'" class="tooltipItem">'+tooltip+'</p>';
	html +='</button>';
	
	return html;
}

function getBgHtml(url){
	var bg = "";
	bg += '<Img id="bImg" class="bImg" />';
	bg += '<video id="bVid" src="'+url+'" class="bImg" style="visibility: hidden;" autoplay loop >Video error </video>';
	
	return bg;
}

function setEvents(){
	jQuery( document ).ready(function($) {
	
		/*
		$("#bImg").on('load',function (){
			console.log("test");
			elem.style.visibility = "visible";
		});*/
		
		
		document.getElementById("bVid").volume = 0;
		$('#bVid').on("loadeddata",function(){
			SetVisible('#bVid');
			SetHidden('#bImg');
			
			document.getElementById("bVid").volume = settings["volume"];
			//if(settings["autoplay"] == "true")
				//elVid.play();
		});
		
		$('#bVid').click(function() {
			
			if(settings["videocontrols"] === "noUI")
			this.paused ? this.play() : this.pause();
		});
	
		$('#btn_reactDD').click(function() {
							
			if( $('#reactDD').css("visibility") == "hidden"){
				SetVisible('#reactDD');
				HandleDDScrollBtns();
			}else {
				SetHidden('#reactDD');
				HideDDScrollbtns();
			}
		});
		
		
			/*
		document.getElementById("reactDD_scroll");
		if(elem)
		elem.addEventListener("mouseenter",function(){
			document.getElementById("reactDD_scroll").focus();	
			console.log("focus dd scroll");
		});*/
		
		$('.reactDD_litxt').each(function(){
			this.addEventListener("click",function(event){
				$("#btn_reactDD_value").html(this.innerHTML);
				SetHidden('#reactDD');
				HideDDScrollbtns();
			});
		});
		
		$('#reactDD_scroll').scroll(function() {
			HandleDDScrollBtns();
		});
		
		var dd_scroll = document.getElementById("reactDD_scroll");
		
		var loopUp = null;
		$('#reactDD_scrollBtn_up').hover(function(){
			
			loopUp = setInterval(function() {
				dd_scroll.scrollBy(0,-settings["scrollSpeed"]);
			},10);	
		}, function(){
			clearInterval(loopUp);
		});
		
		var loopDown = null;
		$('#reactDD_scrollBtn_down').hover(function(){
			loopDown = setInterval(function() {
				dd_scroll.scrollBy(0,settings["scrollSpeed"]);
			},10);	
		}, function(){
			clearInterval(loopDown);
		});

		if(settings["reactPos"] && settings["reactPos"] != "none")
		if(settings["api_key"].length == 8){
			
			//hate
			$('#btn_hate').click(function() { postReaction("disgust");});
			HandleTooltip('#btn_hate','#tt_hate');
			
			//ok
			$('#btn_ok').click(function() {postReaction("ok")});
			HandleTooltip('#btn_ok','#tt_ok');
			
			//love
			$('#btn_love').click(function() {postReaction("horny")});
			HandleTooltip('#btn_love','#tt_love');
			
			//cum
			$('#btn_cum').click(function() {postReaction("came")});
			HandleTooltip('#btn_cum','#tt_came');
		}
	});
}

function SetVisibility(jqItemName, state){
	$(jqItemName).css("visibility",state);
}

function SetVisible(jqItemName){ SetVisibility(jqItemName,'visible'); }
function SetHidden(jqItemName){ SetVisibility(jqItemName,'hidden'); }
function SetCollapsed(jqItemName){ SetVisibility(jqItemName,'collapse'); }

function HandleTooltip(jqItemName, jqToolTipName){
	if(settings["showTooltips"]){
				$(jqItemName).mouseenter(function(){SetVisible(jqToolTipName);});
				$(jqItemName).mouseleave(function(){SetCollapsed(jqToolTipName);});
	}
}


function HideDDScrollbtns(){
	SetHidden('#reactDD_scrollBtn_up');
	SetHidden('#reactDD_scrollBtn_down');
}

function HandleDDScrollBtns(){
	var dd_scroll = document.getElementById("reactDD_scroll");
	if(dd_scroll.scrollTop == 0)
		SetHidden('#reactDD_scrollBtn_up');
	else
		SetVisible('#reactDD_scrollBtn_up');
	
	var scrollBottom = dd_scroll.scrollHeight - dd_scroll.scrollTop - dd_scroll.clientHeight;
	if(scrollBottom < 1)
		SetHidden('#reactDD_scrollBtn_down');
	else
		SetVisible('#reactDD_scrollBtn_down');
}


function toggleAttribute(elem,attName,value){
	if (elem.hasAttribute(attName)) {
		elem.removeAttribute(attName)   
	} else {
		elem.setAttribute(attName,value)   
	}
}

LoopSetterUpdate();

function LoopSetterUpdate(){
	if(!settings["overrideURL"]){
		console.log("refreshing last Setter ");
		UpdateSetterInfo(lastSetBy);
	}
	
	setTimeout(LoopSetterUpdate, settings["interval"]);
};

async function UpdateSetterInfo(username){
	console.log("Updating Setter Info of " + username)
	if(settings["showSetterData"] !== "true")	{ return; }
	
	var friend = '';
	var name   = '';
	var online = '';
	
	if(username){
		var userData = await getUserInfo(username);
	
		//online and friend status
		if(userData){
			if(userData.friend)
				friend = '♥️ ';
			
			name = userData.self ? 'you' : username;
			
			if(userData.online)
				online = ' 🟢'
		}
	} else { name = 'anon'; }
		
	$("#setBy").html(`👤set_by: ${friend}${name}${online}`);
	
	//info of links
	if(settings["setterInfoPos"] && settings["setterInfoPos"] != "none")
	if(userData && userData.links){	
		var elInfo = $("<p class='text'></p>");
		$(elInfo).html(`Links: ${userData.links.length}`);

		$('#SetterInfo').html("").append(elInfo);
		
		//list of links
		if(settings["listSetterLinks"] == "true" ){
			for(const ulink of userData.links){
						
				var symbol = '';
				if(ulink.response_type && reacts[ulink.response_type])
					symbol = reacts[ulink.response_type];
				
				var response = '';
				if(ulink.response_text)
					response =  ulink.response_text
				
				var elLink = $("<p class='text'></p>");
				$(elLink).html(` ➔ [${ulink.id}] last Response:${symbol} ${response}\n`);
				$('#SetterInfo').append(elLink);
			}			 
		}
	}
}

//gets json from website
//on sucess: calls function setNewPost() (updates background + infos)
function getJSON(){
	if(settings["linkID"]){
		SetHidden("#rcenter-center");
		
		$.ajaxSetup({
		   xhrFields: { /*withCredentials:true*/ },
		   crossDomain: true,
		   beforeSend:  function(request) {
				request.setRequestHeader("Wallpaper-Engine-Client", vNr_str);
				console.log("fetching link " + settings["linkID"] );
			} 
	});
	
	$.getJSON("https://walltaker.joi.how/api/links/" + settings["linkID"] + ".json", function(data){setNewPost(data);} )
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('getJSON returned error');
			$('#centerMessage').html('Server returned ' + textStatus +  ': ' + errorThrown + '! <br> Check your internet connection and link number!');
			SetVisible('#rcenter-center');
		});
	
	}else{ 
		console.log("Did not request Link -> linkId was empty");
		SetVisible("#rcenter-center");
	};
}
	
//gets Info from username and returns JSON object of response
async function getUserInfo(username){
	
	$.ajaxSetup({
	   xhrFields: { /*withCredentials:true*/ },
	   crossDomain: true,
	   beforeSend:  function(request) {
			request.setRequestHeader("Wallpaper-Engine-Client", vNr_str);
			console.log("fetching UserInfo of " + username);
		} 
	});
	
	var query = '';
	if(settings["api_key"].length == 8)
		query = "?api_key="+settings["api_key"];
		
	let url = `https://walltaker.joi.how/api/users/${username}.json${query}`;
	
	
	
	let tmp  = await fetch(url);
	var json = await tmp.json();	
	return json;	
}
	

var intervalID = null;

//Loops getJson (= get Data from Website)
var UpdateCanvasRunning = false;
function UpdateCanvas(){
	UpdateCanvasRunning = true;
	if(!settings["overrideURL"])
		getJSON();
	else UpdateCanvasRunning = false;
	
	intervalID = setTimeout(UpdateCanvas, settings["interval"]);
};
