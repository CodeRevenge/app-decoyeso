const InventoryViewModel = require("./inventory-view-model");
var inventoryViewModel = new InventoryViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const { Label } = require("tns-core-modules/ui/label");
const { StackLayout } = require("ui/layouts/stack-layout");
const { FlexboxLayout } = require("ui/layouts/flexbox-layout");
const { ObservableArray } = require("tns-core-modules/data/observable-array");

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = inventoryViewModel;

	const inventory = args.object;
	const inventoryParent = inventory.parent;

	const list = page.getViewById("inventoryList");

	// const stackLayout = new StackLayout();
	// const name = new Label();
	// name.text = "Nombre";
	// name.textAlignment = "center";
	// name.className = "products";

	// const quantity = new Label();
	// quantity.text = "Cantidad";
	// quantity.textAlignment = "center";
	// quantity.className = "products";

	// const value = new Label();
	// value.text = "Costo";
	// value.textAlignment = "center";
	// value.className = "products";

	// stackLayout.orientation = "horizontal";
	// stackLayout.addChild(name);
	// stackLayout.addChild(value);
	// stackLayout.addChild(quantity);
	// stackLayout.className = "input-field";
	// stackLayout.dock = "top";
	// list.addChild(stackLayout);

	const conectionLink = encodeURI(
		"http://ppicucei.000webhostapp.com/decoyeso/lista_inventario.php"
	);

	await fetch(conectionLink)
		.then(async (resp) => {
			if (resp.ok) {
				return await resp.json();
			}
		})
		.then((json) => {
			const obsProducts = new ObservableArray();
			for (var i in json) {
				const item = {
					id: json[i].id,
					name: json[i].name,
					quantity: json[i].quantity,
					value: json[i].value,
				};
				obsProducts.push(item);
			}

			list.items = obsProducts;

			list.on(listViewModule.ListView.itemTapEvent, (args) => {
				const tappedItemIndex = args.index;
				const tappedItemView = args.view;
				dialogs
					.alert(`Index: ${tappedItemIndex} View: ${tappedItemView}`)
					.then(() => {
						console.log("Dialog closed!");
					});
			});
		});
};

exports.onItemTap = (args) => {
	console.log(args);
	const tappedItemIndex = args.index;
	const tappedItemView = args.view;
	dialogs
		.alert(`Index: ${tappedItemIndex} View: ${tappedItemView}`)
		.then(() => {
			console.log("Dialog closed!");
		});
};

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
