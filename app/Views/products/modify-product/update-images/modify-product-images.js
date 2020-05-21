var ModifyProductImagesViewModel = require("./modify-product-images-model");
var modifyImagesViewModel = new ModifyProductImagesViewModel();
const appSettings = require("tns-core-modules/application-settings");
const dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
var { ListPicker } = require("tns-core-modules/ui/list-picker");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
var photoViewerModule = require("nativescript-photoviewer");
const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
	createActivityIndicator,
} = require("../../../../functions");

let product;
var items = new ObservableArray([
	{
		title: "Slide 1",
		color: "#b3cde0",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/01.jpg",
	},
	{
		title: "Slide 2",
		color: "#6497b1",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/02.jpg",
	},
	{
		title: "Slide 3",
		color: "#005b96",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/03.jpg",
	},
	{
		title: "Slide 4",
		color: "#03396c",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/04.jpg",
	},
	{
		title: "Slide 2",
		color: "#6497b1",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/02.jpg",
	},
	{
		title: "Slide 3",
		color: "#005b96",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/03.jpg",
	},
	{
		title: "Slide 4",
		color: "#03396c",
		image:
			"https://github.com/manijak/nativescript-photoviewer/raw/master/demo/app/res/04.jpg",
	},
]);

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = modifyImagesViewModel;

	modifyImagesViewModel.set("myData", items);

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const verifiedToken = await verifyToken();

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
					const statusPicker = new ListPicker();
					statusPicker.className = "picker";
					statusPicker.id = "statusPicker";
					statusPicker.items = obsProducts.map((v) => v.name);

					// const name = details.getViewById("name");
					// name.hint = json.data.name;

					// const desc = details.getViewById("description");
					// desc.hint = json.data.descr;

					// const value = details.getViewById("price");
					// value.hint = "$" + json.data.value.slice(0, -1);

					// const qty = details.getViewById("quantity");
					// qty.hint = json.data.quantity + " piezas";
					// details.getViewById("statusContainer").addChild(statusPicker);
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
		const photoViewer = new photoViewerModule.PhotoViewer();
		var photoviewerOptions = {
			startIndex: args.index,
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

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
