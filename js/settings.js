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

const MIN_INTERVAL_MS = 8500;
