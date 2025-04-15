/*jshint esversion: 8 */

//Metadata
const appInfo = {
	nameLong: "walltaker-wallpaper-engine",
    name: "Wallpaper-Engine-Client",
    version: "v2.5.1"
}

function addScript(path){
	var tmp = document.createElement('script');
	tmp.type = 'text/javascript';
	tmp.src = path;
	document.head.insertBefore(tmp, document.head.children[7]);
}

addScript('./js/settings.js');
addScript('./js/appState.js');
addScript('./js/reactions.js');

const E6Api = new E6Api_(appInfo);
const WalltakerApi = new WalltakerApi_(appInfo);

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
			if (value?.trim() > "") {	
				getJSON();
			}
			
			});

		ProcessProperty(properties, "api_key", value => {
			if (SetApiKey(properties.api_key.value)) {
				reloadCanvas = true;
			}
			});


		ProcessProperty(properties,"interval", value => SetIntervalSeconds(parseInt(value)))
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

		ProcessPropertyToSetting(properties, "e6_name", () => {reloadCanvas = true;}, settingName = "e6_user");
		ProcessPropertyToSetting(properties, "e6_api", () => {reloadCanvas = true;});

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
	if(!WalltakerApi_.IsAPIKeyValid(settings.apiKey)){
		settings.reactPos = areaNames.na;
		settings.responsePos = areaNames.na;
	}
	return true;
}

function SetIntervalSeconds(interval=0) {
	//Setting min possible interval to avoid DOS spamming
	console.log("setting interval: " + interval);
	settings.interval = Math.min(parseInt(interval) * 1000, MIN_INTERVAL_MS);
}

// returns true if the reaction packs have changed
function SetReactionpacks(packs) {
	console.log("setting reaction packs: " + packs.toString());
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
	variables[settings.textPos] += '<div><p id="setBy" class="text"></p></div>';
}

function NewPost_ProcessSetterData(variables){
	if (settings.showSetterData !== "true" || !settings.setterInfoPos || settings.setterInfoPos == areaNames.na){ return;}
	
	// Add element for setter info text
	variables[settings.setterInfoPos] += '<div id="SetterInfo" class="darkBackground"></div>';
}

function NewPost_ProcessReactionButtons(variables){
	console.log("processReactionButtons");

	if (!settings.reactPos || settings.reactPos == areaNames.na) {return}
	if (!WalltakerApi_.IsAPIKeyValid(settings.api_key)) { return;}

	const packs = appState.reactPacks.length > 0 ? appState.reactPacks : appState.reactPacks;

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
				<p id="btn_reactDD_arrow"><i class="fa-solid fa-chevron-down"></i></p>
			</button>
			<div id="reactDD">
				${buildScrollButton('reactDD_scrollBtn_up', '<i class="fa-solid fa-caret-up fa-lg"></i>')}
				<div id="reactDD_scroll">
					${buildReactOptions(packs)}
				</div>
				${buildScrollButton('reactDD_scrollBtn_down', '<i class="fa-solid fa-caret-down fa-lg"></i>')}
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

	const response = `${ hasType? reacts[data.response_type] : ''}${(hasType && hasText)? ': ' : ''}${hasText? data.response_text : ''}`
	// Append the response to the appropriate area
	variables[settings.responsePos] += `
		<div>
			<p id="reactText" class="text darkBackground" >${response?.trim() > ""? response : ''}</p>
		</div>
	`;
}

function NewPost_ProcessE6(variables){
	console.log("running newPost e6 method...");
	
	if (!settings.e6_Pos || settings.e6_Pos === areaNames.na || !settings.e6_user?.trim() || !settings.e6_api?.trim() ) {return;}
	//'<p id="e6Infos" class="text"></p>';
	
	//welcome to the horny zone
	variables[settings.e6_Pos] += ` 
		<div id="e6Zone">
			<button id="addFav" disabled>${getAddFavHtml("loading")}</button>
		</div>
	`;
}

function hasPostChanged(data){
	return appState.lastUrl != data.post_url ||
			data.response_text != appState.lastResponseText ||
			data.response_type != appState.lastResponseType;
}

function UpdateAppLinkState(data){
	appState.lastUrl          = data.post_url;
	appState.lastResponseType = data.response_type;
	appState.lastResponseText = data.response_text;
}

