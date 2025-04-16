/** @format */

//Global variables
const appState = {
	lastUrl: "",
	lastSetBy: "",
	lastResponseType: "",
	lastResponseText: "",
	lastCanvas: "",
	lastPostId: "",
	overrideUpdate: false,
	reloadColors: true,
	reactPacks: [...settings.reactPacks],
	bOpacity: settings.background_opacity,
	linksCollapsed: true,
	isLinksHeaderClicked: false,
	init: false,
	e6States: {
		lastMd5: null,
		lastUser: null,
		lastApiKey: null,
		overrideUpdate: false,
	},
};
