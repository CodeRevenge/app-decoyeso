const DetailsProductsViewModel = require("./detail-products-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var detailsProductsViewModel = new DetailsProductsViewModel();

const {
	verifyToken,
	deleteSesion,
	createActivityIndicator,
	parseJSON,
	checkStatus,
} = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	console.log("OK");
	const page = args.object;
	page.bindingContext = detailsProductsViewModel;

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink =
			appSettings.getString("backHost") +
			"detalles_producto.php?id=" +
			page.navigationContext.id;

		console.log(conectionLink);

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
				console.log("JSON Produc: " + JSON.stringify(json));
				if (json.status === "OK") {
					indicator.busy = false;
					main.removeChild(indicator);
					const id = new Label();
					id.text = json.data.id;
					id.className = "title";

					const name = new Label();
					name.text = json.data.name;
					name.className = "";

					const desc = new Label();
					desc.text = json.data.descr;
					desc.className = "";

					const value = new Label();
					value.text = json.data.value.slice(0, -1);
					value.className = "";

					const qnt = new Label();
					qnt.text = json.data.qnt;
					qnt.className = "";

					const date = new Label();
					date.text = json.data.date;
					date.className = "";

					infoCard.addChild(id);
					infoCard.addChild(name);
					infoCard.addChild(desc);
					infoCard.addChild(value);
					infoCard.addChild(qnt);
					infoCard.addChild(date);

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
		moduleName: "Views/inventory/inventory-page",
		transition: {
			name: "slide",
		},
	};
	Frame.topmost().navigate(navegation);
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
