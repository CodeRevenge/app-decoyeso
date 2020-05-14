const AdminProdViewModel = require("./admin-prod-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var adminProdViewModel = new AdminProdViewModel();

const { verifyToken, deleteSesion } = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = adminProdViewModel;

	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink =
			"http://ppicucei.000webhostapp.com/decoyeso/empleado_info.php";

		const infoCard = page.getViewById("info");
		const options = page.getViewById("options");

		infoCard.removeChildren();
    options.removeChildren();

		await fetch(conectionLink, {
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
				console.log("JSON User: " + JSON.stringify(json));
				if (json.status === "OK") {
					const name = new Label();
					name.text = "Administrador de Productos";
					name.className = "title";
					name.textWrap = true;
					infoCard.addChild(name);

					const registerProds = new Button();
					registerProds.text = "Registrar nuevo producto";
					registerProds.className = "btn btn-primary";
					registerProds.on("tap", this.backButton);
					registerProds.dock = "top";

					const updateProd = new Button();
					updateProd.text = "Modificar inventario";
					updateProd.className = "btn btn-primary";
					updateProd.on("tap", this.backButton);
					updateProd.dock = "top";

					const delProds = new Button();
					delProds.text = "Eliminar productos";
					delProds.className = "btn btn-primary";
					delProds.on("tap", this.backButton);
					delProds.dock = "top";

					const backButton = new Button();
					backButton.text = "Regresar";
					backButton.className = "btn btn-secundary";
					backButton.on("tap", this.backButton);
					backButton.dock = "bottom";

					options.addChild(registerProds);
					options.addChild(updateProd);
					options.addChild(delProds);
					options.addChild(backButton);
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
				Frame.topmost().navigate(navegation);
			});
	}
};

exports.regProd = (args) => {
	const navegation = {
		moduleName: "Views/register-product/register-product",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
};

exports.adminProducts = (args) => {
	const navegation = {
		moduleName: "Views/inventory/inventory-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
};

exports.backButton = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
