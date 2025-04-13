/*jshint esversion: 8 */

//Metadata
const appInfo = {
	nameLong: "walltaker-wallpaper-engine",
    name: "Wallpaper-Engine-Client",
    version: "v2.5.2"
}

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

//reaction-data
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

//Default-Settings
const settings = {
	overrideURL: "", // Put an Url here to only show this url (must be link to picture/video (static pages on e621))
	volume: "1",
	linkID: "",
	api_key: "",
	textColor: "255 255 255",
	background_color: "0 0 0",
	background_opacity: "1",
	fontSize: "100%", //x-small,small, medium, large or px / em / %
	interval: "10000", //ms do not run with small numbers(<10000) for long sessions
	objfit: "contain",
	videocontrols: "full",
	loop: "true",
	autoplay: "true",
	textPos: areaNames.topL,
	reactPos: areaNames.topC,
	reactPacks: [], //! only use strings ! !overrides WE settings!
	showTooltips: "true",
	showSetterData: "true",
	listSetterLinks: "true",
	responsePos: areaNames.topC,
	setterInfoPos: areaNames.botL,
	maxAreaWidth: "20vw",
	zoom_w: "100", //%
	zoom_h: "100", //%
	canv_x: "0", //px
	canv_y: "0", //px
	scrollspeed: "4",
	e6_Pos: areaNames.topL,
	e6_user: "",
	e6_api: "",
};

//Global variables
const appState = {
	lastUrl: "",
    lastSetBy: "",
    lastResponseType: "",
    lastResponseText: "",
    lastCanvas: "",
    lastPostId: "",
    overrideUpdate: false,
	reactPacks: [...settings.reactPacks],
	bOpacity: settings.background_opacity,
};

const WT_API_KEY_LENGTH = 8; 
const MIN_INTERVAL_MS = 8500;
const wtBaseUrl = "https://walltaker.joi.how";
const wtApiUrl = wtBaseUrl + "/api";
const e6ApiUrl = "https://e621.net";

var reloadColors = true;

window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		console.log("loading properties");
		
		let realoadSetter = false;
		let reloadCanvas = false;

		//process wallpaper properties
		ProcessPropertyToSetting(properties, "vid_volume", () =>{}, settingName = "volume");

		ProcessPropertyToSetting(properties, "linkID", value => {
			appState.lastUrl = "";
			if (!value?.trim()) {
				return;
			}
			
			getJSON();
			});

		ProcessProperty(properties, "api_key", value => {
			if (SetApiKey(properties.api_key.value)) {
				reloadCanvas = true;
			}
			});


		if(!ProcessProperty(properties,"interval", value => SetIntervalSeconds(parseInt(value)))){
			SetIntervalSeconds();
		}	

		ProcessPropertyToSetting(properties, "objfit", ()=>{reloadCanvas = true;});
		ProcessPropertyToSetting(properties, "videocontrols");
		ProcessPropertyToSetting(properties, "autoplay");
		ProcessPropertyToSetting(properties, "loop");
		ProcessPropertyToSetting(properties,"backg_color", () => {reloadCanvas = true;}, settingName = "background_color");
		ProcessPropertyToSetting(properties,"text_color",  () => {reloadCanvas = true;}, settingName = "textColor");
		ProcessProperty(properties, "area_maxWidth", value => {settings.maxAreaWidth = value + "vw"});
		ProcessPropertyToSetting(properties, "font_size",() =>{}, settingName = "fontSize");
		ProcessPropertyToSetting(properties,"set_by",  () => {reloadCanvas = true;}, settingName = "textPos");
		ProcessPropertyToSetting(properties, "setterData", () =>{}, settingName = "showSetterData");
		ProcessPropertyToSetting(properties, "setterLinks",() =>{}, settingName = "listSetterLinks");
		ProcessPropertyToSetting(properties,"setterInfo",  () => {reloadCanvas = true;}, settingName = "setterInfoPos");
		ProcessProperty(properties, "reaction",     value => {
			settings.reactPos    = value;
			settings.responsePos = value;
			reloadCanvas = true;
			});

		ProcessPropertyToSetting(properties, "zoom_w");
		ProcessPropertyToSetting(properties, "zoom_h");
		ProcessPropertyToSetting(properties, "canv_x");
		ProcessPropertyToSetting(properties, "canv_y");

		let packs = Object.keys(reactions).sort((a, b) => (packWeights[b] ?? 0) - (packWeights[a] ?? 0));
		console.log("[[packs:]]" + packs.toString());

		if (SetReactionpacks(packs))
			reloadCanvas = true;


		let customReactions = Array.from({ length: 6 }, (_, i) => properties[`reaction${i + 1}`]?.value || "");

		if (customReactions != reactions.customReactions) {
			console.log(customReactions);
			reactions.custom = customReactions;
			reloadCanvas = true;
		}

		ProcessPropertyToSetting(properties, "scrollspeed", () => {reloadCanvas = true;});
		ProcessPropertyToSetting(properties, "e6_name", () => {reloadCanvas = true;}, settingName = "e6_user");
		ProcessPropertyToSetting(properties, "e6_api", () => {reloadCanvas = true;});
		
		//-----------------------------------------------------------------------------------------------
		if (settings.overrideURL)
			ChangeSettings();

		if (reloadCanvas) {
			appState.overrideUpdate = true;
			getJSON();
		} else
			ChangeSettings();

		if (reloadColors) {
			ChangeSettings();
		}

		if (realoadSetter)
			UpdateSetterInfo(appState.lastSetBy);
	}
};


