const AdminEmpViewModel = require("./admin-emp-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var adminEmpProdViewModel = new AdminEmpViewModel();

const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
	createActivityIndicator,
} = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = adminEmpProdViewModel;

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink =
			appSettings.getString("backHost") + "empleado_info.php";

		await fetch(conectionLink, {
			method: "GET", // or 'PUT'
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				console.log("JSON User: " + JSON.stringify(json));
				if (json.status === "OK") {
					indicator.busy = false;
					main.removeChild(indicator);
					page.getViewById("info").visibility = "visible";
					page.getViewById("options").visibility = "visible";
				} else if (json.status === "TOKEN_EXPIRED") {
					dialogs
						.alert({
							title: "Sesión expirada",
							message: "La sesión ha expirado, vuelva a iniciar sesión.",
							okButtonText: "Ok",
						})
						.then(() => {
							deleteSesion();
							const navegation = {
								moduleName: "Views/login/login-page",
							};
							Frame.topmost().navigate(navegation);
						});
					return 0;
				} else {
					message = json.eMessage;
					dialogs
						.alert({
							title: "Error",
							message: `Sucedio un error inesperado. ${verifiedToken.message}`,
							okButtonText: "Ok",
						})
						.then(() => {
							deleteSesion();
							console.log(appSettings.getString("token"));
							const navegation = {
								moduleName: "Views/login/login-page",
							};
							Frame.topmost().navigate(navegation);
						});
					return 0;
				}
			})
			.then((data) => data)
			.catch((err) => {
				console.error("Petición fallida: ", err);
			});
	} else if (verifiedToken.id === 1) {
		dialogs
			.alert({
				title: "Sesión expirada",
				message: "La sesión ha expirado, vuelva a iniciar sesión.",
				okButtonText: "Ok",
			})
			.then(() => {
				deleteSesion();
				const navegation = {
					moduleName: "Views/login/login-page",
				};
				Frame.topmost().navigate(navegation);
			});
	} else if (verifiedToken.id === 400) {
		dialogs.alert({
			title: "Error",
			message: `Sucedio un error inesperado. ${verifiedToken.message}`,
			okButtonText: "Ok",
		});
	} else {
		dialogs
			.alert({
				title: "Error",
				message: `Sucedio un error inesperado. ${verifiedToken.message}`,
				okButtonText: "Ok",
			})
			.then(() => {
				deleteSesion();
				console.log(appSettings.getString("token"));
				const navegation = {
					moduleName: "Views/login/login-page",
				};
				try {
					Frame.topmost().navigate(navegation);
				} catch (e) {
					console.error(e);
				}
			});
	}
};

exports.btnRegister = (args) => {
	const navegation = {
		moduleName: "Views/users/register/register-page",
		transition: {
			name: "slide",
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch (err) {
		console.error(err);
	}
};

exports.userList = (args) => {
	const navegation = {
		moduleName: "Views/users/user-list/user-list-page",
		transition: {
			name: "slide",
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch (err) {
		console.error(err);
	}
};

exports.backButton = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
