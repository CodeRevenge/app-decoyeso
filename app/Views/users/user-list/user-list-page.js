const UserListViewModel = require("./user-list-view-model");
var userListViewModel = new UserListViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
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
	page.bindingContext = userListViewModel;

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
			appSettings.getString("backHost") + "user_list.php"
		);

		await fetch(conectionLink, {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				if (json.code === "-1") {
					dialogs
						.alert({
							title: "No hay inventario",
							message: "No existe ningun producto registrado.",
							okButtonText: "Ok",
						})
						.then(() => {
							indicator.busy = false;
							main.removeChild(indicator);
							Frame.topmost().goBack();
						});
				} else {
					const obsProducts = new ObservableArray();
					for (var i in json) {
						let color;
						if (json[i].status === "2") color = "red";
						const item = {
							id: json[i].id,
							nickname: json[i].nickname,
							firstname: json[i].firstname,
							lastname: json[i].lastname,
							rol: json[i].role,
							color,
						};
						obsProducts.push(item);
					}

					list.items = obsProducts;
					indicator.busy = false;
					main.removeChild(indicator);
					searchBar.visibility = "visible";
					dockList.visibility = "visible";
					main.getViewById("title").visibility = "visible";
				}
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
		moduleName: "Views/users/modify-users/modify-users",
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

exports.filteringProducts = (search) => {
	return (item) => {
		return (
			item.id.includes(search) ||
			item.nickname.toLowerCase().includes(search.toLowerCase()) ||
			item.firstname.toLowerCase().includes(search.toLowerCase()) ||
			item.lastname.toLowerCase().includes(search.toLowerCase())
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
			appSettings.getString("backHost") + "user_list.php"
		);

		await fetch(conectionLink, {
			method: "GET",
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(checkStatus)
			.then(parseJSON)
			.then((json) => {
				const obsProducts = new ObservableArray();
				for (var i in json) {
					let color;
					if (json[i].status === 2) color = "red";
					const item = {
						id: json[i].id,
						nickname: json[i].nickname,
						firstname: json[i].firstname,
						lastname: json[i].lastname,
						rol: json[i].role,
						color,
					};
					obsProducts.push(item);
				}

				list.items = obsProducts;

				list.notifyPullToRefreshFinished();
				Toast.makeText("Usuarios Actualizados").show();
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
	list.items = obsProducts;
	indicator.busy = false;
	main.removeChild(indicator);
	searchBar.visibility = "visible";
	dockList.visibility = "visible";
	main.getViewById("title").visibility = "visible";
};

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