/**
 * Processes a property from the given properties object by its name and applies a callback function to its value.
 *
 * @param {Object} properties - The object containing properties to process.
 * @param {string} propName - The name of the property to process. Must be a non-empty string.
 * @param {Function} callback - The callback function to execute with the property's value.
 * @returns {boolean} - Returns `true` if the property was successfully processed, otherwise `false`.
 *
 * @throws {Error} - If an error occurs during the execution of the callback function.
 */
function ProcessProperty(properties, propName, callback ) {
	if(!propName?.trim()) {
		console.error(`Propertyname is empty!`);
		return false;
	}

	if(!Object.hasOwn(properties, propName)){
		//console.log(`No Property ${propName}`);
		return false;
	}

	try {
		callback(properties[propName].value);
		return true;
	} catch (error) {
		console.error(`Error processing property ${propName}:`, error);
	}
	
	return false;
}

/**
 * Processes a property from a given properties object and maps it to a corresponding setting.
 * Optionally, a callback can be executed after the property is processed.
 *
 * @param {Object} properties - The object containing the properties to process.
 * @param {string} propName - The name of the property to process.
 * @param {Function} [callback=() => {}] - An optional callback function to execute after processing the property.
 * @param {string} [settingName=propName] - The name of the setting to map the property to. Defaults to the property name.
 * @returns {boolean} - Returns `false` if the property name, setting name, or setting is invalid; otherwise, the result of `ProcessProperty`.
 *
 * @throws {Error} - If an error occurs during the execution of the callback function.
 */
function ProcessPropertyToSetting(properties, propName, callback = () => {}, settingName = propName) {
	if(!propName?.trim() || !settingName?.trim()) {
		console.error(`Property- or settingname is empty!`);
		return false;
	}

	if(!Object.hasOwn(settings, settingName)){
		console.error(`Setting ${settingName} not found`);
		return false;
	}
	
	return ProcessProperty(properties, propName, value => {
		try{

			settings[settingName] = "" + value;
			console.log(`[prop]:${propName} → [setting]:${settingName}| value = ${value}`);
			callback(value);
		}catch (error) {
			console.error(`Error processing propertyToSetting ${propName} to ${settingName}:`, error);
		}
	});
}

function SetApiKey(apiKey) {
	settings.api_key = "" + apiKey?.trim();
	if (settings.api_key.length !== WT_API_KEY_LENGTH) {
		settings.reactPos = areaNames.na;
		settings.responsePos = areaNames.na;
	}
	return true;
}

