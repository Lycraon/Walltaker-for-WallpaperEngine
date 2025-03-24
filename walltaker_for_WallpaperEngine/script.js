/*jshint esversion: 8 */

//Constant variables
const cNameLong = "walltaker-wallpaper-engine";
const cName = "Wallpaper-Engine-Client";
const vNr = "v2.5.1";

//all area names
const areaNames = {
	na: "none",
	topL: "top-left",
	topC: "top-center",
	topR: "top-right",
	botL: "bottom-left",
	botC: "bottom-center",
	botR: "bottom-right",
	cc: "canvas"
};
const areas = Object.keys(areaNames).map(key => areaNames[key]);

//all reactions
const reacts = {
	"": "[]",
	"disgust": "😓",
	"ok": "👍",
	"horny": "😍",
	"came": "💦",
};

const reactButttons = [{
		id: 'btn_hate',
		elem: 'tt_hate',
		txt: 'Hate it',
		reactID: 'disgust'
	}, {
		id: 'btn_ok',
		elem: 'tt_ok',
		txt: 'Thanks',
		reactID: 'ok'
	}, {
		id: 'btn_love',
		elem: 'tt_love',
		txt: 'Love it',
		reactID: 'horny'
	}, {
		id: 'btn_cum',
		elem: 'tt_came',
		txt: 'I came',
		reactID: 'came'
	},
];

const packWeights = {
	custom: 100
}

