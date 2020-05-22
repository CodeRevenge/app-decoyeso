var ModifyProductImagesViewModel = require("./modify-product-images-model");
var modifyImagesViewModel = new ModifyProductImagesViewModel();
const appSettings = require("tns-core-modules/application-settings");
const dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
var { ListPicker } = require("tns-core-modules/ui/list-picker");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
var photoViewerModule = require("nativescript-photoviewer");
var arraysFuncts = require("lodash");
const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
	createActivityIndicator,
	randomColor,
} = require("../../../../functions");
const { Mediafilepicker } = require("nativescript-mediafilepicker");
const { Vibrate } = require("nativescript-vibrate");
const imageSourceModule = require("tns-core-modules/image-source");

let product;
let updates = false;
var items = new ObservableArray();

var uploadablePhotos = [];
var deletedPhotos = [];

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

					indicator.busy = false;
					main.removeChild(indicator);
					page.getViewById("title").visibility = "visible";
					page.getViewById("details").visibility = "visible";
					page.getViewById("buttons").visibility = "visible";

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

exports.onItemSelected = (args) => {
	let vibrator = new Vibrate();
	vibrator.vibrate(200);
};

exports.openImages = (args) => {
	let options = {
		android: {
			isCaptureMood: false, // if true then camera will open directly.
			isNeedCamera: true,
			maxNumberFiles: 10,
			isNeedFolderList: true,
		},
		ios: {
			isCaptureMood: false, // if true then camera will open directly.
			isNeedCamera: true,
			maxNumberFiles: 10,
		},
	};

	let mediafilepicker = new Mediafilepicker();
	mediafilepicker.openImagePicker(options);

	mediafilepicker.on("getFiles", function (res) {
		let results = res.object.get("results");
		for (let i in results) {
			let newImage = {
				color: randomColor(),
				image: results[i].file,
				title: "Detalles",
			};
			items.push(newImage);
			uploadablePhotos.push(items.getItem(items.length - 1));
			updates = true;
		}

		console.dir(results);
	});

	mediafilepicker.on("error", function (res) {
		let msg = res.object.get("msg");
		console.log(msg);
	});

	mediafilepicker.on("cancel", function (res) {
		let msg = res.object.get("msg");
		console.log(msg);
	});
};

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};

exports.savePics = async (args) => {
	if (updates) {
		const page = args.object.page;

		const main = page.getViewById("main");
		page.getViewById("title").visibility = "collapsed";
		page.getViewById("details").visibility = "collapsed";
		page.getViewById("buttons").visibility = "collapsed";

		const indicator = createActivityIndicator();
		main.addChild(indicator);

		const verifiedToken = await verifyToken();

		if (verifiedToken.status) {
			let body = {};
			for (let i in uploadablePhotos) {
				const img = imageSourceModule.fromFile(uploadablePhotos[0].image);
				const base64 = img.toBase64String("png");
				body[i] = {
					id: product,
					image: base64,
					title: uploadablePhotos[i].title,
				};
			}

			const conectionLink =
				appSettings.getString("backHost") + "load_image.php";

			await fetch(conectionLink, {
				method: "POST",
				headers: {
					TOKEN: appSettings.getString("token"),
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			})
				.then(checkStatus)
				.then(parseJSON)
				.then((json) => {
					console.log(json);
					if (json.status === "OK") {
						dialogs
							.alert({
								title: "Cambios realizados",
								message: "Se han guardado los cambios",
								okButtonText: "Ok",
							})
							.then(() => {
								page.frame.goBack();
							});
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
				.catch((err) => {
					console.error(err);
				});
		}
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
				title: "Error de server",
				message: `Sucedio un error inesperado. ${verifiedToken.message}`,
				okButtonText: "Ok",
			})
			.then(() => {
				page.frame.goBack();
			});
	} else {
		dialogs
			.alert({
				title: "Error Token",
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
	// let message = "";
	// if (sel_images.length === 1) {
	// 	message =
	// 		"¿Seguro que desea borrar la imagen?" +
	// 		"\nLos cambios no se guardan hasta presionar el botón Guardar Cambios";
	// } else if (sel_images.length > 1) {
	// 	message =
	// 		`¿Seguro que desea borrar las ${sel_images.length} imagenes?` +
	// 		"\nLos cambios no se guardan hasta presionar el botón Guardar Cambios";
	// } else {
	// 	return;
	// }
	// dialogs
	// 	.confirm({
	// 		title: "Borrar imagenes",
	// 		message,
	// 		okButtonText: "Ok",
	// 		cancelButtonText: "Cancelar",
	// 	})
	// 	.then((res) => {
	// 		if (res) {
	// 			temp = [];
	// 			items.reduce((_, curr) => {
	// 				if (!sel_images.includes(curr)) {
	// 					temp.push(curr);
	// 				} else {
	// 					deletedPhotos.push(curr);
	// 				}
	// 			});

	// 			items = new ObservableArray(temp);
	// 			images.items = items;
	// 		}
	// 	});
};

exports.deletePics = (args) => {
	const images = args.object.page.getViewById("list-view");
	const sel_images = images.getSelectedItems();
	let message = "";
	if (sel_images.length === 1) {
		message =
			"¿Seguro que desea borrar la imagen?" +
			"\nLos cambios no se guardan hasta presionar el botón Guardar Cambios";
	} else if (sel_images.length > 1) {
		message =
			`¿Seguro que desea borrar las ${sel_images.length} imagenes?` +
			"\nLos cambios no se guardan hasta presionar el botón Guardar Cambios";
	} else {
		return;
	}
	dialogs
		.confirm({
			title: "Borrar imagenes",
			message,
			okButtonText: "Ok",
			cancelButtonText: "Cancelar",
		})
		.then((res) => {
			if (res) {
				temp = [];
				items.reduce((_, curr) => {
					if (sel_images.includes(curr)) {
						deletedPhotos.push(curr);
						if (uploadablePhotos.includes(curr)) {
							uploadablePhotos = uploadablePhotos.filter((val) => {
								if (!arraysFuncts.isEqual(val, curr)) {
									return val;
								}
							});
						}
						console.log(uploadablePhotos);
					} else {
						temp.push(curr);
					}
				});

				items = new ObservableArray(temp);
				images.items = items;
				updates = true;
			}
		});
};

exports.onTextChange = (args) => {
	console.log(args.object.text);
};
