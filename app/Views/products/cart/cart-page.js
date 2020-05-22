const CartViewModel = require("./cart-view-model");
const appSettings = require("tns-core-modules/application-settings");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
var cartViewModel = new CartViewModel();
const { ObservableArray } = require("tns-core-modules/data/observable-array");
var photoViewerModule = require("nativescript-photoviewer");
const moment = require("moment");
const Sqlite = require("nativescript-sqlite");
moment.locale("es");
const {
	verifyToken,
	deleteSesion,
	createActivityIndicator,
	parseJSON,
	checkStatus,
	randomColor,
} = require("../../../functions");

var items;
let productId;
let productQty;
let product;

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = cartViewModel;
	items = new ObservableArray();

	cartViewModel.set("myData", items);

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	const title = page.getViewById("title");
	const cartItems = page.getViewById("cartItems");
	const details = page.getViewById("details");
	const buttons = page.getViewById("buttons");

	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.status) {
		try {
			productId = page.navigationContext.id;
			productQty = page.navigationContext.qty;
		} catch (e) {}

		const conectionLink =
			appSettings.getString("backHost") +
			"detalles_producto.php?id=" +
			productId;
		if (productId) {
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
						product = json.data;
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
		}

		indicator.busy = false;
		main.removeChild(indicator);

		let elements;
		const db = await Sqlite("cart.sqlite");
		await db.version((_, ver) => {
			if (ver === 0) {
				db.execSQL(
					"CREATE TABLE cart ( prod_id INTEGER, " +
						"prod_name TEXT NOT NULL, prod_cost REAL NOT NULL, " +
						"prod_qty REAL NOT NULL);"
				);
				db.version(1);
			}
			if (productId && productQty) {
				if (ver === 1) {
					db.execSQL(
						"INSERT INTO cart (prod_id, prod_name, prod_cost, prod_qty) VALUES(?,?,?,?);",
						[[product.id], [product.name], [product.value], [productQty]],
						(err, id) => {
							if (err) console.log(err);
							console.log(id);
						}
					);
				}
			}

			if (ver === 1) {
				db.all("SELECT * FROM cart;", []).then((data) => {
					console.log(data);
					elements = data;
				});
			}
		});

		db.close();

		for (let e in elements) {
			items.push({
				id: elements[e][0],
				name: elements[e][1],
				qty: elements[e][3],
				value: elements[e][2],
				total: elements[e][3] * elements[e][2],
			});
		}

		page.getViewById("cartItemsList").items = items;

		let v = 0;
		for (let i = 0; i < items.length; i++) {
			v += parseFloat(items.getItem(i).total);
		}

		page.getViewById("total").text = "$" + v;

		title.visibility = "visible";
		cartItems.visibility = "visible";
		details.visibility = "visible";
		buttons.visibility = "visible";
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

exports.bntPay = async (args) => {
	if (items.length > 0) {
		const db = await Sqlite("cart.sqlite");
		await db.version((_, ver) => {
			if (ver === 1) {
				db.execSQL(
					"DROP TABLE cart"
				);
				db.version(0);
			}


		});

		db.close();
		const navegation = {
			moduleName: "Views/products/sale-out/sale-out-page",
			transition: {
				name: "slide",
			},
		};
		try {
			Frame.topmost().navigate(navegation);
		} catch (err) {
			console.error(err);
		}
	}
};