const reactions = {
	standard: [
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
	emojis: [
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
	lycraons: [
		":3",
		"X3",
		":)",
		":/",
		":(",
		"=3"
	],
	emoticons: [
		"°ω°",
		"^ω^",
		"0ω0",
		"0ω*",
		"ฅ^•ﻌ•^ฅ",
		"U'ᴥ'U",
		"(ʋ◕ᴥ◕)",
		"∪･ω･∪",
		"<~<",
		">///<"
	],
	custom: [
		" ",
		" ",
		" ",
		" ",
		" ",
		" "
	]
};

//Settings
var settings = {
	'overrideURL': "", // Put an Url here to only show this url (must be link to picture/video (static pages on e621))
	'volume': "1",
	'linkID': "",
	'api_key': "",
	'textColor': "255 255 255",
	'background_color': "0 0 0",
	'background_opacity': "1",
	'fontSize': "100%", //x-small,small, medium, large or px / em / %
	'interval': "10000", //ms do not run with small numbers(<10000) for long sessions
	'objFit': "contain",
	'videocontrols': "full",
	'loop': "true",
	'autoplay': "true",
	'textPos': areaNames.topL,
	'reactPos': areaNames.topC,
	'reactPacks': [], //! only use strings ! !overrides WE settings!
	'showTooltips': "true",
	'showSetterData': "true",
	'listSetterLinks': "true",
	'responsePos': areaNames.topC,
	'setterInfoPos': areaNames.botL,
	'maxAreaWidth': "20vw",
	'zoom_w': "100", //%
	'zoom_h': "100", //%
	'canv_x': "0", //px
	'canv_y': "0", //px
	'scrollSpeed': "4",
	'e6_Pos': areaNames.topL,
	'e6_user': "",
	'e6_api': ""
};

//Global variables
var lastUrl = "";
var lastSetBy = "";
var lastResponseType = "";
var lastResponseText = "";
var lastCanvas = "";
var reactPacks = [];
reactPacks.push(settings.reactPacks);

var Url = "";
var overrideUpdate = false;
var bOpacity = settings.background_opacity;
var reloadColors = true;

window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		var realoadSetter = false;
		var reloadCanvas = false;

		console.log("loading properties");

		if (properties.vid_volume)
			settings.volume = properties.vid_volume.value;

		if (properties.linkID)
			SetLinkId(properties.linkID.value);

		if (properties.api_key)
			if (SetApiKey(properties.api_key.value)) {
				reloadCanvas = true;
			}

		SetIntervalSeconds(settings.interval);

		if (properties.interval)
			SetIntervalSeconds(parseInt(properties.interval.value));

		if (properties.objfit) {
			settings.objFit = properties.objfit.value;
			reloadCanvas = true;
		}

		if (properties.videocontrols) {
			settings.videocontrols = properties.videocontrols.value;
		}

		if (properties.autoplay) {
			settings.autoplay = "" + properties.autoplay.value + "";
		}

		if (properties.loop) {
			settings.loop = "" + properties.loop.value + "";
		}

		if (properties.backg_color) {
			settings.background_color = properties.backg_color.value;
			reloadColors = true;
		}

		if (properties.text_color) {
			settings.textColor = properties.text_color.value;
			reloadColors = true;
		}

		if (properties.area_maxWidth)
			settings.maxAreaWidth = properties.area_maxWidth.value + "vw";

		if (properties.font_size)
			settings.fontSize = properties.font_size.value;

		if (properties.set_by) {
			settings.textPos = properties.set_by.value;
			reloadCanvas = true;
		}

		if (properties.setterData) {
			settings.showSetterData = "" + properties.setterData.value + "";
			reloadCanvas = true;
		}

		if (properties.setterLinks) {
			settings.listSetterLinks = "" + properties.setterLinks.value + "";
			realoadSetter = true;
		}

		if (properties.setterInfo) {
			settings.setterInfoPos = properties.setterInfo.value;
			reloadCanvas = true;
		}

		if (properties.reaction) {
			settings.reactPos = properties.reaction.value;
			settings.responsePos = properties.reaction.value;
			reloadCanvas = true;
		}

		if (properties.zoom_w)
			settings.zoom_w = properties.zoom_w.value;

		if (properties.zoom_h)
			settings.zoom_h = properties.zoom_h.value;

		if (properties.canv_x)
			settings.canv_x = properties.canv_x.value;

		if (properties.canv_y)
			settings.canv_y = properties.canv_y.value;

		var packs = [];

		if (properties.customreactions)
			packs.push("custom");

		if (properties.standardreactions)
			packs.push("standard");

		if (properties.lycraonsreactions)
			packs.push("lycraons");

		if (properties.emoticonreactions)
			packs.push("emoticons");

		if (properties.emojireactions)
			packs.push("emojis");

		console.log(packs.toString());

		if (SetReactionpacks(packs))
			reloadCanvas = true;

		var customReactions = [];

		if (properties.reaction1)
			customReactions.push(properties.reaction1.value);

		if (properties.reaction2)
			customReactions.push(properties.reaction2.value);

		if (properties.reaction3)
			customReactions.push(properties.reaction3.value);

		if (properties.reaction4)
			customReactions.push(properties.reaction4.value);

		if (properties.reaction5)
			customReactions.push(properties.reaction5.value);

		if (properties.reaction6)
			customReactions.push(properties.reaction6.value);

		if (customReactions != reactions.customReactions) {
			console.log(customReactions);
			reactions.custom = customReactions;
			reloadCanvas = true;
		}

		if (properties.scrollspeed) {
			settings.scrollSpeed = properties.scrollspeed.value;
			console.log("speed:" + settings.scrollSpeed);
			reloadCanvas = true;
		}
		
		if(properties.e6_name){
			settings.e6_user = "" + properties.e6_name.value;
			reloadCanvas = true;
		}
		
		if(properties.e6_api){
			settings.e6_api = "" + properties.e6_api.value;
			reloadCanvas = true;
		}

		//-----------------------------------------------------------------------------------------------
		if (settings.overrideURL)
			ChangeSettings();

		if (reloadCanvas) {
			overrideUpdate = true;
			getJSON();
		} else
			ChangeSettings();

		if (reloadColors) {
			ChangeSettings();
		}

		if (realoadSetter)
			UpdateSetterInfo(lastSetBy);
	}
};

function SetLinkId(linkID) {
	if (!linkID) {
		return;
	}
	settings.linkID = linkID;
	lastUrl = "";
	getJSON();
}

function SetApiKey(apiKey) {
	if (!apiKey) {
		return false;
	}
	settings.api_key = apiKey;
	if (settings.api_key.length !== 8) {
		settings.reactPos = areaNames.na;
		settings.responsePos = areaNames.na;
	}
	return true;
}

function SetIntervalSeconds(interval) {
	//Setting min possible interval to avoid DOS spamming
	settings.interval = Math.min(parseInt(interval) * 1000, 8500);
}

