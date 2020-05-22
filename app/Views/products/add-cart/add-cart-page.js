const AddCartViewModel = require("./add-cart-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var addCartViewModel = new AddCartViewModel();
const { Carousel } = require("nativescript-carousel");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
var photoViewerModule = require("nativescript-photoviewer");
const moment = require("moment");
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
let product;
let images;

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = addCartViewModel;
	items = new ObservableArray();

	addCartViewModel.set("myData", items);

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	const carousel = page.getViewById("carousel");
	const details = page.getViewById("details");
	const buttons = page.getViewById("buttons");
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.status) {
		productId = page.navigationContext.id;
		const conectionLink =
			appSettings.getString("backHost") + "request_images.php?id=" + productId;

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
					for (let i in json.data) {
						let item = {
							id: json.data[i].id,
							title: json.data[i].title,
							color: randomColor(),
							image: json.data[i].image,
						};
						items.push(item);
					}
					images = true;
					carousel.visibility = "visible";
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
				} else if (json.status === "NO_IMAGES") {
					images = false;
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

		const conectionLink2 =
			appSettings.getString("backHost") +
			"detalles_producto.php?id=" +
			productId;

		await fetch(conectionLink2, {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				product = json.data;

				if (json.status === "OK") {
					indicator.busy = false;
					main.removeChild(indicator);

					const name = details.getViewById("name");
					name.text = json.data.name;

					const value = details.getViewById("value");
					value.text = "$" + json.data.value.slice(0, -1);

					const qty = details.getViewById("qty");
					qty.text = json.data.quantity + " piezas";

					details.visibility = "visible";
					buttons.visibility = "visible";
					const addCart = buttons.getViewById("addCart");
					addCart.visibility = "visible";
					addCart.colSpan = 2;
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

exports.showImages = (args) => {
	try {
		const myCarousel = args.object.page.getViewById("imageCarousel");
		const photoViewer = new photoViewerModule.PhotoViewer();

		var photoviewerOptions = {
			startIndex: myCarousel.selectedPage,
			android: {
				paletteType: photoViewerModule.PaletteType.DarkVibrant,
				showAlbum: false,
			},
		};

		photoViewer
			.showGallery(
				items.map((x) => x.image),
				photoviewerOptions
			)
			.then((args) => {
				console.log("Gallery closed...");
			});
	} catch (e) {
		console.error(e);
	}
};

exports.modifyProduct = (args) => {
	const id = args.object.page
		.getViewById("details")
		.getViewById("idProd")
		.text.split(" ")[1];
	const navegation = {
		moduleName: "Views/products/modify-product/modify-product",
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

exports.addCart = async (args) => {
	const page = args.object.page;
	const id = product.id;
	const qty = page.getViewById("selected").text;

	// const main = page.getViewById("main");
	// const indicator = createActivityIndicator();
	// const carousel = page.getViewById("carousel");
	// const details = page.getViewById("details");
	// const buttons = page.getViewById("buttons");
	// carousel.visibility = "collapsed";
	// details.visibility = "collapsed";
	// buttons.visibility = "collapsed";
	// main.addChild(indicator);

	if (parseFloat(qty) > product.quantity) {
		await dialogs
			.alert({
				title: "Error",
				message: `No hay suficiente stock para surtir ${qty} elementos.`,
				okButtonText: "Ok",
			})
			.then(() => {
				// main.removeChild(indicator);
				// images
				// 	? (carousel.visibility = "visible")
				// 	: (carousel.visibility = "collapsed");
				// details.visibility = "visible";
				// buttons.visibility = "visible";
				return;
			});
		return;
	}

	if (parseFloat(qty) <= 0 || isNaN(parseFloat(qty))) {
		await dialogs
			.alert({
				title: "No se agrego",
				message: `No se agrego nada al carrito`,
				okButtonText: "Ok",
			})
			.then(() => {
				// main.removeChild(indicator);
				// images
				// 	? (carousel.visibility = "visible")
				// 	: (carousel.visibility = "collapsed");
				// details.visibility = "visible";
				// buttons.visibility = "visible";
				return;
			});
		return;
	}

	const navegation = {
		moduleName: "Views/products/cart/cart-page",
		transition: {
			name: "slide",
		},
		context: {
			id,
			qty,
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch (e) {
		console.error(e);
	}
};

exports.onChange = (args) => {
	const page = args.object.page;
	const total = page.getViewById("total");
	const qty = args.object.text;
	try {
		if (qty) {
			if (parseFloat(qty) > product.quantity) {
				args.object.className = "selected invalid-selection";
			} else {
				total.text = "$ " + parseFloat(qty) * parseFloat(product.value);
				args.object.className = "selected";
			}
		} else {
			total.text = "$ 00.00";
		}
	} catch (e) {
		console.error(e);
	}
};
