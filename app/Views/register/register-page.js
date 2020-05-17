var RegisterViewModel = require("./register-view-model");
var registerViewModel = new RegisterViewModel();
const dialogs = require("tns-core-modules/ui/dialogs");

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = registerViewModel;
}

exports.Register = (args) => {
    const login = args.object;
    const loginParent = login.parent;

    const curp = loginParent.getViewById("curp");
    const nickname = loginParent.getViewById("nickname");
    const firstName = loginParent.getViewById("firstName");
    const lastName = loginParent.getViewById("lastName");
    const password = loginParent.getViewById("password");
    const rep_password = loginParent.getViewById("rep_password");
    const birthDay = loginParent.getViewById("birthDay");
    const addres = loginParent.getViewById("addres");
    const phone = loginParent.getViewById("phone");



    if (password.text !== rep_password.text) {
        password.className += " input-invalid";
        rep_password.className += " input-invalid";
        
        dialogs.alert({
            title: "Las contraseñas no coinciden",
            message: `Verifique que las contraseñas coincidan.`,
            okButtonText: "Ok",
        })

        return;
    }

    let replace = "input-invalid";

    password.className = password.className.replace(replace, "");
    rep_password.className = rep_password.className.replace(replace, "");
    curp.className = curp.className.replace(replace, "");
    nickname.className = nickname.className.replace(replace, "");



    

    const conectionLink = appSettings.getString("backHost") + "alta_empleado.php";

    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            const response = JSON.parse(this.responseText);
			if (response.status === "OK") {
                dialogs.alert({
                    title: "Nuevo Usuario",
                    message: `Usuario registrado`,
                    okButtonText: "Ok",
                }).then(() => {
                    const navegation = {
                        moduleName: "Views/main/main-page",
                        clearHistory: true,
                        transition: {
                            name: "slide",
                        },
                    };

                    appSettings.setString("token", response.jwt);
                    appSettings.setBoolean("auth", true);

                    args.object.page.frame.navigate(navegation);
                })
			} else if(response.status === "EXIST_ERROR") {
                
                if(response.errorCode === 1) {
                    curp.className += " input-invalid";
                    
                    dialogs.alert({
                        title: "CURP Invalido",
                        message: `El CURP: ${curp} ya existe.`,
                        okButtonText: "Ok",
                    })
            
                    return;
                } else if(response.errorCode === 2) {
                    nickname.className += " input-invalid";
                    
                    dialogs.alert({
                        title: "Nombre de usuario invalido",
                        message: `El nombre de usuario: ${nickname} ya existe.`,
                        okButtonText: "Ok",
                    })
                }
                
            }else if (response.status === "WARNING") {
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
    let URI = encodeURI(`${conectionLink}?curp=${curp.text}&nickname=${nickname.text}&`
                +`pw=${password.text}&nombre=${firstName.text}&apellido=${lastName.text}&`
                +`nacimiento=${birthDay.year}-${birthDay.month}-${birthDay.day}`
                +`&direccion=${addres.text}&telefono=${phone.text}`)
    console.log(URI);
	xhttp.open("GET", URI, true);
	xhttp.send();
}

exports.Cancel = (args) => {
    const button = args.object;
    const page = button.page;
    page.frame.goBack();
}

exports.pageLoaded = pageLoaded;