function setNewPost(data) {
	if (settings.overrideURL)
		return;
	//Check for changes if false skip code
	//this is for perfomance (local & network)
	if (!data)
		return;
	
	var isSamePost = !hasPostChanged(data) && appState.overrideUpdate != true;
	if (isSamePost)
		return;

	//set in case override was ture
	appState.overrideUpdate = false;
	appState.e6States.overrideUpdate = true;
	
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
	UpdateAppLinkState(data);

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
		if($(this).is(":disabled")) return;

		console.log("addFav clicked");
		$('#addFav').attr("disabled", true);
		if(settings.e6_user?.trim() > "" && settings.e6_api?.trim() > ""){
			appState.e6States.overrideUpdate = true;
		   	E6Api.SetPostFavourite(settings.e6_api, settings.e6_user,appState.lastPostId);
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
	if (!settings.reactPos || settings.reactPos == areaNames.na) {return;}
	if (!WalltakerApi_.IsAPIKeyValid(settings.api_key)) { return;}

		reactButttons.forEach(btn => {
			$('#' + btn.id).click(function () {
				postReaction(btn.reactID);
			});
		});
}

function setEvents() {
	jQuery(document).ready(function ($) {
		setAddFavEvents();
		setbImgEvents();
		setbVideoEvents();
		setReactDropdownEvents();
		setReactButtonsEvents();
		
		 // Use event delegation for dynamically created #LinksHeader
		 $(document).on('click', '#LinksHeader', function () {
			console.log('#LinksHeader click spam prevention has triggered');
			if(appState.isLinksHeaderClicked){
				return;
			}
			appState.isLinksHeaderClicked = true;

			appState.linksCollapsed = !appState.linksCollapsed;
			console.log(`LinksHeader clicked → collapsed = ${appState.linksCollapsed}`);
            $('#LinkTree').attr("hidden", appState.linksCollapsed);

			// Reset the flag after a short delay
			setTimeout(() => {
				appState.isLinksHeaderClicked = false;
			}, 100); // Adjust delay as needed
        });

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

	setTimeout(LoopSetterUpdate, Math.min(settings.interval, MIN_INTERVAL_MS));
}

Loop_e6_Update();
async function Loop_e6_Update() {
	await e6_Update();
	setTimeout(Loop_e6_Update, Math.min(settings.interval,1000));
}

function isE6Enabled() {
    return settings.e6_Pos && settings.e6_Pos !== areaNames.na && settings.e6_user && settings.e6_api;
}

function hase6PostChanged(md5) {
	return  !appState.e6States.lastMd5 ||
			appState.e6States.lastMd5 != md5 ||
			appState.e6States.lastUser != settings.e6_user ||
			appState.e6States.lastApiKey != settings.e6_api ||
			appState.e6States.overrideUpdate == true;;
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
	
	if(!hase6PostChanged(md5)){
		console.log("e6 post has not changed, skipping update...");
		return;
	}
	//TODO: check if last and current md5 are the same
	appState.e6States.overrideUpdate = false;

	console.log("updating e6 userdata for: " + settings.e6_user)
    try {
        const e6Data = await E6Api.GetPostInfo(md5, settings.e6_user, settings.e6_api);
        if (e6Data && e6Data.posts && e6Data.posts[0]) {
            setE6Info(e6Data.posts[0]);
        } else {
            console.log("No e6 data found, disabling UI...");
			//disable button
            $('#addFav').attr("disabled", true);
			$('#addFav').html(getAddFavHtml("noData"));
        }
    } catch (error) {
        console.error("Error updating e6 data:", error);
		//disavle button
        $('#addFav').attr("disabled", true);
		$('#addFav').html(error);
    }
}

function getAddFavHtml(state){
	const addFavIcon  = `fa-regular fa-star`;
	const isFavIcon   = `fa-solid   fa-star`;
	const loadFavIcon = `fa-solid fa-spinner fa-spin-pulse fa-spin-reverse`;

	switch(state){
		case "loading":
			return `<i class="${loadFavIcon}"></i>`;
		case "isFav":
			return `<i class="${isFavIcon} fav"></i>`;
		case "addFav":
			return `<i class="${addFavIcon} addFav"></i>`;
		case "noData":
			return `<i class="fa-solid fa-xmark"></i>`;
		case "disabled":
			return `<i class="${addFavIcon} disabled"></i>`;
		default:
			return `<i class=""></i>`;
	}
}

function setE6Info(data){	
	console.log("setting e6 info");
	//enable button
	appState.e6States.lastMd5 = data.file.md5;
	appState.e6States.lastUser = settings.e6_user;
	appState.e6States.lastApiKey = settings.e6_api;
	let state = data.is_favorited ? "isFav" : "addFav"
	
	$('#addFav').attr("disabled", false);	
	$('#addFav').html(getAddFavHtml(state));
	console.log(`[e6] Post ID: ${data.id}, Favorited: ${data.is_favorited}`);
	appState.lastPostId = data.id;
}

function proccessSetterSetBy(userData,username){
	const friendStatus = userData?.friend ? '<i class="fa-solid fa-heart"></i>' : '';
    const name = userData?.self ? 'you' : username || 'anon';
    const onlineStatus = userData?.online ? '<i class="fas fa-circle fa-pull-right fa-xs online"></i>' : ''; //🟢

	const userIcon = `<i class="fa-solid fa-user"></i>`;
	const anonIcon = `<i class="fa-solid fa-user-secret"></i>`;

	const showText = true;


	const icon = userData?.self ? userIcon : anonIcon;
	$("#setBy").html(`${userIcon} ${showText?'set_by':''}: ${friendStatus} ${name}${onlineStatus}`);
}

function processSetterLinkInfos(userData){
	if(!settings.setterInfoPos || settings.setterInfoPos == areaNames.na)return;
	if(!userData || !userData.links) return;
	const setterElement = $('#SetterInfo').html("");

	var elInfo = $(`
		<p id="LinksHeader" class='text'> 
			<i id="linkIcon" class="fas fa-link fa-lg" style="margin-right:0;font-weight:bold;padding:0;margin:0"></i> 
			<span id="linkCounter" class="counter">${userData.links.length}</span>
			<i id="messageIcon" class="fa-solid fa-message transparent"></i>
			<span id="messageCounter" class="counter" hidden></span>
		</p>`)

	// clear element and edd info text
	setterElement.append(elInfo);

	let treeElement = $(`<ul id="LinkTree" ${appState.linksCollapsed? 'hidden' : ''}></ul>`);
	setterElement.append(treeElement);

	let messageCounter = 0;
	let messageTypes = {};

	// Add individual links if listing is enabled
	if (settings.listSetterLinks === "true") 
	userData.links.forEach(link => {
		const responseType = reacts[link.response_type];
		const symbol = responseType ?? '';
		const response = link.response_text ?? '';

		if(symbol > "" || response > "")messageCounter++;


		if(!messageTypes[symbol] || messageTypes[symbol] < 1)messageTypes[symbol] = 0;

		messageTypes[symbol] ++;
		console.log(Object.keys(messageTypes).length + '|'+ symbol + ": " + messageTypes[symbol]);

		const linkElement = $('<li class="setterLink"></li>')
								.html(`
									<div class="text linkRow">
										<i class="fas fa-circle link-circle ${ link.online? 'online' : 'transparent'}"></i>
										<span class="linkNumber">
											<span">${link.id}</span>
										</span>
										<p class="linkText" ><span class="text">${symbol} ${response}</span></p>
									</div>`);
		treeElement.append(linkElement);
	});

	
	if(messageCounter > 0) {
		let msg = '';
		const temp = Object.entries(messageTypes).filter(([key,value]) => key > "");

		if(Object.keys(messageTypes).length > 1) 
			msg = messageCounter>1 ? messageCounter + '|' : '';

		//Object.entries(messageTypes).filter(([key,value]) => key > "").forEach(([key, value]) => { msg += `${value>1?value:''}${key} `;})
		Object.entries(messageTypes).filter(([key,value]) => key > "").map(([key, value]) => { msg += `${value>1?value:''}${key}`;}).join(' ');

		$("#messageCounter").html(msg);
		$("#messageCounter").attr("hidden", false);
		
		//$("#messageIcon").attr("hidden", false);
		$("#messageIcon").removeClass("transparent");
	}

}

async function UpdateSetterInfo(username) {
	console.log("Updating Setter Info of " + username);
	if (settings.showSetterData !== "true") { return; }

	var userData = username ? await WalltakerApi.GetUserInfo(username,settings.api_key) : null;
	proccessSetterSetBy(userData,username);
	processSetterLinkInfos(userData);
}

function GetMd5(url) {
	return url.split('/').pop().split('.')[0];
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

//sends POST to Website and passes data to setNewPost
function postReaction(reactType) {
	const txt = appState.reactPacks.length > 0 ? $('#btn_reactDD_value').html() : "";
	WalltakerApi.PostReaction(settings.linkID,reactType,txt,settings.api_key, (response,data) => {
		appState.overrideUpdate = true;
		setNewPost(data);
	});

	console.log("ractPacks:" + appState.reactPacks.length);
}

//gets json from walltaker website
async function getJSON() {
    if (!settings.linkID?.trim()) {
        console.log("Did not request Link -> linkID was empty");
        SetVisible("#rcenter-center");
        return;
    }
    SetHidden("#rcenter-center");

	const data = await WalltakerApi.GetLinkInfo(settings.linkID,(error) => {
		console.error("getJSON returned error:", error);
        $('#centerMessage').html(
            `Server returned an error! <br>
			 Check your internet connection and link number! <br>
			 [${error}]
			`
        );
        SetVisible("#rcenter-center");
		return null;
	});

	setNewPost(data);
}