function SetIntervalSeconds(interval=0) {
	//Setting min possible interval to avoid DOS spamming
	settings.interval = Math.min(parseInt(interval) * 1000, MIN_INTERVAL_MS);
}

// returns true if the reaction packs have changed
function SetReactionpacks(packs) {
	const oldPacks = [...appState.reactPacks];

	appState.reactPacks = Object.keys(reactions)
		.sort((a, b) => (packWeights[b] ?? 0) - (packWeights[a] ?? 0))
		.filter(packItem => packs.includes(packItem));
	return JSON.stringify(oldPacks) !== JSON.stringify(appState.reactPacks);
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
	appState.lastUrl = url;
	ChangeSettings();
	console.log("custom url " + settings.overrideURL);

	settings.showTooltips = false;
	setEvents();

	ChangeSettings();
}

//changes Settings mostly CSS stuff
function ChangeSettings() {
	let color = settings.background_color + " " + appState.bOpacity;

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
			object-fit: ${settings.objfit} !important;
			position: absolute;
			content: url(${appState.lastUrl || ''});
		}
	`;

	//setting content of dynCSS (style element)
	$('#dynCSS').html(css);

	console.log("autoplay:" + (settings.autoplay == "true"));
	console.log("loop:" + (settings.loop == "true"));

	let bVid = document.getElementById("bVid");
	SetVideoSettings(bVid);

}

function SetVideoSettings(bVid) {
	bVid.controls = (settings.videocontrols === "full");
	bVid.defaultMuted = (settings.volume == 0);
	bVid.autoplay = (settings.autoplay == "true");
	bVid.loop = (settings.loop == "true");
	bVid.load();
}

//takes WallpaperEngine color string and converts it into (usable) rgb/rgba format
function GetRGBColor(customColor) {
	//split string into values
	let temp = customColor.split(' ');
	let rgb = temp.slice(0, 3);

	//cap rgb values at 255
	rgb = rgb.map(function _cap(c) {
		return Math.ceil(c * 255);
	});

	let customColorAsCSS = "";

	//length is 3 for rgb values
	if (temp.length > 3)
		customColorAsCSS = 'rgba(' + rgb + ',' + temp[3] + ')';
	else
		customColorAsCSS = 'rgb(' + rgb + ')';

	return customColorAsCSS;
}

//sends POST to Website and passes data to setNewPost
function postReaction(reactType) {
	if (settings.api_key.length !== WT_API_KEY_LENGTH)
		return;

	console.log("ractPacks:" + appState.reactPacks.length);

	//Reaction Text
	const txt = appState.reactPacks.length > 0 ? $('#btn_reactDD_value').html() : "";
	console.log('Posting reaction (' + reactType + ',"' + txt + '") to Link ' + settings.linkID);

	//POST
	//wt_apiRequest("api/links/" + settings.linkID + "/response.json","POST",);

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
			appState.overrideUpdate = true;
			setNewPost(data);
		},
		failure: function (errMsg) {
			console.error(`Failed to post reaction: ${errMsg}`);
		}
	});
}

function clearBackground() {
    appState.bOpacity = "0";
    $('#bVid').attr("src", "");
    $('#bImg').attr("src", "");
}

function UpdatePostUrl(url){
	if (!url?.trim()) {
        clearBackground();
        return;
    }

	appState.bOpacity = settings.background_opacity;

	const filetype = url.split('.').pop().toString().toLowerCase();
	if(["mp4", "webm", "ogg"].includes(filetype)) {
		//Handle video
		updateMedia("#bVid", url, "#bImg");
	}else{
		//Handle image
		preloadImage(url);
		updateMedia("#bImg", url, "#bVid");
	}
}

function preloadImage(url) {
    // Remove any existing temporary images
    while (document.getElementById("temp")) {
        $('#temp').remove();
    }

    // Create and append a hidden image element to preload the image
    const img = document.createElement("img");
    img.style.visibility = "hidden";
    img.src = url;
    img.id = "temp";
    document.body.appendChild(img);
}

function updateMedia(visibleSelector, url, hiddenSelector) {
    $(visibleSelector).attr("src", url);
    SetVisible(visibleSelector);

    SetHidden(hiddenSelector);
	$(hiddenSelector).attr("src", "");
}

function NewPost_ProcessSetBy(variables,data){
	//Update appState.lastSetBy
	if (data?.set_by) {
		console.log(`appState.lastSetBy => ${data.set_by}`);
		appState.lastSetBy = data.set_by;
	} else if (!appState.lastSetBy || appState.lastUrl != data.post_url) {
		console.log("new wallpaer without setBy => anon");
		appState.lastSetBy = null;
	}

	if (!settings.textPos || settings.textPos == areaNames.na) { return; }

	// Add element for "set by" text
	variables[settings.textPos] += '<p id="setBy" class="text"></p>';
}

function NewPost_ProcessSetterData(variables){
	if (settings.showSetterData !== "true" || !settings.setterInfoPos || settings.setterInfoPos == areaNames.na){ return;}
	
	// Add element for setter info text
	variables[settings.setterInfoPos] += '<div id="SetterInfo"></div>';
}

function NewPost_ProcessReactionButtons(variables){
	console.log("processReactionButtons");

	if (!settings.reactPos || settings.reactPos == areaNames.na) {return}
	if (!CheckApiKey()) { return;}

	const packs = settings.reactPacks.length > 0 ? settings.reactPacks : appState.reactPacks;

	const reactionForm = `
		<form>
			${buildReactDrop(packs)}
			<p class="spacer"></p>
			${buildReactButtons()}
		</form>
		<p class="spacer"></p>
	`;

	variables[settings.reactPos] += reactionForm;
}

function buildReactButtons() {
	const buttons = reactButttons
			.map(btn => GetReactionButton(btn.id, reacts[btn.reactID], btn.elem, btn.txt))
			.join('');

	return `
		<div id="buttons">
			${buttons}
		</div>
	`;
}

function buildReactDrop(packs){

	// Create the dropdown structure
	const reactDrop = `
		<div id="reactDrop">
			<button type="button" id="btn_reactDD">
				<p id="btn_reactDD_value"></p>
				<p id="btn_reactDD_arrow">⏷</p>
			</button>
			<div id="reactDD">
				${buildScrollButton('reactDD_scrollBtn_up', '▲')}
				<div id="reactDD_scroll">
					${buildReactOptions(packs)}
				</div>
				${buildScrollButton('reactDD_scrollBtn_down', '▼')}
			</div>
		</div>
	`;
	return reactDrop;
}

function buildScrollButton(id, symbol) {
    return `
        <button id="${id}" type="button" class="reactDD_scrollBtn" style="visibility: hidden;">
            ${symbol}
        </button>
    `;
}

function buildReactOptions(packs) {
    return packs
		.flatMap(pack => packTexts = reactions[pack] || [])
		.filter(packText => packText.trim())
		.map(packText => `<a href="#" class="reactDD_litxt">${packText}</a>`)
        .join("\r\n");
}

function NewPost_ProcessCurrentResponse(variables,data){
	if (!settings.responsePos || settings.responsePos === areaNames.na) {
        return;
    }
	
	const hasType = data.response_type && reacts[data.response_type];
	const hasText = data.response_text && data.response_text.trim > "";

	// Append the response to the appropriate area
	variables[settings.responsePos] += `
		<p id="reactText" class="text" height="auto" margin="0">
			${ hasType? reacts[data.response_type] : ''}${(hasType && hasText)? ': ' : ''}${hasText? data.response_text : ''}
		</p>
	`;
}

function NewPost_ProcessE6(variables){
	console.log("running newPost e6 method...");
	
	if (!settings.e6_Pos || settings.e6_Pos === areaNames.na || !settings.e6_user?.trim() || !settings.e6_api?.trim() ) {return;}
	//welcome to the horny zone
	//'<p id="e6Infos" class="text"></p>';
	variables[settings.e6_Pos] += ` 
		<button id="addFav" disabled>...</button>
	`;
}

function setNewPost(data) {
	if (settings.overrideURL)
		return;
	//Check for changes if false skip code
	//this is for perfomance (local & network)
	if (!data)
		return;
	
	var isSamePost = appState.lastUrl == data.post_url && data.response_type == appState.lastResponseType && data.response_text == appState.lastResponseText && appState.overrideUpdate != true;
	if (isSamePost)
		return;

	//set in case override was ture
	appState.overrideUpdate = false;
	
	console.log("Updating link data!");
	UpdatePostUrl(data.post_url);
	
	//String variables for areas
	//let variables = Object.fromEntries(areas.map(area => [area, ""]));
	var variables = {};
	areas.forEach(area => variables[area]="");

	NewPost_ProcessSetBy(variables,data);
	NewPost_ProcessSetterData(variables);
	NewPost_ProcessReactionButtons(variables);
	NewPost_ProcessCurrentResponse(variables,data);
	NewPost_ProcessE6(variables);

    //sets the html for each area with the coresponding variables
	areas
    .filter(area => area != areaNames.na)
    .forEach(area => {
		if(!variables[area]) return;
        $("#" + area).html(variables[area]);
    });

	//Event functions
	setEvents();

	//sets current dat for next check
	appState.lastUrl = data.post_url;

	appState.lastResponseType = data.response_type;
	appState.lastResponseText = data.response_text;

	//calls ChangeSettings to update css / style
	ChangeSettings();

	//Get infos of setter
	UpdateSetterInfo(data.set_by);
}

function GetReactionButton(id, emoji, ttId, tooltip) {
	return `
		<button type="button" id="${id}">
			${emoji}
			<p id="${ttId}" class="tooltipItem">${tooltip}</p>
		</button>
	`;
}

function setAddFavEvents(){
	$('#addFav').click(function() {
		console.log("addFav clicked");
		
		if(settings.e6_user?.trim()) {
			SetPostFavourite(settings.e6_api, settings.e6_user,appState.lastPostId);
		}
		appState.overrideUpdate = true;
	});
}

function setbImgEvents() {
	/*
		$("#bImg").on('load',function (){
		console.log("test");
		elem.style.visibility = "visible";
		});*/
}

function setbVideoEvents(){
	const videoElement = document.getElementById("bVid");

	videoElement.volume = 0;
	$('#bVid').on("loadeddata", function () {
		console.log("video loaded data");
		SetVisible('#bVid');
		SetHidden('#bImg');

		videoElement.volume = settings.volume;
		//if(settings["autoplay"] == "true")
		//elVid.play();
	});

	$('#bVid').click(function () {
		console.log("video clicked");
		if (settings.videocontrols === "noUI")
			this.paused ? this.play() : this.pause();
	});
}

function setReactDropdownEvents(){	
	$('#btn_reactDD').click(function () {
		console.log("reactDropDown clicked");
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
			console.log("reactDD_litxt clicked");
			
			$("#btn_reactDD_value").html(this.innerHTML);
			SetHidden('#reactDD');
			HideDDScrollbtns();
		});
	});
	
	$('#reactDD_scroll').scroll(function () {
		HandleDDScrollBtns();
	});
	
	
	const scrollContainer = document.getElementById("reactDD_scroll");
	setupScrollButton($('#reactDD_scrollBtn_up')  , scrollContainer, -settings.scrollspeed);
    setupScrollButton($('#reactDD_scrollBtn_down'), scrollContainer, settings.scrollspeed);
}

function setupScrollButton(button, scrollContainer, scrollspeed) {
	let scrollInterval = null;

    button.hover(function () {

		scrollInterval = setInterval(function () {
			scrollContainer.scrollBy(0, scrollspeed);
		}, 10);
	}, function () {
		clearInterval(scrollInterval);
	});
}

function setReactButtonsEvents(){
	if (settings.reactPos && settings.reactPos != areaNames.na)
	if (CheckApiKey()) {

		reactButttons.forEach(btn => {
			$('#' + btn.id).click(function () {
				postReaction(btn.reactID);
			});
		});
	}
}

function setEvents() {
	jQuery(document).ready(function ($) {
		setAddFavEvents();
		setbImgEvents();
		setbVideoEvents();
		setReactDropdownEvents();
		setReactButtonsEvents();	
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
	const scrollContainer = document.getElementById('reactDD_scroll');
	const scrollTop = scrollContainer.scrollTop;
    const scrollBottom = scrollContainer.scrollHeight - scrollTop - scrollContainer.clientHeight;

	SetVisibility('#reactDD_scrollBtn_up', scrollTop == 0 ? 'hidden' : 'visible' );
    SetVisibility('#reactDD_scrollBtn_down', scrollBottom < 1 ? 'hidden' : 'visible');
}

function toggleAttribute(elem, attName, value) {
	elem.hasAttribute(attName) ? elem.removeAttribute(attName) : elem.setAttribute(attName, value);
}

LoopSetterUpdate();
function LoopSetterUpdate() {
	if (!settings.overrideURL) {
		console.log("refreshing last Setter ");
		UpdateSetterInfo(appState.lastSetBy);
	}

	setTimeout(LoopSetterUpdate, settings.interval);
}

Loop_e6_Update();
async function Loop_e6_Update() {
	await e6_Update();
	setTimeout(Loop_e6_Update, settings.interval);
}

function isE6Enabled() {
    return settings.e6_Pos && settings.e6_Pos !== areaNames.na && settings.e6_user && settings.e6_api;
}

async function e6_Update(){
	console.log(`Updating e6 data for user: ${settings.e6_user}`);
	// Early return if e6 is disabled
    if (!isE6Enabled()) {
        console.log("e6 is disabled, skipping update...");
        return;
    }

	console.log("getting md5 of last url " + appState.lastUrl);
	const md5 = GetMd5(appState.lastUrl);
    console.log(`MD5 of last URL: ${md5}`);
	
	//TODO: check if last and current md5 are the same
	
	console.log("updating e6 userdata for: " + settings.e6_user)
    try {
        const e6Data = await fetchE6PostInfo(md5, settings.e6_user, settings.e6_api);
        if (e6Data && e6Data.posts && e6Data.posts[0]) {
            setE6Info(e6Data.posts[0]);
        } else {
            console.log("No e6 data found, disabling UI...");
			//disable button
            $('#addFav').attr("disabled", true);
			$('#addFav').html('loading...');
        }
    } catch (error) {
        console.error("Error updating e6 data:", error);
		//disavle button
        $('#addFav').attr("disabled", true);
		$('#addFav').html(error);
    }
}

function setE6Info(data){	
	console.log("setting e6 info");
	//enable button
	$('#addFav').attr("disabled", false);
	$('#addFav').html(data.is_favorited? '-': '+');
	console.log(`[e6] Post ID: ${data.id}, Favorited: ${data.is_favorited}`);
	appState.lastPostId = data.id;
}

function proccessSetterSetBy(userData,username){
	const friendStatus = userData?.friend ? '♥️ ' : '';
    const name = userData?.self ? 'you' : username || 'anon';
    const onlineStatus = userData?.online ? ' 🟢' : '';

	$("#setBy").html(`👤set_by: ${friendStatus}${name}${onlineStatus}`);
}

function processSetterLinkInfos(userData){
	if(!settings.setterInfoPos || settings.setterInfoPos == areaNames.na)return;
	if(!userData || !userData.links) return;

	var elInfo = $("<p class='text'></p>")
					.html(`Links: ${userData.links.length}`);
	$('#SetterInfo').html("").append(elInfo);

	// Add individual links if listing is enabled
	if (settings.listSetterLinks === "true") 
	userData.links.forEach(link => {
		const responseType = reacts[link.response_type];
		const symbol = link.response_type && responseType ? responseType : '';
		const response = link.response_text ?? '';
		const linkElement = $("<p class='text'></p>")
								.html(` ➔ [${link.id}] last Response: ${symbol} ${response}`);
		$('#SetterInfo').append(linkElement);
	});
}

async function UpdateSetterInfo(username) {
	console.log("Updating Setter Info of " + username);
	if (settings.showSetterData !== "true") { return; }

	var userData = username ? await getUserInfo(username) : null;
	proccessSetterSetBy(userData,username);
	processSetterLinkInfos(userData);
}


//gets json from walltaker website
async function getJSON() {
    if (!settings.linkID?.trim()) {
        console.log("Did not request Link -> linkID was empty");
        SetVisible("#rcenter-center");
        return;
    }
    SetHidden("#rcenter-center");

    try {
        const data = await wt_apiRequest(`/links/${settings.linkID}.json`);
        setNewPost(data);
    } catch (error) {
        console.error("getJSON returned error:", error);
        $('#centerMessage').html(
            `Server returned an error! <br>
			 Check your internet connection and link number! <br>
			 [${error}]
			`
        );
        SetVisible("#rcenter-center");
    }
}

//gets Info from username and returns JSON object of response
async function getUserInfo(username) {
    if (!username?.trim()) {
        console.log("getUserInfo was called but username was empty, skipping fetch");
        return null;
    }

    const query = CheckApiKey() ? `?api_key=${settings.api_key}` : "";

    try {
        return await wt_apiRequest(`/users/${username}.json`, "GET", query);
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        return null;
    }
}

async function wt_apiRequest(endpoint, method = "GET", queryParams = "", body = null) {
    const headers = {
		[appInfo.name]: appInfo.version,
	};
	return await REST_JsonRequest(wtApiUrl, endpoint, method, headers, queryParams, body);
}

function CheckApiKey() {
	//TODO: test API call during engine init
	return true

	settings.api_key = settings.api_key?.trim();
	return (settings.api_key && settings.length === WT_API_KEY_LENGTH);
}

function GetMd5(url) {
	return url.split('/').pop().split('.')[0];
}

async function fetchE6PostInfo(md5, username, api) {
    console.log(`Fetching data for post (md5): ${md5}`);
    const endpoint = `/posts.json?limit=1&tags=md5:${md5}`;
    try{
		let json = await e6_ApiRequest(endpoint, "GET", username, api)
		return json;
	} catch (error) {
		console.error("Failed to fetch e6 post info:", error);
		return null;
	}
}

async function SetPostFavourite(api, username, postId) {
    if (!postId?.toString().trim()) {
        console.error("Tried to set post as favorite, but post ID was empty.");
        return;
    }

    const endpoint = `/favorites.json?post_id=${postId}`;
	try {
    	await e6_ApiRequest(endpoint, "post", username, api, '{}' /*{ post_id: postId }*/);
	}
	catch (error) {
		console.error("Failed to set post as favorite:", error);
	}
	console.log(`Post ${postId} set as favorite`);
}

async function e6_ApiRequest(endpoint, method = "GET", username, api, body = null) {
    console.log(`e6_ApiRequest`);
	
	const headers = getE6Headers(username, api);
	return await REST_JsonRequest(e6ApiUrl, endpoint, method, headers, "", body);
}

function getE6Headers(username, api) {
    return {
        "Authorization": "Basic " + btoa(`${username}:${api}`),
        "User-Agent": `${appInfo.nameLong}/${appInfo.version} (by Lycraon)`,
        "_client": `${appInfo.nameLong}/${appInfo.version} (by Lycraon)`,
        "Client-Name": appInfo.nameLong,
        "Client-Version": appInfo.version,
        "Client-Author": "lycraon"
    };
}

var intervalID = null;

async function REST_JsonRequest(baseUrl, endpoint, method = "GET", headers = {}, queryParams = "", body = null) {
    const url = `${baseUrl}${endpoint}${queryParams}`;
    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

	console.log(`Making ${method} request to ${url}`);

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error during API request to ${url}:`, error);
        throw error;
    }
}

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
