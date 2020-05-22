const SaleOutViewModel = require("./sale-out-view-model");
const appSettings = require("tns-core-modules/application-settings");
const { Label } = require("tns-core-modules/ui/label");
var dialogs = require("tns-core-modules/ui/dialogs");
var { Frame } = require("tns-core-modules/ui/frame");
const { Button } = require("tns-core-modules/ui/button");
var saleOutViewModel = new SaleOutViewModel();
const { Carousel } = require("nativescript-carousel");
const { ObservableArray } = require("tns-core-modules/data/observable-array");
var photoViewerModule = require("nativescript-photoviewer");
const moment = require("moment");
moment.locale("es");
const {
	verifyToken,
	deleteSesion,
	createActivityIndicator,
	parseJSON,
	checkStatus,
	randomColor,
} = require("../../../functions");

exports.onNavigatingTo = async (args) => {
	const page = args.object;
	page.bindingContext = saleOutViewModel;
	
};

exports.toMain = (args) => {
	const navegation = {
		moduleName: "Views/main/main-page",
		clearHistory: true,
		transition: {
			name: "slide",
		},
	};
	try {
		Frame.topmost().navigate(navegation);
	} catch(err) {
		console.error(err);
	}
}
