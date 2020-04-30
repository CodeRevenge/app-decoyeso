var LoginViewModel = require("./login-view-model");
var loginViewModel = new LoginViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");
const { Frame } = require('ui/frame');

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = loginViewModel;
}

exports.Login = (args) => {
    const login = args.object;
    const loginParent = login.parent;

    const nickname = loginParent.getViewById("nickname");
    const password = loginParent.getViewById("password");

    const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/login.php";

    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
			if (response.status === "OK") {
                
                dialogs.alert({
                    title: "LOGIN",
                    message: `${response.message}`,
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
	let URI = encodeURI(`${conectionLink}?nickname=${nickname.text}&password=${password.text}`)
    
	xhttp.open("GET", URI, true);
	xhttp.send();
}

exports.btnRegister = args => {
    // navegacion a la ventana Bajas
    const navegation = {
      moduleName: "Views/register/register-page",
      transition: {
        name: "slide"
      }
    };
    Frame.topmost().navigate(navegation);
}

exports.Login = args => {
    // navegacion a la ventana Bajas
    const navegation = {
      moduleName: "Views/register/main-page",
      transition: {
        name: "slide"
      }
    };
    Frame.topmost().navigate(navegation);
}



exports.pageLoaded = pageLoaded;