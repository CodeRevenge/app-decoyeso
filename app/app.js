/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");

// appSettings.setString("backHost", "http://ppicucei.000webhostapp.com/decoyeso/")
appSettings.setString(
	"backHost",
	"http://deco-yeso.000webhostapp.com/decoyeso/"
);
// appSettings.setString("backHost", "localhost/backend-decoyeso/")

if (!appSettings.getBoolean("auth")) {
	console.log("No auth");
	application.run({ moduleName: "app-login" });
} else {
	console.log("Auth");
	application.run({ moduleName: "app-root" });
}

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
