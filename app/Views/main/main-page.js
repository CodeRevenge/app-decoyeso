const MainViewModel = require("./main-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var mainViewModel = new MainViewModel();
const platformModule = require("tns-core-modules/platform");
var Toast = require("nativescript-toast");
const application = require("tns-core-modules/application");

const {
	verifyToken,
	deleteSesion,
	createActivityIndicator,
	parseJSON,
	checkStatus,
} = require("../../functions");

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = mainViewModel;

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);
	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink =
			appSettings.getString("backHost") + "empleado_info.php";

		const infoCard = page.getViewById("info");
		const options = page.getViewById("options");

		infoCard.removeChildren();
		options.removeChildren();

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
					const name = new Label();
					name.text = json.data.nickname;
					name.className = "nickname";

					const role = new Label();
					role.text = json.data.role;
					role.className = "role";

					const fname = new Label();
					fname.text = json.data.firstname;
					fname.className = "fname";

					infoCard.addChild(fname);
					infoCard.addChild(name);
					infoCard.addChild(role);

					const newSale = new Button();
					newSale.text = "Nueva Venta";
					newSale.className = "btn btn-primary btn-sales";
					newSale.on("tap", this.showInventory);
					newSale.dock = "top";

					const inventory = new Button();
					inventory.text = "Ver inventario";
					inventory.className = "btn btn-primary";
					inventory.on("tap", this.showInventory);
					inventory.dock = "top";

					const logout = new Button();
					logout.text = "Cerrar Sesión";
					logout.className = "btn btn-secundary";
					logout.on("tap", this.closeSesion);
					logout.dock = "bottom";

					options.addChild(newSale);
					options.addChild(inventory);
					options.addChild(logout);

					if (verifiedToken.role > 1) {
						const admin = new Button();
						admin.text = "Administrador";
						admin.className = "btn btn-primary";
						admin.on("tap", this.adminPage);
						admin.dock = "bottom";

						options.addChild(admin);
					}
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
					return 0;
				}
			})
			.then((data) => data)
			.catch((err) => {
				console.error("Petición fallida (Main): ", err);
				dialogs
					.alert({
						title: "Error",
						message: `Sucedio un error inesperado. ${err}`,
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

exports.adminPage = (args) => {
	const navegation = {
		moduleName: "Views/administration/admin-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
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

exports.showInventory = (args) => {
	const navegation = {
		moduleName: "Views/products/inventory/inventory-page",
		transition: {
			name: "slide",
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch (e) {
		console.error(e);
	}
};

exports.closeSesion = (args) => {
	dialogs
		.confirm({
			title: "Error",
			message: "Seguro que desea cerrar seción",
			okButtonText: "Salir",
			cancelButtonText: "Cancelar",
		})
		.then(function (result) {
			if (result) {
				deleteSesion();

				const navegation = {
					moduleName: "Views/login/login-page",
					clearHistory: true,
				};
				args.object.page.frame.navigate(navegation);
			}
		});
};

exports.showMoreInfo = (args) => {};
