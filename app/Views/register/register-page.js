var RegisterViewModel = require("./register-view-model");
var registerViewModel = new RegisterViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = registerViewModel;
}

exports.Register = (args) => {
    // const login = args.object;
    // const loginParent = login.parent;

    // const nickname = loginParent.getViewById("nickname");
    // const password = loginParent.getViewById("password");

    // const conectionLink = "http://ppicucei.000webhostapp.com/decoyeso/login.php";

    // var xhttp = new XMLHttpRequest();
	// xhttp.onreadystatechange = function () {
	// 	if (this.readyState == 4 && this.status == 200) {
    //         console.log(this.responseText);
    //         const response = JSON.parse(this.responseText);
	// 		if (response.status === "OK") {
    //             console.log("LOGIN");
    //             dialogs.alert({
    //                 title: "LOGIN",
    //                 message: `${response.message}`,
    //                 okButtonText: "Ok",
    //             })
	// 		} else if (response.status === "WARNING") {
    //             dialogs.alert({
    //                 title: "Error",
    //                 message: `${response.message}`,
    //                 okButtonText: "Ok",
    //             })
    //         } else {
    //             dialogs.alert({
    //                 title: "Error",
    //                 message: `Sucedio un error inesperado. ${response}`,
    //                 okButtonText: "Ok",
    //             })
    //         }

	// 	}
	// };
	// let URI = encodeURI(`${conectionLink}?nickname=${nickname.text}&password=${password.text}`)
    // console.log(URI);
	// xhttp.open("GET", URI, true);
	// xhttp.send();
}

exports.Cancel = (args) => {
    const button = args.object;
    const page = button.page;
    page.frame.goBack();
}

exports.pageLoaded = pageLoaded;