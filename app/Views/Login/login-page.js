var LoginViewModel = require("./login-view-model");
var loginViewModel = new LoginViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const Toast = require("nativescript-toast");
const { Frame } = require("tns-core-modules/ui/frame");
const {
	checkStatus,
	createActivityIndicator,
	deleteSesion,
	parseJSON,
} = require("../../functions");

function pageLoaded(args) {
	var page = args.object;
	page.bindingContext = loginViewModel;
	deleteSesion();
}

exports.Login = async (args) => {
	const login = args.object;
	const loginParent = login.parent;

	const nickname = loginParent.getViewById("nickname");
	const password = loginParent.getViewById("password");

	let status = true;
	if (nickname.text === "") {
		nickname.className += " input-invalid";
		status = false;
	}
	if (password.text === "") {
		password.className += " input-invalid";
		status = false;
	}

	if (!status) return;

	const main = login.page.getViewById("main");
	const loginSL = main.getViewById("login");
	const indicator = createActivityIndicator();
	main.removeChildren();
	main.addChild(indicator);

	const conectionLink = appSettings.getString("backHost") + "login.php";
	let URI = encodeURI(
		`${conectionLink}?nickname=${nickname.text}&password=${password.text}`
	);

	await fetch(URI)
		.then(checkStatus)
		.then(parseJSON)
		.then((json) => {
			if (json.status === "OK") {
				dialogs
					.alert({
						title: "Sesión ",
						message: `${json.message}`,
						okButtonText: "Ok",
					})
					.then(() => {
						const navegation = {
							moduleName: "Views/main/main-page",
							clearHistory: true,
							transition: {
								name: "slide",
							},
						};

						appSettings.setString("token", json.jwt);
						appSettings.setBoolean("auth", true);
						console.log("Token:" + appSettings.getString("token"));
						let toast = Toast.makeText(json.message).show();
						indicator.busy = false;
						try {
							Frame.topmost().navigate(navegation);
						} catch(err) {
							console.error(err);
						}
						
					});
			} else if (json.status === "WARNING") {
				dialogs
					.alert({
						title: "Error",
						message: `${json.message}`,
						okButtonText: "Ok",
					})
					.then(() => {
						indicator.busy = false;
						main.removeChild(indicator);
						main.addChild(loginSL);
					});
			} else {
				dialogs
					.alert({
						title: "Error",
						message: `Sucedio un error inesperado. ${json}`,
						okButtonText: "Ok",
					})
					.then(() => {
						indicator.busy = false;
						main.removeChild(indicator);
						main.addChild(loginSL);
					});
			}
		})
		.catch((err) => {
			console.log("Petición fallida (Login): ", err);

			dialogs
				.alert({
					title: "Error",
					message: `${err}`,
					okButtonText: "Ok",
				})
				.then(() => {
					indicator.busy = false;
					main.removeChild(indicator);
					main.addChild(loginSL);
				});
		});
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
	} catch(err) {
		console.error(err);
	}
};

exports.pageLoaded = pageLoaded;
