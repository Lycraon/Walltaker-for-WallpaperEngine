/*jshint esversion: 8 */

function addScript(path) {
  /*$.getScript(path)
		.done( () => {
			console.log('[addScript] loaded: ' + path );
		})
		.fail( () => {
			console.error('[addScript] error loading ' + path);
		});*/

  const script = $(`<script type="text/javascript" src="${path}" ></script>`);
  script.onload = () => console.log('[script] loaded: ' + path);
  script.onerror = (e) => console.error('[script] error loading ' + path);
  script.insertBefore($('#apiScript'));
}

addScript('js/metadata.js');
addScript('js/areas.js');
addScript('js/settings.js');
addScript('js/reactions.js');
addScript('js/appState.js');

const E6Api = new E6Api_(appInfo);
const WalltakerApi = new WalltakerApi_(appInfo);

function getWalltakerClientName() {
  return `${appInfo.name}/${appInfo.version}`;
}

function clearWalltakerReconnect() {
  if (appState.walltakerSocketReconnect) {
    clearTimeout(appState.walltakerSocketReconnect);
    appState.walltakerSocketReconnect = null;
  }
}

function showWalltakerError(message) {
  $('#centerMessage').html(message);
  SetVisible('#rcenter-center');
}

function disconnectWalltakerSocket() {
  clearWalltakerReconnect();
  appState.walltakerSocketIntent = null;
  appState.walltakerSubscriptionIdentifier = null;
  appState.walltakerWatchedUser = null;

  if (appState.walltakerSocket) {
    appState.walltakerSocket.onopen = null;
    appState.walltakerSocket.onmessage = null;
    appState.walltakerSocket.onerror = null;
    appState.walltakerSocket.onclose = null;
    appState.walltakerSocket.close();
    appState.walltakerSocket = null;
  }
}

function performWalltakerAction(action, data = {}) {
  if (
    !appState.walltakerSocket ||
    appState.walltakerSocket.readyState !== WebSocket.OPEN ||
    !appState.walltakerSubscriptionIdentifier
  ) {
    return false;
  }

  appState.walltakerSocket.send(
    JSON.stringify({
      command: 'message',
      identifier: appState.walltakerSubscriptionIdentifier,
      data: JSON.stringify({
        action,
        ...data,
      }),
    })
  );
  return true;
}

function clearSetterInfo() {
  proccessSetterSetBy(null, appState.lastSetBy);
  $('#SetterInfo').html('');
}

function watchSetterUser(username, force = false) {
  if (settings.showSetterData !== 'true') {
    clearSetterInfo();
    return;
  }

  const trimmedUsername = username?.trim();
  if (!trimmedUsername) {
    clearSetterInfo();
    return;
  }

  const watchIntent = {
    username: trimmedUsername,
    api_key: settings.api_key?.trim() || '',
  };

  if (
    !force &&
    appState.walltakerWatchedUser &&
    appState.walltakerWatchedUser.username === watchIntent.username &&
    appState.walltakerWatchedUser.api_key === watchIntent.api_key
  ) {
    return;
  }

  if (!performWalltakerAction('watch_user', watchIntent)) {
    return;
  }

  appState.walltakerWatchedUser = watchIntent;
}

function handleWalltakerUserMessage(data) {
  if (!data.watching) {
    clearSetterInfo();
    return;
  }

  const userData = data.user;
  proccessSetterSetBy(userData, userData?.username || appState.lastSetBy);
  processSetterLinkInfos(userData);
}

function scheduleWalltakerReconnect(intent) {
  clearWalltakerReconnect();

  if (!intent || settings.overrideURL || !settings.linkID?.trim()) {
    return;
  }

  appState.walltakerSocketReconnect = setTimeout(() => {
    if (JSON.stringify(appState.walltakerSocketIntent) === JSON.stringify(intent)) {
      connectWalltakerSocket();
    }
  }, appState.walltakerSocketReconnectDelay);
}

