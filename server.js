var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require('mongoose');

var db = require("./models");
var routes = require("./routes/html-routes.js");
var PORT = process.env.PORT || 8080;
var app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use("/", routes)

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongo_scraper", {
    useMongoClient: true
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});




