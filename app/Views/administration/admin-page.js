const AdminViewModel = require("./admin-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var adminViewModel = new AdminViewModel();

const { verifyToken, deleteSesion } = require("../../functions");

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = adminViewModel;

	const verifiedToken = await verifyToken();

	if (verifiedToken.id === 0) {
		const conectionLink = appSettings.getString("backHost") + "empleado_info.php";

		const infoCard = page.getViewById("info");
		const options = page.getViewById("options");

		infoCard.removeChildren();
    options.removeChildren();

		await fetch(conectionLink, {
			method: "GET", // or 'PUT'
			headers: {
				TOKEN: appSettings.getString("token"),
			},
		})
			.then(async (resp) => {
				if (resp.ok) {
					return await resp.json();
				}
			})
			.then((json) => {
				console.log("JSON User: " + JSON.stringify(json));
				if (json.status === "OK") {
					const name = new Label();
					name.text = "Administración";
					name.className = "nickname";

					const role = new Label();
					role.text = json.data.role;
					role.className = "role";

					const fname = new Label();
					fname.text = json.data.firstname;
					fname.className = "fname";

					infoCard.addChild(fname);
					infoCard.addChild(name);
					infoCard.addChild(role);

					
					const adminProducts = new Button();
					adminProducts.text = "Administrar Productos";
					adminProducts.className = "btn btn-primary";
					adminProducts.on("tap", this.adminProdPage);
					adminProducts.dock = "top";

					const adminEmployees = new Button();
					adminEmployees.text = "Administrar Empleados";
					adminEmployees.className = "btn btn-primary";
					adminEmployees.on("tap", this.adminProdPage);
					adminEmployees.dock = "top";

					const adminSales = new Button();
					adminSales.text = "Administrar Ventas";
					adminSales.className = "btn btn-primary";
					adminSales.on("tap", this.adminProdPage);
					adminSales.dock = "top";

					const adminClients = new Button();
					adminClients.text = "Administrar Clientes";
					adminClients.className = "btn btn-primary";
					adminClients.on("tap", this.adminProdPage);
					adminClients.dock = "top";

					const backButton = new Button();
					backButton.text = "Regresar";
					backButton.className = "btn btn-secundary";
					backButton.on("tap", this.backButton);
					backButton.dock = "bottom";

					options.addChild(adminProducts);
					options.addChild(adminEmployees);
					options.addChild(adminSales);
					options.addChild(adminClients);
					options.addChild(backButton);
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
							};
							Frame.topmost().navigate(navegation);
						});
					return 0;
				}
			})
			.then((data) => data)
			.catch((err) => {
				console.error("Petición fallida: ", err);
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
				};
				Frame.topmost().navigate(navegation);
			});
	}
};

exports.adminProdPage = (args) => {
	const navegation = {
		moduleName: "Views/administration/admin-prod/admin-prod-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
}

exports.adminEmployeesPage = (args) => {
	const navegation = {
		moduleName: "Views/administration/admin-prod/admin-prod-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
}

exports.adminSalesPage = (args) => {
	const navegation = {
		moduleName: "Views/administration/admin-prod/admin-prod-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
}

exports.adminClientsPage = (args) => {
	const navegation = {
		moduleName: "Views/administration/admin-prod/admin-prod-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
}

exports.regProd = (args) => {
	const navegation = {
		moduleName: "Views/register-product/register-product",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
};

exports.adminProducts = (args) => {
	const navegation = {
		moduleName: "Views/inventory/inventory-page",
		transition: {
			name: "slide",
		},
	};
	args.object.page.frame.navigate(navegation);
};

exports.backButton = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
