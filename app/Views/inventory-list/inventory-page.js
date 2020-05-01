var InventoryViewModel = require("./inventory-view-model");
var inventoryViewModel = new InventoryViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const { Label } = require("tns-core-modules/ui/label");
const { StackLayout } = require("ui/layouts/stack-layout");

exports.onNavigatingTo = (args) => {
    var page = args.object;
    page.bindingContext = inventoryViewModel;

    // const inventory = args.object;
    // const inventoryParent = inventory.parent;
    
    const list = page.getViewById("inventoryList");
    

    const stackLayout = new StackLayout();
    const name = new Label();
    name.text = "Nombre";
    name.textAlignment = "center";
    name.className = "products";

    const quantity = new Label();
    quantity.text = "Cantidad";
    quantity.textAlignment = "center";
    quantity.className = "products";

    const value = new Label();
    value.text = "Costo";
    value.textAlignment = "center";
    value.className = "products";

    stackLayout.orientation = "horizontal";
    stackLayout.addChild(name);
    stackLayout.addChild(value);
    stackLayout.addChild(quantity);
    stackLayout.className = "input-field";
    stackLayout.dock = "top";
    list.addChild(stackLayout);
    

    const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/lista_inventario.php";

    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            // console.log(this.responseText);
            const response = JSON.parse(this.responseText);
			if (response) {
                
                for(var i in response) {
                    const stackLayout = new StackLayout();

                    const name = new Label();
                    name.text = response[i].name;
                    name.textAlignment = "center";
                    name.className = "products";

                    const quantity = new Label();
                    quantity.text = response[i].quantity;
                    quantity.textAlignment = "center";
                    quantity.className = "products";

                    const value = new Label();
                    value.text = response[i].value;
                    value.textAlignment = "center";
                    value.className = "products";

                    stackLayout.orientation = "horizontal";
                    stackLayout.addChild(name);
                    stackLayout.addChild(value);
                    stackLayout.addChild(quantity);
                    stackLayout.className = "input-field";
                    stackLayout.dock = "top";
                    list.addChild(stackLayout);
                
                }
                
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
    console.log(URI);
	xhttp.open("GET", URI, true);
	xhttp.send();
}

exports.Back = (args) => {
    const button = args.object;
    const page = button.page;
    page.frame.goBack();
}