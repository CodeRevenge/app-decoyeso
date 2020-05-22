const DetailsProductsViewModel = require("./detail-products-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var detailsProductsViewModel = new DetailsProductsViewModel();
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
	randomColor
} = require("../../../functions");

var items = new ObservableArray();
let product;

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = detailsProductsViewModel;

	detailsProductsViewModel.set("myData", items);

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	const carousel = page.getViewById("carousel");
	const details = page.getViewById("details");
	const buttons = page.getViewById("buttons");
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

	if (verifiedToken.status) {
		product = page.navigationContext.id;
		const conectionLink =
			appSettings.getString("backHost") + "request_images.php?id=" + product;

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
					for (let i in json.data) {
						let item = {
							id: json.data[i].id,
							title: json.data[i].title,
							color: randomColor(),
							image: json.data[i].image,
						};
						items.push(item);
					}

					console.log(JSON.stringify(json.data));
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

		const conectionLink2 =
			appSettings.getString("backHost") + "detalles_producto.php?id=" + product;
		

		await fetch(conectionLink2, {
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

					const name = details.getViewById("name");
					name.text = json.data.name;

					const desc = details.getViewById("desc");
					desc.text = json.data.descr;

					const value = details.getViewById("value");
					value.text = "$" + json.data.value.slice(0, -1);

					const qty = details.getViewById("qty");
					qty.text = json.data.quantity + " piezas";

					const date = details.getViewById("date");

					date.text =
						"Ultima actualización " +
						moment(json.data.updated, "YYYY-MM-DD HH:mm:ss", false)
							.subtract(5, "hours")
							.fromNow();

					const id = details.getViewById("idProd");
					id.text = "ID " + json.data.id;

					const status = details.getViewById("status");
					status.text = json.statusList[json.data.status].name;

					details.visibility = "visible";
					carousel.visibility = "visible";
					buttons.visibility = "visible";
					const addCart = buttons.getViewById("addCart");
					addCart.visibility = "visible";
					if (verifiedToken.role > 1) {
						buttons.getViewById("modify").visibility = "visible";
					} else {
						addCart.colSpan = 2;
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
		dialogs.alert({
			title: "Error",
			message: `Sucedio un error inesperado. ${verifiedToken.message}`,
			okButtonText: "Ok",
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
