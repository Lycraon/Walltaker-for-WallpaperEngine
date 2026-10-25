/** @format */

//Global variables
const appState = {
	lastUrl: "",
	lastSetBy: "",
	lastResponseType: "",
	lastResponseText: "",
	lastCanvas: "",
	lastLinkData: null,
	lastPostId: "",
	overrideUpdate: false,
	reloadColors: true,
	reactPacks: [...settings.reactPacks],
	bOpacity: settings.background_opacity,
	videoVolume: null,
	videoMuted: null,
	linksCollapsed: true,
	isLinksHeaderClicked: false,
	init: false,
	walltakerSocket: null,
	walltakerSocketReconnect: null,
	walltakerSocketReconnectDelay: 5000,
	walltakerSocketIntent: null,
	walltakerSubscriptionIdentifier: null,
	walltakerWatchedUser: null,
	e6States: {
		lastMd5: null,
		lastUser: null,
		lastApiKey: null,
		overrideUpdate: false,
	},
};
