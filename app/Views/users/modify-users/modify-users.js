var ModifyUsersViewModel = require("./modify-users-model");
var modifyUsersViewModel = new ModifyUsersViewModel();
const appSettings = require("tns-core-modules/application-settings");
const dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
var { ListPicker } = require("tns-core-modules/ui/list-picker");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
	createActivityIndicator,
} = require("../../../functions");

let user;
let userGo;

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = modifyUsersViewModel;
	const verifiedToken = await verifyToken();

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const details = page.getViewById("details");
	const title = page.getViewById("title");
	const buttons = page.getViewById("buttons");

	if (verifiedToken.status) {
		user = page.navigationContext.id;
		const conectionLink =
			appSettings.getString("backHost") + "empleado_info.php?id=" + user;

		console.log(conectionLink);

		await fetch(conectionLink, {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				if (json.status === "OK") {
					indicator.busy = false;
					main.removeChild(indicator);
					const userData = json.data;
					modifyUsersViewModel.set("CURP", userData.CURP);
					modifyUsersViewModel.set("nickname", userData.nickname);
					modifyUsersViewModel.set("firstname", userData.firstname);
					modifyUsersViewModel.set("lastname", userData.lastname);
					modifyUsersViewModel.set("address", userData.addres);
					modifyUsersViewModel.set("phone", userData.phone);
					userGo = userData;
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
								clearHistory: true,
							};
							Frame.topmost().navigate(navegation);
						});
					return 0;
				} else {
					message = json.eMessage;
					dialogs.alert({
						title: "Error",
						message: `Sucedio un error inesperado. ${json.message}`,
						okButtonText: "Ok",
					});

					return 0;
				}
			})
			.then((data) => data)
			.catch((err) => {
				console.error("Petición fallida (Main): ", err);
				dialogs.alert({
					title: "Error",
					message: `Sucedio un error inesperado. ${err}`,
					okButtonText: "Ok",
				});
			});

		await fetch(appSettings.getString("backHost") + "request_role_names.php", {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				if (json.status === "OK") {
					const obsProducts = new ObservableArray();
					for (var i in json.data) {
						let item;
						try {
							let value = json.data[i];

							item = {
								id: value.id,
								name: value.name,
							};
						} catch (e) {
							console.error(e);
						}

						obsProducts.push(item);
					}
					const statusPicker = details.getViewById("statusPicker");
					statusPicker.items = obsProducts.map((v) => v.name);
					statusPicker.selectedIndex = userGo.rol - 1;
				}
			});

		await fetch(
			appSettings.getString("backHost") + "request_emp_status_names.php",
			{
				method: "GET",
				headers: {
					TOKEN: appSettings.getString("token"),
				},
			}
		)
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				if (json.status === "OK") {
					const obsProducts = new ObservableArray();
					for (var i in json.data) {
						let item;
						try {
							let value = json.data[i];

							item = {
								id: value.id,
								name: value.name,
							};
						} catch (e) {
							console.error(e);
						}

						obsProducts.push(item);
					}
					const rolPicker = details.getViewById("rolPicker");
					rolPicker.items = obsProducts.map((v) => v.name);
					rolPicker.selectedIndex = userGo.status - 1;
				}
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
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
			});
	} else if (verifiedToken.id === 404) {
		dialogs
			.alert({
				title: "Error",
				message: `Sucedio un error inesperado. ${verifiedToken.message}`,
				okButtonText: "Ok",
			})
			.then(() => {
				page.frame.goBack();
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
	details.visibility = "visible";
	title.visibility = "visible";
	buttons.visibility = "visible";
};

exports.saveChanges = async (args) => {
	const page = args.object.page;
	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);
	main.getViewById("title").visibility = "collapsed";
	main.getViewById("details").visibility = "collapsed";
	main.getViewById("buttons").visibility = "collapsed";

	const curp = page.getViewById("curp");
	const nickname = page.getViewById("nickname");
	const firstname = page.getViewById("firstname");
	const lastname = page.getViewById("lastname");
	const statusPicker = page.getViewById("statusPicker").selectedIndex + 1;
	const password = page.getViewById("password");
	const rep_password = page.getViewById("rep_password");
	const address = page.getViewById("address");
	const phone = page.getViewById("phone");
	const rolPicker = page.getViewById("rolPicker").selectedIndex + 1;

	const verifiedToken = await verifyToken();

	const curpEx = curp.text ? curp.text : curp.hint;
	const nicknameEx = nickname.text ? nickname.text : nickname.hint;
	const firstnameEx = firstname.text ? firstname.text : firstname.hint;
	const lastnameEx = lastname.text ? lastname.text : lastname.hint;
	const addressEx = address.text ? address.text : address.hint;
	const phoneEx = phone.text ? phone.text : phone.hint;

	if (password.text !== rep_password.text) {
		password.className += " input-invalid";
		rep_password.className += " input-invalid";

		dialogs.alert({
			title: "Las contraseñas no coinciden",
			message: `Verifique que las contraseñas coincidan.`,
			okButtonText: "Ok",
		});
		main.removeChild(indicator);
		main.getViewById("title").visibility = "visible";
		main.getViewById("details").visibility = "visible";
		main.getViewById("buttons").visibility = "visible";

		return;
	}

	if (password.text.length < 8 && password.text.length > 0) {
		password.className += " input-invalid";
		rep_password.className += " input-invalid";

		dialogs.alert({
			title: "Contraseña invalida",
			message: `Verifique que la contraseña mida 8 o más caracteres.`,
			okButtonText: "Ok",
		});
		main.removeChild(indicator);
		main.getViewById("title").visibility = "visible";
		main.getViewById("details").visibility = "visible";
		main.getViewById("buttons").visibility = "visible";

		return;
	}

	if (verifiedToken.status) {
		const conectionLink = appSettings.getString("backHost") + "updata_user.php";
		let URI = encodeURI(
			`${conectionLink}?id=${userGo.id}&curp=${curpEx}&nickname=${nicknameEx}` +
				`&fistname=${firstnameEx}&lastname=${lastnameEx}&status=${statusPicker}` +
				`&rol=${rolPicker}&password=${password.text}&address=${addressEx}&phone=${phoneEx}`
		);
		console.log(URI);

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
					dialogs
						.alert({
							title: "Guardado",
							message: `Los cambios se han guardado`,
							okButtonText: "Ok",
						})
						.then(() => {
							Frame.topmost().goBack();
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
	} else if (verifiedToken.response.id === 404) {
		dialogs
			.alert({
				title: "Error",
				message: `Sucedio un error inesperado. ${verifiedToken.message}`,
				okButtonText: "Ok",
			})
			.then(() => {
				page.frame.goBack();
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

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
