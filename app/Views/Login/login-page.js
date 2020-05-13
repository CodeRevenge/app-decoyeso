var LoginViewModel = require("./login-view-model");
var loginViewModel = new LoginViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
var Toast = require("nativescript-toast");

function pageLoaded(args) {
	var page = args.object;
	page.bindingContext = loginViewModel;
}

exports.Login = (args) => {
	console.log(appSettings.getString("token"));
	const login = args.object;
	const loginParent = login.parent;

	const nickname = loginParent.getViewById("nickname");
	const password = loginParent.getViewById("password");

	const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/login.php";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText)
			const response = JSON.parse(this.responseText);
			if (response.status === "OK") {
				dialogs
					.alert({
						title: "Sesión ",
						message: `${response.message}`,
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

						appSettings.setString("token", response.jwt);
						appSettings.setBoolean("auth", true);
						let toast = Toast.makeText(response.message).show();

						args.object.page.frame.navigate(navegation);
					});
			} else if (response.status === "WARNING") {
				dialogs.alert({
					title: "Error",
					message: `${response.message}`,
					okButtonText: "Ok",
				});
			} else {
				dialogs.alert({
					title: "Error",
					message: `Sucedio un error inesperado. ${response}`,
					okButtonText: "Ok",
				});
			}
		}
	};
	let URI = encodeURI(
		`${conectionLink}?nickname=${nickname.text}&password=${password.text}`
	);

	xhttp.open("GET", URI, true);
	xhttp.send();
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
