var RegisterViewModel = require("./register-product-model");
var registerViewModel = new RegisterViewModel();
const appSettings = require("tns-core-modules/application-settings");
const dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
} = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = registerViewModel;

	const verifiedToken = await verifyToken();
	if (verifiedToken.status) {
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

	const name = loginParent.getViewById("name").text;
	const description = loginParent.getViewById("description").text;
	const price = loginParent.getViewById("price").text;
	const quantity = loginParent.getViewById("quantity").text;

	const verifiedToken = await verifyToken();

	if (verifiedToken.status) {
		const conectionLink =
			appSettings.getString("backHost") + "altas_productos.php";
		let URI = encodeURI(
			`${conectionLink}?nombre=${name}&descripcion=${description}&costo=${price}&cantidad=${quantity}`
		);

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
							title: "Nuevo producto",
							message: `Producto registrado`,
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

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
