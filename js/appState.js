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
	linksCollapsed: true,
    isLinksHeaderClicked: false,
	e6States: {
        lastMd5: null,
        lastUser: null,
        lastApiKey: null,
		overrideUpdate: false,
    },
};