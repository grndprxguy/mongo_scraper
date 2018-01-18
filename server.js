var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require('mongoose');
var path = require("path");

var db = require("./models");

var PORT = process.env.PORT || 8080;
var app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ 
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
 }));
app.set("view engine", "handlebars");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo_scraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var routes = require("./routes/html-routes.js");
app.use("/", routes)

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});