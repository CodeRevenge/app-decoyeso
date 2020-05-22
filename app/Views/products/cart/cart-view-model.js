var observableModule = require("tns-core-modules/data/observable");

function CartViewModel() {
	var viewModel = observableModule.fromObject({});

	return viewModel;
}

module.exports = CartViewModel;
