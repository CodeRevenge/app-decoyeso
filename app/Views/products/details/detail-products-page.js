const DetailsProductsViewModel = require("./detail-products-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var detailsProductsViewModel = new DetailsProductsViewModel();
const { Carousel } = require("nativescript-carousel");

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
	const carousel = page.getViewById("carousel");
	const details = page.getViewById("details");
	main.removeChildren();
	carousel.removeChildren();
	details.removeChildren();
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink =
			appSettings.getString("backHost") +
			"detalles_producto.php?id=" +
			page.navigationContext.id;

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
				console.log("JSON Produc: " + JSON.stringify(json));
				if (json.status === "OK") {
					indicator.busy = false;
					main.removeChild(indicator);

					const name = new Label();
					name.text = json.data.name;
					name.className = "name";
					name.dock = "top";

					const desc = new Label();
					desc.text = json.data.descr;
					desc.className = "description";
					desc.dock = "top";

					const value = new Label();
					value.text = json.data.value.slice(0, -1);
					value.className = "value";
					value.dock = "top";

					const qty = new Label();
					qty.text = json.data.quantity;
					qty.className = "qty";
					qty.dock = "top";

					const date = new Label();
					date.text = json.data.introdate;
					date.className = "";
					date.dock = "top";

					console.log(json.data.introdate);

					details.addChild(name);
					details.addChild(desc);
					details.addChild(value);
					details.addChild(qty);
					details.addChild(date);

					if (appSettings.getBoolean("activeSale")) {
						const newSale = new Button();
						newSale.text = "Agregar al carrito";
						newSale.className = "btn btn-primary btn-sales";
						newSale.on("tap", this.showInventory);
						newSale.dock = "top";
					}

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

					// options.addChild(newSale);
					details.addChild(inventory);
					details.addChild(logout);

					if (verifiedToken.role > 1) {
						const admin = new Button();
						admin.text = "Administrador";
						admin.className = "btn btn-primary";
						admin.on("tap", this.adminPage);
						admin.dock = "bottom";

						details.addChild(admin);
					}
					main.addChild(carousel);
					main.addChild(details);
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