function SetReactionpacks(packs) {
	var oldPacks = [...reactPacks];

	var arr = Object.keys(reactions).sort((a, b) => {
		var z1 = packWeights[b] ?? 0;
		var z2 = packWeights[a] ?? 0;
		return z1 - z2;
	})

		arr.forEach(pack => {
			if (packs.includes(pack))
				reactPacks.push(pack);
			else
				reackPacks = reackPacks.filter(x => x !== pack);

		});
	return oldPacks != reactPacks;
}

//start Checks for Updates when page loaded
window.onload = function () {
	if (settings.overrideURL)
		setCustomUrl(settings.overrideURL);
	else if (!UpdateCanvasRunning)
		UpdateCanvas();

	console.log("window loaded!");
};

function setCustomUrl(url) {
	lastUrl = url;
	ChangeSettings();
	console.log("custom url " + settings.overrideURL);
	var str = getBgHtml(url);

	console.log(str);
	$('#canvas').html(str);

	settings.showTooltips = false;
	setEvents();

	ChangeSettings();
}

//changes Settings mostly CSS stuff
function ChangeSettings() {
	var color = settings.background_color + " " + bOpacity;

	let css = `
		* {
			font-size: ${settings.fontSize};
		}
		body {
			background-color: ${GetRGBColor(color)} !important;
		}
		.area {
			max-width: ${settings.maxAreaWidth};
		}
		.text {
			color: ${GetRGBColor(settings.textColor)};
		}
		#canvas {
			width: ${settings.zoom_w}% !important;
			height: ${settings.zoom_h}% !important;
			margin-top: ${settings.canv_y}% !important;
			margin-left: ${settings.canv_x}% !important;
		}
		.bImg {
			background-repeat: no-repeat;
			object-fit: ${settings.objFit} !important;
			position: absolute;
			content: url(${lastUrl || ''});
		}
	`;

	//setting content of dynCSS (style element)
	$('#dynCSS').html(css);

	console.log("autoplay:" + (settings.autoplay == "true"));
	console.log("loop:" + (settings.loop == "true"));

	var bVid = document.getElementById("bVid");
	SetVideoSettings(bVid);

}

function SetVideoSettings(bVid) {
	bVid.controls = settings.videocontrols === "full";
	bVid.defaultMuted = (settings.volume == 0);
	bVid.autoplay = (settings.autoplay == "true");
	bVid.loop = (settings.loop == "true");
	bVid.load();
}

//takes WallpaperEngine color string and converts it into (usable) rgb/rgba format
function GetRGBColor(customColor) {
	//split string into values
	var temp = customColor.split(' ');
	var rgb = temp.slice(0, 3);

	//cap rgb values at 255
	rgb = rgb.map(function _cap(c) {
		return Math.ceil(c * 255);
	});

	var customColorAsCSS = "";

	//length is 3 for rgb values
	if (temp.length > 3)
		customColorAsCSS = 'rgba(' + rgb + ',' + temp[3] + ')';
	else
		customColorAsCSS = 'rgb(' + rgb + ')';

	return customColorAsCSS;
}

//sends POST to Website and passes data to setNewPost
function postReaction(reactType) {
	if (settings.api_key.length !== 8)
		return;

	console.log("ractPacks:" + reactPacks.length);

	//Reaction Text
	const txt = reactPacks.length > 0 ? $('#btn_reactDD_value').html() : "";
	console.log('Posting reaction (' + reactType + ',"' + txt + '") to Link ' + settings.linkID);

	//POST
	$.ajax({
		type: "POST",
		url: "https://walltaker.joi.how/api/links/" + settings.linkID + "/response.json",
		data: JSON.stringify({
			"api_key": settings.api_key,
			"type": "" + reactType + "",
			"text": txt
		}),
		dataType: "json",
		contentType: "application/json",
		success: function (data) {
			overrideUpdate = true;
			setNewPost(data);
		},
		failure: function (errMsg) {
			console.error(`Failed to post reaction: ${errMsg}`);
		}
	});
}

