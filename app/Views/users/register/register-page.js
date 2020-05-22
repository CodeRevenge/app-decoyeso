var RegisterViewModel = require("./register-view-model");
var registerViewModel = new RegisterViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const {
	verifyToken,
	deleteSesion,
	createActivityIndicator,
	parseJSON,
	checkStatus,
} = require("../../../functions");

// exports.pageLoaded = (args) => {
//     var page = args.object;
// }

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = registerViewModel;

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);
	const verifiedToken = await verifyToken();
	if (verifiedToken.id === 0 && verifiedToken.role >= 2) {
		const conectionLink =
			appSettings.getString("backHost") + "request_role_names.php";
		let URI = encodeURI(`${conectionLink}`);

		await fetch(URI, {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				console.log("JSON Produc: " + JSON.stringify(json));
				if (json.status === "OK") {
					const picker = main.getViewById("rolPicker");

					const obsProducts = new ObservableArray();
					for (let i in json.data) {
						let item;
						try {
							item = {
								id: json.data[i].id,
								name: value.data[i].name,
							};
						} catch (e) {
							console.error(e);
						}

						obsProducts.push(item);
					}

					picker.items = obsProducts.map((v) => v.name);
					main.getViewById("role-sel");
					main.removeChild(indicator);
					main.getViewById("title").visibility = "visible";
					main.getViewById("details").visibility = "visible";
				} else if (json.status === "WARNING") {
					dialogs.alert({
						title: "Error",
						message: `${json.message}`,
						okButtonText: "Ok",
					});
				} else {
					dialogs.alert({
						title: "Error",
						message: `Sucedio un error inesperado. ${json.message}`,
						okButtonText: "Ok",
					});
				}
			})
			.catch((error) => console.error(error));
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
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
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
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
			});
	}
};

exports.Register = async (args) => {
	const login = args.object;
	const loginParent = login.parent;
	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);
	const verifiedToken = await verifyToken();
	if (verifiedToken.id === 0 && verifiedToken.role >= 2) {
		const curp = loginParent.getViewById("curp");
		const nickname = loginParent.getViewById("nickname");
		const firstName = loginParent.getViewById("firstName");
		const lastName = loginParent.getViewById("lastName");
		const password = loginParent.getViewById("password");
		const rep_password = loginParent.getViewById("rep_password");
		const birthDay = loginParent.getViewById("birthDay");
		const addres = loginParent.getViewById("addres");
		const phone = loginParent.getViewById("phone");
		const rol = loginParent.getViewById("rolPicker");

		if (password.text !== rep_password.text) {
			password.className += " input-invalid";
			rep_password.className += " input-invalid";

			dialogs.alert({
				title: "Las contraseñas no coinciden",
				message: `Verifique que las contraseñas coincidan.`,
				okButtonText: "Ok",
			});

			return;
		}

		let replace = "input-invalid";

		password.className = password.className.replace(replace, "");
		rep_password.className = rep_password.className.replace(replace, "");
		curp.className = curp.className.replace(replace, "");
		nickname.className = nickname.className.replace(replace, "");

		const conectionLink =
			appSettings.getString("backHost") + "alta_empleado.php";

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				const response = JSON.parse(this.responseText);
				if (response.status === "OK") {
					dialogs
						.alert({
							title: "Nuevo Usuario",
							message: `Usuario registrado`,
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

							args.object.page.frame.navigate(navegation);
						});
				} else if (response.status === "EXIST_ERROR") {
					if (response.errorCode === 1) {
						curp.className += " input-invalid";

						dialogs.alert({
							title: "CURP Invalido",
							message: `El CURP: ${curp} ya existe.`,
							okButtonText: "Ok",
						});

						return;
					} else if (response.errorCode === 2) {
						nickname.className += " input-invalid";

						dialogs.alert({
							title: "Nombre de usuario invalido",
							message: `El nombre de usuario: ${nickname} ya existe.`,
							okButtonText: "Ok",
						});
					}
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
			`${conectionLink}?curp=${curp.text}&nickname=${nickname.text}&` +
				`pw=${password.text}&nombre=${firstName.text}&apellido=${lastName.text}&` +
				`nacimiento=${birthDay.year}-${birthDay.month}-${birthDay.day}` +
				`&direccion=${addres.text}&telefono=${phone.text}&rol=${rol.name.selectedIndex + 1}`
		);
		console.log(URI);
		xhttp.open("GET", URI, true);
		xhttp.send();
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
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
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
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
			});
	}
};

exports.Cancel = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