function connectWalltakerSocket() {
  if (settings.overrideURL) {
    disconnectWalltakerSocket();
    return;
  }

  const linkID = settings.linkID?.trim();
  if (!linkID) {
    disconnectWalltakerSocket();
    showWalltakerError(
      'Looks like there is no Link set yet <br />Got to the wallpaper settings and put your link-number into the first box'
    );
    return;
  }

  const serverURL = WalltakerApi_.NormalizeServerUrl(settings.serverURL);
  settings.serverURL = serverURL;
  WalltakerApi.SetServerUrl(serverURL);

  const intent = { linkID, serverURL };
  appState.walltakerSocketIntent = intent;
  clearWalltakerReconnect();

  if (appState.walltakerSocket) {
    appState.walltakerSocket.onclose = null;
    appState.walltakerSocket.close();
    appState.walltakerSocket = null;
  }

  const cableUrl = WalltakerApi_.GetCableUrl(serverURL);
  const identifier = JSON.stringify({
    channel: 'LinkChannel',
    link_id: linkID,
    client: getWalltakerClientName(),
  });
  appState.walltakerSubscriptionIdentifier = identifier;

  console.log(`Connecting Walltaker websocket to ${cableUrl}`);
  const socket = new WebSocket(cableUrl);
  appState.walltakerSocket = socket;

  socket.onopen = () => {
    console.log('Walltaker websocket opened');
    socket.send(
      JSON.stringify({
        command: 'subscribe',
        identifier,
      })
    );
  };

  socket.onmessage = (event) => {
    let envelope = null;
    try {
      envelope = JSON.parse(event.data);
    } catch (error) {
      console.error('Invalid Walltaker websocket payload:', error);
      return;
    }

    if (envelope.type === 'ping' || envelope.type === 'welcome') {
      return;
    }

    if (envelope.type === 'confirm_subscription') {
      console.log('Walltaker subscription confirmed');
      SetHidden('#rcenter-center');
      watchSetterUser(appState.lastSetBy);
      return;
    }

    if (envelope.type === 'reject_subscription') {
      showWalltakerError('Walltaker rejected the websocket subscription.');
      return;
    }

    const data = envelope.message;
    if (!data) {
      return;
    }

    if (data.type === 'user') {
      handleWalltakerUserMessage(data);
      return;
    }

    if (!data.success) {
      showWalltakerError(
        `Server returned an error! <br>Check your server URL and link number! <br>[${data.why || 'Unknown error'}]`
      );
      return;
    }

    SetHidden('#rcenter-center');
    setNewPost(data);
  };

  socket.onerror = (error) => {
    console.error('Walltaker websocket error:', error);
  };

  socket.onclose = () => {
    console.log('Walltaker websocket closed');
    if (appState.walltakerSocket === socket) {
      appState.walltakerSocket = null;
      scheduleWalltakerReconnect(intent);
    }
  };
}

//reaction-data
const reactButttons = [
  {
    id: 'btn_hate',
    elem: 'tt_hate',
    txt: 'Hate it',
    reactID: 'disgust',
  },
  {
    id: 'btn_ok',
    elem: 'tt_ok',
    txt: 'Thanks',
    reactID: 'ok',
  },
  {
    id: 'btn_love',
    elem: 'tt_love',
    txt: 'Love it',
    reactID: 'horny',
  },
  {
    id: 'btn_cum',
    elem: 'tt_came',
    txt: 'I came',
    reactID: 'came',
  },
];

function Initialization() {
  appState.init = true;

  connectWalltakerSocket();
  /*uset setInterval instead of setTimeout? */
}

//start Checks for Updates when page loaded
window.onload = function () {
  if (settings.overrideURL) setCustomUrl(settings.overrideURL);
  else if (!appState.init) Initialization();

  console.log('window loaded!');
};

class UpdateLooper {
  static Canvas = null;
  static e6 = null;
  static Setter = null;
}

