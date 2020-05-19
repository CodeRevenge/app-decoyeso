var { Frame } = require("tns-core-modules/ui/frame");
const appSettings = require("tns-core-modules/application-settings");
const { ActivityIndicator } = require("tns-core-modules/ui/activity-indicator");

exports.checkStatus = (response) => {
	if (response.status >= 200 && response.status < 300) {
		// console.log("CHECK STATUS: Status " + response.status);
		return response;
	} else {
		console.log("CHECK STATUS: Status " + response.status);
		var error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
};

exports.parseJSON = (body) => {
	return body.json();
};

const _verifyToken = async () => {
	const conectionLink = encodeURI(
		appSettings.getString("backHost") + "sesion_activa.php"
	);
	console.log("")
	return await fetch(conectionLink, {
		method: "GET", // or 'PUT'
		headers: {
			token: appSettings.getString("token"),
		},
	})
		.then(this.checkStatus)
		.then(this.parseJSON)
		.then((data) => {
			if (data.status === "OK") {
				return {
					status: true,
					id: 0,
					role: data.role,
					message: "Sesión valida",
				};
			} else if (data.status === "TOKEN_EXPIRED") {
				return {
					status: false,
					id: 1,
					role: data.role,
					message: "La sesión ha expirado, vuelva a inicar sesión",
				};
			} else {
				message = data.eMessage;
				return {
					status: false,
					id: 2,
					role: data.role,
					message: `Sucedio un error inesperado. ${message}`,
				};
			}
		})
		.then((data) => data)
		.catch((err) => {
			console.error("Petición fallida (Token Ver): ", err);
			return {
				status: false,
				id: 3,
				message: err,
			};
		});
};

exports.verifyToken = async () => {
	return await _verifyToken();
};

exports.deleteSesion = () => {
	appSettings.remove("token");
	appSettings.remove("auth");
};

exports.createActivityIndicator = () => {
	const indicator = new ActivityIndicator();
	indicator.busy = true;
	indicator.width = 100;
	indicator.height = 100;

	return indicator;
};
