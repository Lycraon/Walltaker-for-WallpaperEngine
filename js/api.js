class REST_API {
	constructor(url) {
		this.url = url;
	}

	/**
	 * Makes an HTTP request to the specified endpoint with the given options.
	 *
	 * @param {string} endpoint - The API endpoint to send the request to.
	 * @param {string} [method="GET"] - The HTTP method to use for the request (e.g., "GET", "POST").
	 * @param {Object} [headers={}] - An object representing the headers to include in the request.
	 * @param {string} [queryParams={}] - Query parameters to append to the endpoint URL.
	 * @param {Object|null} [body=null] - The request body to send, if applicable (will be stringified).
	 * @param {Object|null} [data=null] - Additional data to send with the request.
	 * @param {Function} [onSuccess=() => {}] - Callback function to execute on a successful response.
	 * @param {Function} [onError=() => {}] - Callback function to execute on an error response.
	 * @returns {Promise<Response>} - A promise that resolves to the fetch API Response object.
	 * @throws {Error} - Throws an error if the request fails or the response is not OK.
	 */
	static async Request(
		url,
		endpoint,
		method = "GET",
		headers = {},
		queryParams = null,
		body = null,
		data = null,
		onSuccess = () => {},
		onError = () => {}
	) {
		let queryString = queryParams ? "?" + $.param(queryParams) : "";

		const requestUrl = `${url}${endpoint}${queryString}`;

		const options = {
			url: requestUrl,
			method: method,
			headers: headers,
			crossDomain: true,
			dataType: "json",
			success: (data, textStatus, jqXHR) => {
				console.log(`Request to ${requestUrl} succeeded.`);
				onSuccess(textStatus, data);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.error(
					`Error during API request to ${requestUrl}:`,
					textStatus,
					errorThrown
				);
				onError(errorThrown);
			},
		};

		if (data) {
			options.data = JSON.stringify(data);
			options.contentType = "application/json";
		}

		if (body) {
			options.data = JSON.stringify(body);
			options.contentType = "application/json";
		}

		console.log(`Making ${method} request to ${requestUrl}`);

		return new Promise((resolve, reject) => {
			$.ajax(options)
				.done((response) => resolve(response))
				.fail((jqXHR, textStatus, errorThrown) =>
					reject(
						new Error(
							`API request failed: ${textStatus} ${errorThrown.toString()}`
						)
					)
				);
		});

		/*const options = {
			method,
			headers,
		};

		if (body) {
			options.body = JSON.stringify(body);
		}
	
		console.log(`Making ${method} request to ${requestUrl}`);
	
		try {
			const response = await fetch(requestUrl, options);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.statusText} }`);
			}
			onSuccess(response,data);
			return response;
		} catch (error) {
			console.error(`Error during API request to ${requestUrl}:`, error);
			onError(error);
			throw error;
		}*/
	}

	async Request(
		endpoint,
		method = "GET",
		headers = {},
		queryParams = null,
		body = null,
		data = null,
		onSuccess = () => {},
		onError = () => {}
	) {
		return await REST_API.Request(
			this.url,
			endpoint,
			method,
			headers,
			queryParams,
			body,
			data,
			onSuccess,
			onError
		);
	}

	async GetJson_Request(
		endpoint,
		method = "GET",
		headers = {},
		queryParams = null,
		body = null,
		onSuccess = () => {},
		onError = () => {}
	) {
		return await this.Request(
			endpoint,
			method,
			headers,
			queryParams,
			body,
			onSuccess,
			onError
		);
	}
}

class E6Api_ {
	static url = "https://e621.net";
	static auth = {
		username: null,
		api: null,
	};

	static AppInfo;
	static clientHeaders;
	REST_API = new REST_API(E6Api_.url);

	constructor(AppInfo) {
		console.log("setting up e6 api " + AppInfo.name + " " + AppInfo.version);

		this.AppInfo = AppInfo;
		this.clientHeaders = {
			"User-Agent": `${AppInfo.nameLong}/${AppInfo.version} (by Lycraon)`,
			"_client": `${AppInfo.nameLong}/${AppInfo.version} (by Lycraon)`,
			"Client-Name": AppInfo.nameLong,
			"Client-Version": AppInfo.version,
			"Client-Author": "lycraon",
		};
	}

	getHeaders(username, apiKey) {
		return {
			...this.clientHeaders,
			Authorization: "Basic " + btoa(`${username}:${apiKey}`),
		};
	}

