const MainViewModel = require("./main-view-model");
var mainViewModel = new MainViewModel();

function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = mainViewModel;
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

exports.onNavigatingTo = onNavigatingTo;
