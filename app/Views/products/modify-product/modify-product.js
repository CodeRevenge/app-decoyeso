var ModifyProductViewModel = require("./modify-product-model");
var modifyViewModel = new ModifyProductViewModel();
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

let product;

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = modifyViewModel;
	const verifiedToken = await verifyToken();

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const details = page.getViewById("details");
	const title = page.getViewById("title");
	const buttons = page.getViewById("buttons");

	if (verifiedToken.status) {
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
					product = json.data;

					const obsProducts = new ObservableArray();
					for (var i = 1; i < Object.keys(json.statusList).length; i++) {
						let item;
						try {
							let value = json.statusList[i];

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
					statusPicker.selectedIndex = json.data.status - 1;

					const name = details.getViewById("name");
					name.hint = json.data.name;

					const desc = details.getViewById("description");
					desc.hint = json.data.descr;

					const value = details.getViewById("price");
					value.hint = "$" + json.data.value.slice(0, -1);

					const qty = details.getViewById("quantity");
					qty.hint = json.data.quantity + " piezas";

					details.visibility = "visible";
					title.visibility = "visible";
					buttons.visibility = "visible";
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
				dialogs.alert({
					title: "Error",
					message: `Sucedio un error inesperado. ${err}`,
					okButtonText: "Ok",
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
};

exports.saveChanges = async (args) => {
	const page = args.object.page;

	const name = page.getViewById("name");
	const description = page.getViewById("description");
	const price = page.getViewById("price");
	const quantity = page.getViewById("quantity");
	const statusPicker = page.getViewById("statusPicker").selectedIndex + 1;
	console.log(statusPicker);

	const verifiedToken = await verifyToken();

	const nameEx = name.text ? name.text : name.hint;
	const descriptionEx = description.text ? description.text : description.hint;
	const priceEx = price.text ? price.text : price.hint.slice(1);
	const quantityEx = quantity.text
		? quantity.text
		: quantity.hint.split(" ")[0];

	if (verifiedToken.status) {
		const conectionLink =
			appSettings.getString("backHost") + "update_product.php";
		let URI = encodeURI(
			`${conectionLink}?id=${product.id}&nombre=${nameEx}&descripcion=${descriptionEx}` +
				`&costo=${priceEx}&cantidad=${quantityEx}&status=${statusPicker}`
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

exports.modifyImages = (args) => {
	const id = product.id;
	console.log(id);
	const navegation = {
		moduleName:
			"Views/products/modify-product/update-images/modify-product-images",
		transition: {
			name: "slide",
		},
		context: {
			id,
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch (e) {
		console.error(e);
	}
};