function UpdatePostUrl(url){
	if (url && url !== "") {
		bOpacity = settings.background_opacity;
		//bg += getBgHtml(data.post_url);

		var filetype = url.split('.').pop();

		SetVisible('#bImg');
		SetHidden('#bVid');
		document.getElementById("bVid").src = url;

		while (document.getElementById("temp"))
			$('#temp').remove();

		var img = document.createElement("Img");
		img.style.visibility = "hidden";
		img.src = url;
		img.id = "temp";

		document.body.appendChild(img);

	} else {
		bOpacity = "0";
		//bg += getBgHtml(null);
		$('#bVid').attr("src", "");
	}
}

function NewPost_ProcessSetBy(variables,data){
	if (settings.textPos && settings.textPos != areaNames.na)
		variables[settings.textPos] += '<p id="setBy" class="text"></p>';

	if (data.set_by) {
		console.log("lastSetBy => " + data.set_by);
		lastSetBy = data.set_by;
	} else if (!lastSetBy || lastUrl != data.post_url) {
		console.log("new wallpaer without setBy => anon");
		lastSetBy = null;
	}
}

function NewPost_ProcessSetterData(variables){
	if (settings.showSetterData !== "true" || !settings.setterInfoPos || settings.setterInfoPos == areaNames.na){ return;}
	
	variables[settings.setterInfoPos] += '<div id="SetterInfo"></div>';
}

function NewPost_ProcessReactionButtons(variables){
	if (settings.reactPos && settings.reactPos != areaNames.na)
	if (!CheckApiKey()) { return;}
		
	var packs = reactPacks;

	if (settings.reactPacks.length > 0)
		packs = settings.reactPacks;

	var react = "";
	react += '<form>';
	react += buildReactDrop(packs);
	react += '<p class="spacer"></p>';
	react += buildReactButtons();
	react += '</form>';
	react += '<p class="spacer"></p>';

	variables[settings.reactPos] += react;
}

function buildReactButtons() {
	var react = "";
	react += '<div id="buttons">'; 

	reactButttons.forEach(btn => {
		react += GetReactionButton(btn.id, reacts[btn.reactID], btn.elem, btn.txt);
	});
	
	react += '</div>'; 
	return react;
}

function buildReactDrop(packs){
	if (packs.length == 0) { return; }
	var react = "";
	react += '<div id="reactDrop">';
		react += '<button type="button" id="btn_reactDD" ><p id="btn_reactDD_value"> </p><p id="btn_reactDD_arrow">⏷</p></button>';
		react += '<div id="reactDD">';

		react += '<button id="reactDD_scrollBtn_up" class="reactDD_scrollBtn" ';
		react += 'style="visibility: hidden;"';
		react += '> ▲ </button>';

		react += '<div id="reactDD_scroll">';

			react += '<a href="#" class="reactDD_litxt"> </a>';

			for (const pack of packs) {
				var packTexts = reactions[pack];

				if (packTexts)
				for (const packText of packTexts) {

					if (packText.trim() > "")
						react += '<a href="#" class="reactDD_litxt">' + packText + '</a>';
				}
			}

			react += '</div>'; //reactDD_scroll

		react += '<button id="reactDD_scrollBtn_down" class="reactDD_scrollBtn" ';
		react += 'style="visibility: hidden;"';
		react += '> ▼ </button>';

		react += '</div>';
	react += '</div>';		
	return react;
}

function NewPost_ProcessCurrentResponse(variables,data){
	if (settings.responsePos && settings.responsePos != areaNames.na) {
		var response = '<p id="reactText" class="text" height="auto" margin="0" text->';

		if (data.response_type && reacts[data.response_type])
			response += reacts[data.response_type];

		if (data.response_type && reacts[data.response_type] && data.response_text)
			response += ": ";

		if (data.response_text)
			response += data.response_text;

		response += ' </p>';

		variables[settings.responsePos] += response;
	}
}

function NewPost_ProcessE6(variables){
	console.log("running newPost e6 method...");
	
	if (!settings.e6_Pos || settings.e6_Pos === areaNames.na || settings.e6_user === "" || settings.e6_api === "") return;
	//welcome to the horny zone
	var e6Zone = '' //'<p id="e6Infos" class="text"></p>';
	e6Zone += '<button id="addFav" disabled>...</button>'
	variables[settings.e6_Pos] += e6Zone;
}

