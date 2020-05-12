const MainViewModel = require("./main-view-model");
const LoginViewModel = require("../login/login-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
var mainViewModel = new MainViewModel();
var loginViewModel = new LoginViewModel();

// function onCreate(args) {
// 	const page = args.object;
//     page.bindingContext = mainViewModel;
// }

async function onNavigatingTo(args) {
	// console.log("Page:" + args);
	const page = args.object;
	page.bindingContext = mainViewModel;
	
	
	if(appSettings.getString('token') === undefined) {
		const navegation = {
			moduleName: "Views/login/login-page",
		};
		await new Promise(r => setTimeout(r, 50));
		page.frame.navigate(navegation);
	} else {
		console.log("Console");

		const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/sesion_activa.php";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                const response = JSON.parse(this.responseText);
                if (response.status === "OK") {
                    // console.log("Sesion valid");
                } else if (response.status === "TOKEN_EXPIRED") {
                    dialogs.alert({
                        title: "Sesión expirada",
                        message: "La sesión ha expirado, vuelva a iniciar sesión.",
                        okButtonText: "Ok",
                    }).then(()=> {
						appSettings.remove("token");
						const navegation = {
							moduleName: "Views/login/login-page",
						};
						page.frame.navigate(navegation);
                    });
                
                } else {
					console.warn(response);
                    dialogs.alert({
                        title: "Error",
                        message: `Sucedio un error inesperado. ${response}`,
                        okButtonText: "Ok",
                    }).then(() => {
						console.log(appSettings.getString("token"));
						appSettings.remove("token");
						console.log(appSettings.getString("token"));
						const navegation = {
							moduleName: "Views/login/login-page",
						};
						page.frame.navigate(navegation);
					});
                }

            }
        };
        let URI = encodeURI(conectionLink);
        
        xhttp.open("GET", URI, true);
		const token = appSettings.getString("token");
		// console.log(token);
        xhttp.setRequestHeader("token", token);
        xhttp.send();
	}


	const infoCard = page.getViewById("info");


    const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/empleado_info.php";

	var xhttp = new XMLHttpRequest();
	
    xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			const response = JSON.parse(this.responseText);
			
            if (response.status === "OK") {
				

				const name = new Label();
				name.text = response.data.nickname;
				name.className = "nickname";
				
				const role = new Label();
				role.text = response.data.role;
				role.className = "role";

				const fname = new Label();
				fname.text = response.data.firstname;
				fname.className = "fname";


				// const quantity = new Label();
				// quantity.text = response[i].quantity;
				// quantity.textAlignment = "center";
				// quantity.className = "products";

				// const value = new Label();
				// value.text = response[i].value;
				// value.textAlignment = "center";
				// value.className = "products";

    //                 stackLayout.orientation = "horizontal";
    //                 stackLayout.addChild(name);
    //                 stackLayout.addChild(value);
    //                 stackLayout.addChild(quantity);
    //                 stackLayout.className = "input-field";
    //                 stackLayout.dock = "top";
				infoCard.addChild(fname);
				infoCard.addChild(name);
				infoCard.addChild(role);

    //             }

            } else if (response.status === "WARNING") {
                dialogs.alert({
                    title: "Error",
                    message: `${response.message}`,
                    okButtonText: "Ok",
                })
            } else {
                dialogs.alert({
                    title: "Error ",
                    message: `Sucedio un error inesperado. ${response}`,
                    okButtonText: "Ok",
                })
            }

        }
    };
    let URI = encodeURI(conectionLink)
	xhttp.open("GET", URI, true);
	const token = appSettings.getString("token");
	xhttp.setRequestHeader("token", token);
    xhttp.send();
}

exports.regProd = (args) => {
    const navegation = {
        moduleName: "Views/register-product/register-product",
        transition: {
            name: "slide"
        }
    };
    args.object.page.frame.navigate(navegation);
}

exports.showInventory = (args) => {
    const navegation = {
        moduleName: "Views/inventory/inventory-page",
        transition: {
            name: "slide"
        }
    };
    args.object.page.frame.navigate(navegation);
}

exports.closeSesion = (args) => {
	dialogs.confirm({
		title: "Error",
		message: "Seguro que desea cerrar seción",
		okButtonText: "Salir",
    	cancelButtonText: "Cancelar"
	}).then(function (result) {
		if(result) {
			appSettings.remove("token");
			const navegation = {
				moduleName: "Views/login/login-page",
			};
			args.object.page.frame.navigate(navegation);
		}
	});
}

exports.onNavigatingTo = onNavigatingTo;