var LoginViewModel = require("./login-view-model");
var loginViewModel = new LoginViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const Toast = require("nativescript-toast");
const { Frame } = require("tns-core-modules/ui/frame");
const { ActivityIndicator } = require("tns-core-modules/ui/activity-indicator");
const { checkStatus } = require("../../functions");

function pageLoaded(args) {
	var page = args.object;
	page.bindingContext = loginViewModel;
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
	const indicator = new ActivityIndicator();
	indicator.busy = true;
	indicator.width = 100;
	indicator.height = 100;

	main.removeChildren();
	main.addChild(indicator);

	const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/login.php";
	let URI = encodeURI(
		`${conectionLink}?nickname=${nickname.text}&password=${password.text}`
	);

	await fetch(URI)
		.then(checkStatus)
		.then((resp) => resp.json())
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
						let toast = Toast.makeText(json.message).show();

						args.object.page.frame.navigate(navegation);
					});
			} else if (json.status === "WARNING") {
				dialogs.alert({
					title: "Error",
					message: `${json.message}`,
					okButtonText: "Ok",
				});
			} else {
				dialogs.alert({
					title: "Error",
					message: `Sucedio un error inesperado. ${json}`,
					okButtonText: "Ok",
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
					main.addChild(loginSL);
				});
		});

	// var xhttp = new XMLHttpRequest();
	// xhttp.onreadystatechange = function () {
	// 	if (this.readyState == 4 && this.status == 200) {
	// 		console.log(this.responseText);
	// 		const response = JSON.parse(this.responseText);
	// 		if (response.status === "OK") {
	// 			dialogs
	// 				.alert({
	// 					title: "Sesión ",
	// 					message: `${response.message}`,
	// 					okButtonText: "Ok",
	// 				})
	// 				.then(() => {
	// 					const navegation = {
	// 						moduleName: "Views/main/main-page",
	// 						clearHistory: true,
	// 						transition: {
	// 							name: "slide",
	// 						},
	// 					};

	// 					appSettings.setString("token", response.jwt);
	// 					appSettings.setBoolean("auth", true);
	// 					let toast = Toast.makeText(response.message).show();

	// 					args.object.page.frame.navigate(navegation);
	// 				});
	// 		} else if (response.status === "WARNING") {
	// 			dialogs.alert({
	// 				title: "Error",
	// 				message: `${response.message}`,
	// 				okButtonText: "Ok",
	// 			});
	// 		} else {
	// 			dialogs.alert({
	// 				title: "Error",
	// 				message: `Sucedio un error inesperado. ${response}`,
	// 				okButtonText: "Ok",
	// 			});
	// 		}
	// 	} else {
	// 		// indicator.busy = false;
	// 		main.addChild(loginSL);
	// 	}
	// };
	// let URI = encodeURI(
	// 	`${conectionLink}?nickname=${nickname.text}&password=${password.text}`
	// );

	// xhttp.open("GET", URI, true);
	// xhttp.send();
};

exports.btnRegister = (args) => {
	const navegation = {
		moduleName: "Views/register/register-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
};

exports.pageLoaded = pageLoaded;