function setNewPost(data) {
	if (settings.overrideURL)
		return;
	//Check for changes if false skip code
	//this is for perfomance (local & network)
	if (!data)
		return;
	
	var isSamePost = lastUrl == data.post_url && data.response_type == lastResponseType && data.response_text == lastResponseText && overrideUpdate != true;
	if (isSamePost)
		return;

	//set in case override was ture
	overrideUpdate = false;
	
	console.log("Updating link data!");
	UpdatePostUrl(data.post_url);
	

	//String variables for areas
	var variables = {};
	areas.forEach(area => variables[area]="");

	NewPost_ProcessSetBy(variables,data);
	NewPost_ProcessSetterData(variables);
	NewPost_ProcessReactionButtons(variables);
	NewPost_ProcessCurrentResponse(variables,data);
	NewPost_ProcessE6(variables);

	//sets the html for each area with the coresponding variables
	areas.forEach(area => {		
		if(area == areaNames.na)return;
		var html = variables[area];
		if(!html)return;
		
		$("#" + area).html(html);
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

function GetReactionButton(id, emoji, ttId, tooltip) {
	var html = "";

	html += '<button type="button" id="' + id + '" >' + emoji;
	html += '<p id="' + ttId + '" class="tooltipItem">' + tooltip + '</p>';
	html += '</button>';

	return html;
}

function getBgHtml(url) {
	var bg = "";
	bg += '<Img id="bImg" class="bImg" />';
	bg += '<video id="bVid" src="' + url + '" class="bImg" style="visibility: hidden;" autoplay loop >Video error </video>';

	return bg;
}

function setEvents() {
	jQuery(document).ready(function ($) {
		
		$('#addFav').click(function() {
			if(settings.e6_user && settings.e6_user != "") 
				SetPostFavourite(settings.e6_api, settings.e6_user,lastPostId);
			overrideUpdate = true;
		});

		/*
		$("#bImg").on('load',function (){
		console.log("test");
		elem.style.visibility = "visible";
		});*/

		document.getElementById("bVid").volume = 0;
		$('#bVid').on("loadeddata", function () {
			SetVisible('#bVid');
			SetHidden('#bImg');

			document.getElementById("bVid").volume = settings.volume;
			//if(settings["autoplay"] == "true")
			//elVid.play();
		});

		$('#bVid').click(function () {

			if (settings.videocontrols === "noUI")
				this.paused ? this.play() : this.pause();
		});

		$('#btn_reactDD').click(function () {

			if ($('#reactDD').css("visibility") === "hidden") {
				SetVisible('#reactDD');
				HandleDDScrollBtns();
			} else {
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

		$('.reactDD_litxt').each(function () {
			this.addEventListener("click", function (event) {
				$("#btn_reactDD_value").html(this.innerHTML);
				SetHidden('#reactDD');
				HideDDScrollbtns();
			});
		});

		$('#reactDD_scroll').scroll(function () {
			HandleDDScrollBtns();
		});

		var dd_scroll = document.getElementById("reactDD_scroll");

		var loopUp = null;
		$('#reactDD_scrollBtn_up').hover(function () {

			loopUp = setInterval(function () {
				dd_scroll.scrollBy(0, -settings.scrollSpeed);
			}, 10);
		}, function () {
			clearInterval(loopUp);
		});

		var loopDown = null;
		$('#reactDD_scrollBtn_down').hover(function () {
			loopDown = setInterval(function () {
				dd_scroll.scrollBy(0, settings.scrollSpeed);
			}, 10);
		}, function () {
			clearInterval(loopDown);
		});

		if (settings.reactPos && settings.reactPos != areaNames.na)
			if (CheckApiKey()) {

				reactButttons.forEach(btn => {
					$('#' + btn.id).click(function () {
						postReaction(btn.reactID);
					});
				});
			}
	});
}

function SetVisibility(jqItemName, state) {
	$(jqItemName).css("visibility", state);
}

function SetVisible(jqItemName) {
	SetVisibility(jqItemName, 'visible');
}
function SetHidden(jqItemName) {
	SetVisibility(jqItemName, 'hidden');
}
function SetCollapsed(jqItemName) {
	SetVisibility(jqItemName, 'collapse');
}

function HandleTooltip(jqItemName, jqToolTipName) {
	if (!settings.showTooltips) { return; }
	$(jqItemName).mouseenter(function () {
		SetVisible(jqToolTipName);
	});
	$(jqItemName).mouseleave(function () {
		SetCollapsed(jqToolTipName);
	});
}

function HideDDScrollbtns() {
	SetHidden('#reactDD_scrollBtn_up');
	SetHidden('#reactDD_scrollBtn_down');
}

function HandleDDScrollBtns() {
	var dd_scroll = document.getElementById("reactDD_scroll");
	if (dd_scroll.scrollTop == 0)
		SetHidden('#reactDD_scrollBtn_up');
	else
		SetVisible('#reactDD_scrollBtn_up');

	var scrollBottom = dd_scroll.scrollHeight - dd_scroll.scrollTop - dd_scroll.clientHeight;
	if (scrollBottom < 1)
		SetHidden('#reactDD_scrollBtn_down');
	else
		SetVisible('#reactDD_scrollBtn_down');
}

function toggleAttribute(elem, attName, value) {
	elem.hasAttribute(attName) ? elem.removeAttribute(attName) : elem.setAttribute(attName, value);
}

LoopSetterUpdate();
function LoopSetterUpdate() {
	if (!settings.overrideURL) {
		console.log("refreshing last Setter ");
		UpdateSetterInfo(lastSetBy);
	}

	setTimeout(LoopSetterUpdate, settings.interval);
}



Loop_e6_Update();
async function Loop_e6_Update() {
	await e6_Update();
	setTimeout(Loop_e6_Update, settings.interval);
}

async function e6_Update(){
	console.log("Updating e6 stuff ("+settings.e6_user+")");
	if (!settings.e6_Pos || settings.e6_Pos === areaNames.na || settings.e6_user === "" || settings.e6_api === "") {
		console.log("e6 is disabled, returning...")
		return;
	}

	console.log("getting md5 of last url " + lastUrl);
	var md5 = GetMd5(lastUrl);
	console.log("md5 " + md5);
	
	//TODO: check if last and current md5 are the same
	
	console.log("updating e6 userdata for: " + settings.e6_user)
	var e6Data = await GetPostInfo(md5, settings.e6_user, settings.e6_api);
	if(e6Data && e6Data.posts && e6Data.posts[0]){
		setE6Info(e6Data.posts[0]);
	} else {
		console.log("no e6 data disabling ui");
		$('#addFav').attr("disabled", true);
		$('#addFav').html('loading...');
	}
}

function setE6Info(data){	
	console.log("setting e6 info");
	$('#addFav').attr("disabled", false);
	
	console.log("[e6] isCurrentFav: " + data.is_favorited)
	
	$('#addFav').html(data.is_favorited? '-': '+');
	lastPostId = data.id;
}

function proccessSetterSetBy(userData,username){
	var friend = '';
	var name = '';
	var online = '';
	
	//online and friend status
	if (userData) {
		if (userData.friend)
			friend = '♥️ ';

		name = userData.self ? 'you' : username;

		if (userData.online)
			online = ' 🟢';
		
	} else {
		name = 'anon';
	}

	$("#setBy").html(`👤set_by: ${friend}${name}${online}`);
}

function processSetterLinkInfos(userData){
	if(!settings.setterInfoPos || settings.setterInfoPos == areaNames.na)return;
	if(!userData || !userData.links) return;

	var elInfo = $("<p class='text'></p>");
	$(elInfo).html(`Links: ${userData.links.length}`);
	$('#SetterInfo').html("").append(elInfo);

	//list of links
	if (settings.listSetterLinks == "true") 
	for (const ulink of userData.links) {

		var symbol = '';
		if (ulink.response_type && reacts[ulink.response_type])
			symbol = reacts[ulink.response_type];

		var response = ulink.response_text ?? '';

		var elLink = $("<p class='text'></p>");
		$(elLink).html(` ➔ [${ulink.id}] last Response:${symbol} ${response}\n`);
		$('#SetterInfo').append(elLink);
	}
}

async function UpdateSetterInfo(username) {
	console.log("Updating Setter Info of " + username);
	if (settings.showSetterData !== "true") { return; }

	var userData = username ? await getUserInfo(username) : null;
	proccessSetterSetBy(userData,username);
	processSetterLinkInfos(userData);
}

const wtBaseUrl = "https://walltaker.joi.how";
const wtApiUrl = wtBaseUrl + "/api";

//gets json from website
//on sucess: calls function setNewPost() (updates background + infos)
function getJSON() {
	if (!settings.linkID) {
		console.log("Did not request Link -> linkId was empty");
		SetVisible("#rcenter-center");
		return;
	}
	SetHidden("#rcenter-center");

	$.ajaxSetup({
		xhrFields: { /*withCredentials:true*/},
		crossDomain: true,
		beforeSend: function (request) {
			request.setRequestHeader(cName, vNr);
			console.log("fetching link " + settings.linkID);
		}
	});

	let url = wtApiUrl + `/links/${settings.linkID}.json`;

	$.getJSON(url)
		.done( data => setNewPost(data))
		.fail(function (jqXHR, textStatus, errorThrown) {
			console.error('getJSON returned error');
			$('#centerMessage').html(`Server returned ${textStatus}: ${errorThrown}! <br> Check your internet connection and link number!`);
			SetVisible('#rcenter-center');
		});
}

//gets Info from username and returns JSON object of response
async function getUserInfo(username) {
	if (!username) {
		console.log("getUserInfo was called but username was empty, skipping fetch");
		return;
	}

	$.ajaxSetup({
		xhrFields: { /*withCredentials:true*/ },
		crossDomain: true,
		beforeSend: function (request) {
			request.setRequestHeader(cName, vNr);
			console.log("fetching UserInfo of " + username);
		}
	});

	const query = CheckApiKey() ? `?api_key=${settings.api_key}` : ''
	let url = wtApiUrl + `/users/${username}.json${query}`;
	try{
		let response = await fetch(url);
		var json = await response.json();
		return json;
	} catch(error) {
		console.error('Failed to fetch user info:',error);
	}
}

function CheckApiKey() {
	return (settings.api_key && settings.api_key.length === 8);
}

const e6ApiUrl = "https://e621.net";

function GetMd5(url) {
	return url.split('/').pop().split('.')[0];
}

var lastPostId = "";

async function GetPostInfo(md5, username, api) {
	console.log("fatching data of post (md5) " + md5);
	let url = "https://e621.net" + `/posts.json?limit=1&tags=md5:${md5}`;
	const response = await fetch(url, {
	  headers: {
		  "Authorization": "Basic " + btoa(`${username}:${api}`),
		  "User-Agent": cNameLong +"/"+ vNr + " (by Lycraon)",
		  "_client": cNameLong +"/"+ vNr + " (by Lycraon)",
		  "Client-Name": cNameLong,
		  "Client-Version": vNr,
		  "Client-Author": "lycraon"
	  }
	});
	
	var json = await response.json();
	return json;
}

async function SetPostFavourite(api, username, postId) {
	if(!postId || postId == ""){
		console.error("tried to set post as favourite, but id was empty");
		return;
	}
	
	console.log("setting post as favourite " + postId);
	let url = "https://e621.net" + `/favorites.json?post_id=${postId}`;
	const response = await fetch(url, {
		method: "post",
		headers: {
		  "Authorization": "Basic " + btoa(`${username}:${api}`),
		  "User-Agent": cNameLong +"/"+ vNr + " (by Lycraon)",
		  "_client": cNameLong +"/"+ vNr + " (by Lycraon)",
		  "Client-Name": cNameLong,
		  "Client-Version": vNr,
		  "Client-Author": "lycraon"
		},
		body: JSON.stringify({
			//post_id: postId
		})
	});
	
}

var intervalID = null;

//Loops getJson (= get Data from Website)
var UpdateCanvasRunning = false;
function UpdateCanvas() {
	UpdateCanvasRunning = true;
	if (!settings.overrideURL)
		getJSON();
	else
		UpdateCanvasRunning = false;

	intervalID = setTimeout(UpdateCanvas, settings.interval);
}
