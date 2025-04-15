function setEvents() {
	jQuery(document).ready(function ($) {
		setAddFavEvents();
		setbImgEvents();
		setbVideoEvents();
		setReactDropdownEvents();
		setReactButtonsEvents();
		
		 // Use event delegation for dynamically created #LinksHeader
		 $(document).on('click', '#LinksHeader', function () {
			 appState.linksCollapsed = !appState.linksCollapsed;
			 console.log(`LinksHeader clicked → collapsed = ${appState.linksCollapsed}`);
            $('#LinkTree').attr("hidden", appState.linksCollapsed);
        });
	});
}