	async GetPostInfo(md5, username, api) {
		console.log(`Fetching data for post (md5): ${md5}`);
		try {
			let json = await this.Request("/posts.json", "GET", username, api, null, {
				limit: 1,
				tags: "md5:" + md5,
			});
			return json;
		} catch (error) {
			console.error("Failed to fetch e6 post info:", error);
			return null;
		}
	}

	//TODO: response code 422(unprocessable contents) if post is already favorited
	async SetPostFavourite(api, username, postId) {
		if (!postId?.toString().trim()) {
			console.error("Tried to set post as favorite, but post ID was empty.");
			return;
		}

		try {
			await this.Request(
				"/favorites.json",
				"post",
				username,
				api,
				{},
				{ post_id: postId }
			);
		} catch (error) {
			console.error("Failed to set post as favorite:", error);
		}
		console.log(`Post ${postId} set as favorite`);
	}

	async Request(
		endpoint,
		method = "GET",
		username,
		api,
		body = null,
		params = {}
	) {
		console.log(`e6_ApiRequest`);

		if (!username?.trim() || !api?.trim()) {
			console.error(
				"e6_ApiRequest was called but username or api key was empty, skipping fetch"
			);
			return null;
		}

		const headers = this.getHeaders(username, api);
		let response = await this.REST_API.GetJson_Request(
			endpoint,
			method,
			headers,
			params,
			body
		);
		return response;
	}
}

class WalltakerApi_ {
	static API_KEY_LENGTH = 8;
	static DEFAULT_SERVER_URL = "https://walltaker.joi.how";
	static url = WalltakerApi_.GetApiUrl(WalltakerApi_.DEFAULT_SERVER_URL);

	static AppInfo;
	static clientHeaders;

	REST_API = new REST_API(WalltakerApi_.url);

	constructor(AppInfo) {
		console.log("setting up wt api " + AppInfo.name + " " + AppInfo.version);

		this.AppInfo = AppInfo;

		this.clientHeaders = {
			[AppInfo.name]: AppInfo.version,
		};
	}

	static NormalizeServerUrl(url) {
		const fallback = WalltakerApi_.DEFAULT_SERVER_URL;
		const rawUrl = url?.trim() || fallback;

		try {
			const parsed = new URL(rawUrl);
			parsed.pathname = parsed.pathname.replace(/\/+$/, "");
			parsed.search = "";
			parsed.hash = "";
			return parsed.toString().replace(/\/+$/, "");
		} catch (error) {
			console.error("Invalid Walltaker server URL, using default:", error);
			return fallback;
		}
	}

	static GetApiUrl(serverUrl) {
		return `${WalltakerApi_.NormalizeServerUrl(serverUrl)}/api`;
	}

	static GetCableUrl(serverUrl) {
		const baseUrl = WalltakerApi_.NormalizeServerUrl(serverUrl);
		const cableUrl = new URL(`${baseUrl}/cable`);
		cableUrl.protocol = cableUrl.protocol === "http:" ? "ws:" : "wss:";
		return cableUrl.toString();
	}

	SetServerUrl(serverUrl) {
		this.REST_API.url = WalltakerApi_.GetApiUrl(serverUrl);
	}

	async Request(
		endpoint,
		method = "GET",
		queryParams = {},
		body = null,
		data = null,
		onSuccess = () => {},
		onError = () => {}
	) {
		return await this.REST_API.Request(
			endpoint,
			method,
			this.clientHeaders,
			queryParams,
			body,
			data,
			onSuccess,
			onError
		);
	}

	async PostReaction(
		linkID,
		reactType,
		reactText,
		apiKey,
		onSuccess = () => {},
		onError = () => {}
	) {
		if (!WalltakerApi_.IsAPIKeyValid(apiKey)) {
			console.error("Can't post reaction API-key is invalid!");
			return;
		}
		console.log(
			"Posting reaction (" +
				reactType +
				',"' +
				reactText +
				'") to Link ' +
				linkID
		);

		let data = {
			api_key: apiKey,
			type: reactType.toString(),
			text: reactText,
		};

		await this.Request(
			`/links/${linkID}/response.json`,
			"POST",
			null,
			null,
			data,
			onSuccess,
			onError
		);
	}

	static IsAPIKeyValid(apiKey) {
		apiKey = apiKey?.trim();

		return apiKey?.length === this.API_KEY_LENGTH;
	}
}
