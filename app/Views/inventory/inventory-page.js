const InventoryViewModel = require("./inventory-view-model");
var inventoryViewModel = new InventoryViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const { Label } = require("tns-core-modules/ui/label");
const { StackLayout } = require("ui/layouts/stack-layout");
const { FlexboxLayout } = require("ui/layouts/flexbox-layout");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
const appSettings = require("tns-core-modules/application-settings");
const { Frame } = require("tns-core-modules/ui/frame");

exports.onNavigatingTo = async (args) => {
	var page = args.object;
	page.bindingContext = inventoryViewModel;

	const inventory = args.object;
	const inventoryParent = inventory.parent;

	const list = page.getViewById("inventoryList");
	console.log("LOADING INVENTORY");

	const conectionLink = encodeURI(
		appSettings.getString("backHost") + "lista_inventario.php"
	);

	console.log(appSettings.getString("token"));

	await fetch(conectionLink)
		.then(async (resp) => {
			if (resp.ok) {
				return await resp.json();
			}
		})
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
	const id = args.view.getViewById("id").text;
	console.log(id)
	const navegation = {
		moduleName: "Views/products/details/detail-products-page",
		transition: {
			name: "slide",
		},
		context: {
			id,
		},
	};

	console.log("ITEM: " + JSON.stringify(navegation))
	Frame.topmost().navigate(navegation);
};

exports.Back = (args) => {
	const button = args.object;
	const page = button.page;
	page.frame.goBack();
};