window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    console.log('loading properties');

    let realoadSetter = false;
    let reloadCanvas = false;

    //process wallpaper properties
    ProcessPropertyToSetting(
      properties,
      'server_url',
      () => {
        appState.lastLinkData = null;
        connectWalltakerSocket();
      },
      (settingName = 'serverURL')
    );

    ProcessPropertyToSetting(
      properties,
      'vid_volume',
      () => {},
      (settingName = 'volume')
    );

    ProcessPropertyToSetting(properties, 'linkID', (value) => {
      appState.lastUrl = '';
      appState.lastLinkData = null;
      connectWalltakerSocket();
    });

    ProcessProperty(properties, 'api_key', (value) => {
      if (SetApiKey(properties.api_key.value)) {
        reloadCanvas = true;
        appState.walltakerWatchedUser = null;
        watchSetterUser(appState.lastSetBy);
      }
    });

    ProcessPropertyToSetting(properties, 'objfit', () => {
      reloadCanvas = true;
    });
    ProcessPropertyToSetting(properties, 'videocontrols');
    ProcessPropertyToSetting(properties, 'autoplay');
    ProcessPropertyToSetting(properties, 'loop');
    ProcessPropertyToSetting(
      properties,
      'backg_color',
      () => {
        appState.reloadColors = true;
      },
      (settingName = 'background_color')
    );
    ProcessPropertyToSetting(
      properties,
      'text_color',
      () => {
        appState.reloadColors = true;
      },
      (settingName = 'textColor')
    );
    ProcessProperty(properties, 'area_maxWidth', (value) => {
      settings.maxAreaWidth = value + 'vw';
    });
    ProcessPropertyToSetting(
      properties,
      'font_size',
      () => {},
      (settingName = 'fontSize')
    );
    ProcessPropertyToSetting(
      properties,
      'set_by',
      () => {
        reloadCanvas = true;
      },
      (settingName = 'textPos')
    );
    ProcessPropertyToSetting(
      properties,
      'setterData',
      () => {
        appState.walltakerWatchedUser = null;
        watchSetterUser(appState.lastSetBy);
      },
      (settingName = 'showSetterData')
    );
    ProcessPropertyToSetting(
      properties,
      'setterLinks',
      () => {
        reloadCanvas = true;
      },
      (settingName = 'listSetterLinks')
    );
    ProcessPropertyToSetting(
      properties,
      'setterInfo',
      () => {
        reloadCanvas = true;
      },
      (settingName = 'setterInfoPos')
    );
    ProcessProperty(properties, 'reaction', (value) => {
      settings.reactPos = value;
      settings.responsePos = value;
      reloadCanvas = true;
    });

    ProcessPropertyToSetting(properties, 'zoom_w');
    ProcessPropertyToSetting(properties, 'zoom_h');
    ProcessPropertyToSetting(properties, 'canv_x');
    ProcessPropertyToSetting(properties, 'canv_y');

    ProcessPropertyToSetting(
      properties,
      'e6_name',
      () => {
        reloadCanvas = true;
        appState.e6States.overrideUpdate = true;
      },
      (settingName = 'e6_user')
    );
    ProcessPropertyToSetting(properties, 'e6_api', () => {
      reloadCanvas = true;
      appState.e6States.overrideUpdate = true;
    });

    let packs = Object.keys(reactions).sort(
      (a, b) => (packWeights[b] ?? 0) - (packWeights[a] ?? 0)
    );
    console.log('[[packs:]]' + packs.toString());

    if (SetReactionpacks(packs)) reloadCanvas = true;

    let customReactions = Array.from(
      { length: 6 },
      (_, i) => properties[`reaction${i + 1}`]?.value || ''
    );

    if (customReactions != reactions.customReactions) {
      console.log(customReactions);
      reactions.custom = customReactions;
      reloadCanvas = true;
    }

    ProcessPropertyToSetting(properties, 'scrollspeed', () => {
      reloadCanvas = true;
    });

    //-----------------------------------------------------------------------------------------------
    if (settings.overrideURL) {
      ChangeSettings();
      return;
    }

    if (reloadCanvas) {
      appState.overrideUpdate = true;
      if (appState.lastLinkData) setNewPost(appState.lastLinkData);
      else connectWalltakerSocket();
    } else ChangeSettings();

    if (appState.reloadColors) {
      ChangeSettings();
    }

    if (realoadSetter) watchSetterUser(appState.lastSetBy);
  },
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
function ProcessProperty(properties, propName, callback) {
  if (!propName?.trim()) {
    console.error(`Propertyname is empty!`);
    return false;
  }

  if (!Object.hasOwn(properties, propName)) {
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
function ProcessPropertyToSetting(
  properties,
  propName,
  callback = () => {},
  settingName = propName
) {
  if (!propName?.trim() || !settingName?.trim()) {
    console.error(`Property- or settingname is empty!`);
    return false;
  }

  if (!Object.hasOwn(settings, settingName)) {
    console.error(`Setting ${settingName} not found`);
    return false;
  }

  return ProcessProperty(properties, propName, (value) => {
    try {
      settings[settingName] = '' + value;
      console.log(
        `[prop]:${propName} → [setting]:${settingName}| value = ${value}`
      );
      callback(value);
    } catch (error) {
      console.error(
        `Error processing propertyToSetting ${propName} to ${settingName}:`,
        error
      );
    }
  });
}

function SetApiKey(apiKey) {
  settings.api_key = '' + apiKey?.trim();
  return true;
}

// returns true if the reaction packs have changed
function SetReactionpacks(packs) {
  console.log('setting reaction packs: ' + packs.toString());
  const oldPacks = [...appState.reactPacks];

  appState.reactPacks = Object.keys(reactions)
    .sort((a, b) => (packWeights[b] ?? 0) - (packWeights[a] ?? 0))
    .filter((packItem) => packs.includes(packItem));
  return JSON.stringify(oldPacks) !== JSON.stringify(appState.reactPacks);
}

function setCustomUrl(url) {
  disconnectWalltakerSocket();
  appState.lastUrl = url;
  ChangeSettings();
  console.log('custom url ' + settings.overrideURL);

  settings.showTooltips = false;
  setEvents();

  ChangeSettings();
}

//changes Settings mostly CSS stuff
function ChangeSettings() {
  appState.reloadColors = false;

  const color = settings.background_color + ' ' + appState.bOpacity;
  const css = `
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

  console.log('autoplay:' + (settings.autoplay == 'true'));
  console.log('loop:' + (settings.loop == 'true'));

  let bVid = document.getElementById('bVid');
  SetVideoSettings(bVid);
}

function SetVideoSettings(bVid) {
  if (!bVid) {
    console.error('[SetVideoSettings] element not found!');
    return;
  }

  if (appState.videoVolume === null) {
    const configuredVolume = Number(settings.volume);
    appState.videoVolume = Number.isFinite(configuredVolume)
      ? Math.min(1, Math.max(0, configuredVolume))
      : 1;
    appState.videoMuted = appState.videoVolume === 0;
  }

  bVid.controls = settings.videocontrols == 'full';
  bVid.volume = appState.videoVolume;
  bVid.muted = appState.videoMuted;
  bVid.defaultMuted = appState.videoMuted;
  bVid.autoplay = settings.autoplay == 'true';
  bVid.loop = settings.loop == 'true';
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

  let customColorAsCSS = '';

  //length is 3 for rgb values
  if (temp.length > 3) customColorAsCSS = 'rgba(' + rgb + ',' + temp[3] + ')';
  else customColorAsCSS = 'rgb(' + rgb + ')';

  return customColorAsCSS;
}

function clearBackground() {
  appState.bOpacity = '0';
  $('#bVid').attr('src', '');
  $('#bImg').attr('src', '');
}

function UpdatePostUrl(url) {
  if (!url?.trim()) {
    clearBackground();
    return;
  }

  appState.bOpacity = settings.background_opacity;

  const filetype = url.split('.').pop().toString().toLowerCase();
  if (['mp4', 'webm', 'ogg'].includes(filetype)) {
    //Handle video
    updateMedia('#bVid', url, '#bImg');
  } else {
    //Handle image
    preloadImage(url);
    updateMedia('#bImg', url, '#bVid');
  }
}

function preloadImage(url) {
  // Remove any existing temporary images
  while (document.getElementById('temp')) {
    $('#temp').remove();
  }

  // Create and append a hidden image element to preload the image
  const img = document.createElement('img');
  img.style.visibility = 'hidden';
  img.src = url;
  img.id = 'temp';
  document.body.appendChild(img);
}

function updateMedia(visibleSelector, url, hiddenSelector) {
  $(visibleSelector).attr('src', url);
  SetVisible(visibleSelector);

  SetHidden(hiddenSelector);
  $(hiddenSelector).attr('src', '');
}

function NewPost_ProcessSetBy(variables, data) {
  //Update appState.lastSetBy
  if (data?.set_by) {
    console.log(`appState.lastSetBy => ${data.set_by}`);
    if (appState.lastSetBy !== data.set_by) {
      appState.walltakerWatchedUser = null;
    }
    appState.lastSetBy = data.set_by;
  } else if (!appState.lastSetBy || appState.lastUrl != data.post_url_backup) {
    console.log('new wallpaer without setBy => anon');
    appState.walltakerWatchedUser = null;
    appState.lastSetBy = null;
  }

  if (!settings.textPos || settings.textPos == areaNames.na) {
    return;
  }

  // Add element for "set by" text
  variables[settings.textPos] += '<div><p id="setBy" class="text"></p></div>';
}

function NewPost_ProcessSetterData(variables) {
  if (
    settings.showSetterData !== 'true' ||
    !settings.setterInfoPos ||
    settings.setterInfoPos == areaNames.na
  ) {
    return;
  }

  // Add element for setter info text
  variables[settings.setterInfoPos] +=
    '<div id="SetterInfo" class="darkBackground"></div>';
}

function NewPost_ProcessReactionButtons(variables) {
  console.log('processReactionButtons');

  if (!settings.reactPos || settings.reactPos == areaNames.na) {
    return;
  }
  if (!WalltakerApi_.IsAPIKeyValid(settings.api_key)) {
    return;
  }

  const packs =
    appState.reactPacks.length > 0 ? appState.reactPacks : appState.reactPacks;

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
    .map((btn) =>
      GetReactionButton(btn.id, reacts[btn.reactID], btn.elem, btn.txt)
    )
    .join('');

  return `
		<div id="buttons">
			${buttons}
		</div>
	`;
}

function buildReactDrop(packs) {
  // Create the dropdown structure
  const reactDrop = `
		<div id="reactDrop">
			<button type="button" id="btn_reactDD">
				<p id="btn_reactDD_value"></p>
				<p id="btn_reactDD_arrow"><i class="fa-solid fa-chevron-down"></i></p>
			</button>
			<div id="reactDD">
				${buildScrollButton(
          'reactDD_scrollBtn_up',
          '<i class="fa-solid fa-caret-up fa-lg"></i>'
        )}
				<div id="reactDD_scroll">
					${buildReactOptions(packs)}
				</div>
				${buildScrollButton(
          'reactDD_scrollBtn_down',
          '<i class="fa-solid fa-caret-down fa-lg"></i>'
        )}
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
  return (
    '<a href="#" class="reactDD_litxt"></a>' + //empty reaction
    packs
      .flatMap((pack) => (packTexts = reactions[pack] || []))
      .filter((packText) => packText.trim())
      .map((packText) => `<a href="#" class="reactDD_litxt">${packText}</a>`)
      .join('\r\n')
  );
}

function NewPost_ProcessCurrentResponse(variables, data) {
  if (!settings.responsePos || settings.responsePos === areaNames.na) {
    return;
  }

  const hasResponse = data.response_type > '' || data.response_text > '';
  const response = `<span id="responseType">${
    reacts[data.response_type] ?? ' '
  }</span><span id="responseText">${data.response_text ?? ''}</span>`;

  // Append the response to the appropriate area
  variables[settings.responsePos] += `
		<div>
			<p id="reactText" class="text darkBackground" >${
        hasResponse ? response : ''
      }</p>
		</div>
	`;
}

function NewPost_ProcessE6(variables) {
  console.log('running newPost e6 method...');

  if (
    !settings.e6_Pos ||
    settings.e6_Pos === areaNames.na ||
    !settings.e6_user?.trim() ||
    !settings.e6_api?.trim()
  ) {
    return;
  }
  //'<p id="e6Infos" class="text"></p>';

  //welcome to the horny zone
  variables[settings.e6_Pos] += ` 
		<div id="e6Zone">
			<button id="addFav" disabled>${getAddFavHtml('loading')}</button>
		</div>
	`;
}

function hasPostChanged(data) {
  return (
    appState.lastUrl != data.post_url_backup ||
    data.response_text != appState.lastResponseText ||
    data.response_type != appState.lastResponseType
  );
}

function UpdateAppLinkState(data) {
  appState.lastUrl = data.post_url_backup;
  appState.lastResponseType = data.response_type;
  appState.lastResponseText = data.response_text;
}

function setNewPost(data) {
  if (settings.overrideURL) return;
  //Check for changes if false skip code
  //this is for perfomance (local & network)
  if (!data) return;
  appState.lastLinkData = data;

  var isSamePost = !hasPostChanged(data) && appState.overrideUpdate != true;
  if (isSamePost) return;

  //set in case override was ture
  appState.overrideUpdate = false;
  appState.e6States.overrideUpdate = true;

  console.log('Updating link data!');
  UpdatePostUrl(data.post_url_backup);

  //String variables for areas
  const variables = areas.reduce((acc, area) => ({ ...acc, [area]: '' }), {});

  NewPost_ProcessSetBy(variables, data);
  NewPost_ProcessSetterData(variables);
  NewPost_ProcessReactionButtons(variables);
  NewPost_ProcessCurrentResponse(variables, data);
  NewPost_ProcessE6(variables);

  //sets the html for each area with the coresponding variables
  areas
    .filter((area) => area != areaNames.na)
    .forEach((area) => {
      if (area == areaNames.cc) {
        return;
      }
      $('#' + area).html('');
      if (!variables[area]) {
        return;
      }
      $('#' + area).html(variables[area]);
    });

  setEvents();
  UpdateAppLinkState(data);
  ChangeSettings();
  watchSetterUser(data.set_by, true);
  e6_Update();
}

function GetReactionButton(id, emoji, ttId, tooltip) {
  return `
		<button type="button" id="${id}">
			${emoji}
			<p id="${ttId}" class="tooltipItem">${tooltip}</p>
		</button>
	`;
}

function setAddFavEvents() {
  updateClickEvent('#addFav', async function () {
    if ($(this).is(':disabled')) return;

    console.log('addFav clicked');
    $('#addFav').attr('disabled', true);
    if (settings.e6_user?.trim() > '' && settings.e6_api?.trim() > '') {
      appState.e6States.overrideUpdate = true;
      await E6Api.SetPostFavourite(
        settings.e6_api,
        settings.e6_user,
        appState.lastPostId
      );
      await e6_Update();
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

function setbVideoEvents() {
  const videoElement = document.getElementById('bVid');

  updateOnEvent('#bVid', 'loadeddata', function () {
    console.log('video loaded data');
    SetVisible('#bVid');
    SetHidden('#bImg');
    //if(settings["autoplay"] == "true")
    //elVid.play();
  });

  updateOnEvent('#bVid', 'volumechange', function () {
    appState.videoVolume = this.volume;
    appState.videoMuted = this.muted;
  });

  updateClickEvent('#bVid', function () {
    console.log('video clicked');
    if (settings.videocontrols === 'noUI')
      this.paused ? this.play() : this.pause();
  });
}

function setReactDropdownEvents() {
  updateClickEvent('#btn_reactDD', function () {
    console.log('reactDropDown clicked');
    if ($('#reactDD').css('visibility') === 'hidden') {
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

  $('.reactDD_litxt').each(function (event) {
    this.removeEventListener('click', () => reactDDButtonClickEvent(this));
    this.addEventListener('click', () => reactDDButtonClickEvent(this));
  });

  updateOnEvent('#reactDD_scroll', 'scroll', function () {
    HandleDDScrollBtns();
  });

  const scrollContainer = document.getElementById('reactDD_scroll');
  setupScrollButton(
    $('#reactDD_scrollBtn_up'),
    scrollContainer,
    -settings.scrollspeed
  );
  setupScrollButton(
    $('#reactDD_scrollBtn_down'),
    scrollContainer,
    settings.scrollspeed
  );
}

function reactDDButtonClickEvent(element) {
  console.log('reactDD_litxt clicked');

  $('#btn_reactDD_value').html(element.innerHTML);
  SetHidden('#reactDD');
  HideDDScrollbtns();
}

function setupScrollButton(button, scrollContainer, scrollspeed) {
  let scrollInterval = null;

  button.off('hover');
  button.hover(
    function () {
      scrollInterval = setInterval(function () {
        scrollContainer.scrollBy(0, scrollspeed);
      }, 10);
    },
    function () {
      clearInterval(scrollInterval);
    }
  );
}

function setReactButtonsEvents() {
  if (!settings.reactPos || settings.reactPos == areaNames.na) {
    return;
  }
  if (!WalltakerApi_.IsAPIKeyValid(settings.api_key)) {
    return;
  }

  reactButttons.forEach((btn) => {
    updateClickEvent('#' + btn.id, () => postReaction(btn.reactID));
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
    updateDynEvent('#LinksHeader', 'click', function () {
      console.log('#LinksHeader click spam prevention has triggered');
      if (appState.isLinksHeaderClicked) {
        return;
      }
      appState.isLinksHeaderClicked = true;

      appState.linksCollapsed = !appState.linksCollapsed;
      console.log(
        `LinksHeader clicked → collapsed = ${appState.linksCollapsed}`
      );
      $('#LinkTree').attr('hidden', appState.linksCollapsed);

      // Reset the flag after a short delay
      setTimeout(() => {
        appState.isLinksHeaderClicked = false;
      }, 100); // Adjust delay as needed
    });
  });
}

function updateOnEvent(elementName, event, callback = () => {}) {
  $(elementName).off(event);
  $(elementName).on(event, callback);
}

function updateClickEvent(elementName, callback = () => {}) {
  updateOnEvent(elementName, 'click', callback);
}

function updateDynEvent(elementName, event, callback = () => {}) {
  $(document).off(event, elementName);
  $(document).on(event, elementName, callback);
}

function SetVisibility(jqItemName, state) {
  $(jqItemName).css('visibility', state);
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
  if (!settings.showTooltips) {
    return;
  }
  $(jqItemName).off('mouseenter');
  $(jqItemName).mouseenter(function () {
    SetVisible(jqToolTipName);
  });

  $(jqItemName).off('mouseleave');
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
  const scrollBottom =
    scrollContainer.scrollHeight - scrollTop - scrollContainer.clientHeight;

  SetVisibility('#reactDD_scrollBtn_up', scrollTop == 0 ? 'hidden' : 'visible');
  SetVisibility(
    '#reactDD_scrollBtn_down',
    scrollBottom < 1 ? 'hidden' : 'visible'
  );
}

function toggleAttribute(elem, attName, value) {
  elem.hasAttribute(attName)
    ? elem.removeAttribute(attName)
    : elem.setAttribute(attName, value);
}

function isE6Enabled() {
  return (
    settings.e6_Pos &&
    settings.e6_Pos !== areaNames.na &&
    settings.e6_user &&
    settings.e6_api
  );
}

function hase6PostChanged(md5) {
  return (
    !appState.e6States.lastMd5 ||
    appState.e6States.lastMd5 != md5 ||
    appState.e6States.lastUser != settings.e6_user ||
    appState.e6States.lastApiKey != settings.e6_api ||
    appState.e6States.overrideUpdate == true
  );
}

async function e6_Update() {
  console.log(`Updating e6 data for user: ${settings.e6_user}`);
  // Early return if e6 is disabled
  if (!isE6Enabled()) {
    console.log('e6 is disabled, skipping update...');
    return;
  }

  console.log('getting md5 of last url ' + appState.lastUrl);
  const md5 = GetMd5(appState.lastUrl);
  console.log(`MD5 of last URL: ${md5}`);

  if (!hase6PostChanged(md5)) {
    console.log('e6 post has not changed, skipping update...');
    return;
  }
  //TODO: check if last and current md5 are the same
  appState.e6States.overrideUpdate = false;

  console.log('updating e6 userdata for: ' + settings.e6_user);
  try {
    const e6Data = await E6Api.GetPostInfo(
      md5,
      settings.e6_user,
      settings.e6_api
    );
    if (e6Data && e6Data.posts && e6Data.posts[0]) {
      setE6Info(e6Data.posts[0]);
    } else {
      console.log('No e6 data found, disabling UI...');
      //disable button
      $('#addFav').attr('disabled', true);
      $('#addFav').html(getAddFavHtml('noData'));
    }
  } catch (error) {
    console.error('Error updating e6 data:', error);
    //disavle button
    $('#addFav').attr('disabled', true);
    $('#addFav').html(error);
  }
}

function getAddFavHtml(state) {
  const addFavIcon = `fa-regular fa-star`;
  const isFavIcon = `fa-solid   fa-star`;
  const loadFavIcon = `fa-solid fa-spinner fa-spin-pulse fa-spin-reverse`;

  switch (state) {
    case 'loading':
      return `<i class="${loadFavIcon}"></i>`;
    case 'isFav':
      return `<i class="${isFavIcon} fav"></i>`;
    case 'addFav':
      return `<i class="${addFavIcon} addFav"></i>`;
    case 'noData':
      return `<i class="fa-solid fa-xmark"></i>`;
    case 'disabled':
      return `<i class="${addFavIcon} disabled"></i>`;
    default:
      return `<i class=""></i>`;
  }
}

function setE6Info(data) {
  console.log('setting e6 info');
  //enable button
  appState.e6States.lastMd5 = data.file.md5;
  appState.e6States.lastUser = settings.e6_user;
  appState.e6States.lastApiKey = settings.e6_api;
  let state = data.is_favorited ? 'isFav' : 'addFav';

  $('#addFav').attr('disabled', false);
  $('#addFav').html(getAddFavHtml(state));
  console.log(`[e6] Post ID: ${data.id}, Favorited: ${data.is_favorited}`);
  appState.lastPostId = data.id;
}

function proccessSetterSetBy(userData, username) {
  const friendStatus = `<i id="friendIcon" class="fa-solid fa-xs fa-heart ${userData?.friend ? '' : 'transparent '}"></i>`;
  const name = userData?.self ? 'you' : username || 'anon';
  const onlineStatus = `<i id="userOnlineIcon" class="fas fa-circle fa-pull-left fa-xs ${userData?.online ? 'online' : 'transparent'}"></i>`

  const userIcon = `<i id="userIcon" class="fa-solid fa-user userIcon"></i>`;
  const anonIcon = `<i id="anonIcon" class="fa-solid fa-user-secret userIcon"></i>`;

  const showText = false;

  const icon = userIcon || anonIcon;

  $('#setBy').html(
    `${icon}${friendStatus}${
      showText ? ' set_by:' : ''
    } ${name}${onlineStatus}`
  );
}

function processSetterLinkInfos(userData) {
  if (!settings.setterInfoPos || settings.setterInfoPos == areaNames.na) return;
  if (!userData || !userData.links) return;
  const setterElement = $('#SetterInfo').html('');

  var elInfo = $(`
		<p id="LinksHeader" class='text'> 
			<i id="linkIcon" class="fas fa-link fa-lg"></i> 
			<span id="linkCounter" class="counter">${userData.links.length}</span>
			<i id="messageIcon" class="fa-solid fa-message transparent"></i>
			<span id="messageCounter" class="counter" hidden></span>
		</p>`);

  // clear element and edd info text
  setterElement.append(elInfo);

  const treeElement = $(
    `<ul id="LinkTree" ${appState.linksCollapsed ? 'hidden' : ''}></ul>`
  );
  setterElement.append(treeElement);

  //add link list and count messages and types
  const { messageCounter, messageTypes } = userData.links.reduce(
    (acc, link) => {
      const symbol = reacts[link.response_type] ?? '';
      const response = link.response_text ?? '';

      if (symbol || response) acc.messageCounter++;
      if (symbol)
        acc.messageTypes[symbol] = (acc.messageTypes[symbol] || 0) + 1;

      const linkElement = $(`
				<li class="setterLink">
					<div class="text linkRow">
						<i class="fas fa-circle link-circle ${
              link.online ? 'online' : 'transparent'
            }"></i>
						<span class="linkNumber">
							<span">${link.id}</span>
						</span>
						<p class="linkText" ><span class="text">${symbol} ${response}</span></p>
					</div>
				</li>`);
      treeElement.append(linkElement);
      return acc;
    },
    { messageCounter: 0, messageTypes: {} }
  );

  if (messageCounter > 0) {
    let msg = '';
    if (Object.keys(messageTypes).length > 1)
      msg = messageCounter > 1 ? messageCounter + '|' : '';

    Object.entries(messageTypes)
      .filter(([key, value]) => key > '')
      .map(([key, value]) => {
        msg += `${value > 1 ? value : ''}${key}`;
      })
      .join(' ');

    $('#messageCounter').html(msg);
    $('#messageCounter').attr('hidden', false);

    //$("#messageIcon").attr("hidden", false);
    $('#messageIcon').removeClass('transparent');
  }
}

function GetMd5(url) {
  return url.split('/').pop().split('.')[0];
}

//sends POST to Website and passes data to setNewPost
function postReaction(reactType) {
  const txt =
    appState.reactPacks.length > 0 ? $('#btn_reactDD_value').html() : '';
  WalltakerApi.PostReaction(
    settings.linkID,
    reactType,
    txt,
    settings.api_key,
    (response, data) => {
      appState.overrideUpdate = true;
      if (data?.success) setNewPost(data);
    }
  );

  console.log('ractPacks:' + appState.reactPacks.length);
}

