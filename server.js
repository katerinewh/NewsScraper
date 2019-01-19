var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var port = process.env.PORT ||3000;

var app = express();
require("./routing/htmlRoutes")(app)
require("./routing/apiRoutes")(app)


// Configure middleware
app.use(logger("dev"));
// Use body-parser for form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.Promise = Promise;
var databaseUri = 'mongodb://localhost/NYT';
if(process.env.MONGODB_URI){
	databaseUri=process.env.MONGODB_URI;
}
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

var test = mongoose.connection;
test.on('error',function(err){
  console.log('Mongoose Error:', err);
})

// Start the server
app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
