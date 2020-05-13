var { Frame } = require("tns-core-modules/ui/frame");
const appSettings = require("tns-core-modules/application-settings");

const _verifyToken = async () => {
	const conectionLink =
		"http://ppicucei.000webhostapp.com/decoyeso/sesion_activa.php";

	return await fetch(conectionLink, {
		method: "GET", // or 'PUT'
		headers: {
			TOKEN: appSettings.getString("token"),
		},
	})
		.then(async (resp) => {
			if (resp.ok) {
				return await resp.json();
			}
		})
		.then((json) => {
			console.log("JSON: " + JSON.stringify(json));
			if (json.status === "OK") {
				return {
					status: true,
					id: 0,
					role: json.role,
					message: "Sesión valida",
				};
			} else if (json.status === "TOKEN_EXPIRED") {
				return {
					status: false,
					id: 1,
					role: json.role,
					message: "La sesión ha expirado, vuelva a inicar sesión",
				};
			} else {
				message = json.eMessage;
				return {
					status: false,
					id: 2,
					role: json.role,
					message: `Sucedio un error inesperado. ${message}`,
				};
			}
		})
		.then((data) => data)
		.catch((err) => {
			console.error("Petición fallida: ", err);
		});
};

exports.verifyToken = async () => {
	return await _verifyToken();
};

exports.deleteSesion = () => {
	appSettings.remove("token");
	appSettings.remove("auth");
};
