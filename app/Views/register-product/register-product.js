var RegisterViewModel = require("./register-product-model");
var registerViewModel = new RegisterViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = registerViewModel;
}

exports.Register = (args) => {
    const login = args.object;
    const loginParent = login.parent;

    const name = loginParent.getViewById("name");
    const description = loginParent.getViewById("description");
    const price = loginParent.getViewById("price");
    const quantity = loginParent.getViewById("quantity");
    

        

    const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/altas_productos.php";

    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            const response = JSON.parse(this.responseText);
			if (response.status === "OK") {
                dialogs.alert({
                    title: "Nuevo producto",
                    message: `Producto registrado`,
                    okButtonText: "Ok",
                })
			} else if (response.status === "WARNING") {
                dialogs.alert({
                    title: "Error",
                    message: `${response.message}`,
                    okButtonText: "Ok",
                })
            } else {
                dialogs.alert({
                    title: "Error",
                    message: `Sucedio un error inesperado. ${response}`,
                    okButtonText: "Ok",
                })
            }

		}
	};
    let URI = encodeURI(`${conectionLink}?nombre=${name.text}&descripcion=${description.text}&`
                +`costo=${price.text}&cantidad=${quantity.text}`)
    console.log(URI);
	xhttp.open("GET", URI, true);
	xhttp.send();
}

exports.Back = (args) => {
    const button = args.object;
    const page = button.page;
    page.frame.goBack();
}

exports.pageLoaded = pageLoaded;