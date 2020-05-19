const InventoryViewModel = require("./inventory-view-model");
var inventoryViewModel = new InventoryViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const { Label } = require("tns-core-modules/ui/label");
const { StackLayout } = require("ui/layouts/stack-layout");
const { FlexboxLayout } = require("ui/layouts/flexbox-layout");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
const appSettings = require("tns-core-modules/application-settings");
const { Frame } = require("tns-core-modules/ui/frame");
const Toast = require("nativescript-toast");

const {
	verifyToken,
	deleteSesion,
	parseJSON,
	checkStatus,
	createActivityIndicator,
} = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = inventoryViewModel;

	const inventory = args.object;

	const main = page.getViewById("main");
	const indicator = createActivityIndicator();
	main.addChild(indicator);

	const searchBar = page.getViewById("searchBar");
	searchBar.on("textChange", this.textChanged);

	const dockList = page.getViewById("inventoriDock");

	const verifiedToken = await verifyToken();
	if (verifiedToken.status) {
		const list = page.getViewById("inventoryList");

		const conectionLink = encodeURI(
			appSettings.getString("backHost") + "lista_inventario.php"
		);

		await fetch(conectionLink)
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				const obsProducts = new ObservableArray();
				for (var i in json) {
					let value = json[i].value.slice(0, -1);
					const item = {
						id: json[i].id,
						name: json[i].name,
						quantity: json[i].quantity,
						value,
					};
					obsProducts.push(item);
				}

				list.items = obsProducts;
				indicator.busy = false;
				main.removeChild(indicator);
				searchBar.visibility = "visible";
				dockList.visibility = "visible";
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
				const navegation = {
					moduleName: "Views/login/login-page",
					clearHistory: true,
				};
				Frame.topmost().navigate(navegation);
			});
	}
};

exports.onItemTap = (args) => {
	const id = args.view.getViewById("id").text;
	const navegation = {
		moduleName: "Views/products/details/detail-products-page",
		transition: {
			name: "slide",
		},
		context: {
			id,
		},
	};
	Frame.topmost().navigate(navegation);
};

exports.filteringProducts = (search) => {
	return (item) => {
		return (
			item.id.includes(search) ||
			item.name.toLowerCase().includes(search.toLowerCase()) ||
			item.value.includes(search) ||
			item.quantity.includes(search)
		);
	};
};

exports.onClear = (args) => {
	const inventoryList = args.object.page.getViewById("inventoryList");
	try {
		inventoryList.filteringFunction = undefined;
	} catch (e) {
		console.error(e);
	}
};

exports.onSubmit = (args) => {
	const inventoryList = args.object.page.getViewById("inventoryList");
	try {
		inventoryList.filteringFunction = this.filteringProducts(args.object.text);
	} catch (e) {
		console.error(e);
	}
};

exports.textChanged = (args) => {
	const inventoryList = args.object.page.getViewById("inventoryList");
	try {
		inventoryList.filteringFunction = this.filteringProducts(args.object.text);
	} catch (e) {
		console.error(e);
	}
};

exports.onPullToRefreshInitiated = async (args) => {
	const list = args.object;
	const verifiedToken = await verifyToken();
	if (verifiedToken.status) {
		const conectionLink = encodeURI(
			appSettings.getString("backHost") + "lista_inventario.php"
		);

		await fetch(conectionLink)
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				const obsProducts = new ObservableArray();
				for (var i in json) {
					let value = json[i].value.slice(0, -1);
					const item = {
						id: json[i].id,
						name: json[i].name,
						quantity: json[i].quantity,
						value,
					};
					obsProducts.push(item);
				}

				list.items = obsProducts;

				list.notifyPullToRefreshFinished();
				Toast.makeText("Productos Actualizados").show();
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
