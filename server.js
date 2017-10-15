var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Note = require("./models/note.js");
var Article = require("./models/article.js");
var request = require("request");
var cheerio = require("cheerio");

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

mongoose.connect("mongodb://admin:password@ds019956.mlab.com:19956/heroku_0jck3clt");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {
	request("http://www.nytimes.com/pages/todayspaper/index.html?action=Click&module=HPMiniNav&region=TopBar&WT.nav=page&contentCollection=TodaysPaper&pgtype=Homepage#nytfrontpage", 
	function(error, response, data) {
		var $ = cheerio.load(data);
		$("div.story").each(function(idx, itm, arr) {
			var result = {};
			result.title = $(this).children("a, h3").text();
			result.link = $(this).children("h3").children("a").attr("href");
			result.summary = $(this).children("p.summary").text();
			result.thumbnail = $(this).children(".thumbnail").children("a").children("img").attr("src");

			var entry = new Article(result);
			console.log(result);

			entry.save(function(err, doc) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(doc);
				}
			});
		});
		res.redirect("/");
	});
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
  }).sort({_id: -1});
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
	if (error) {
	  console.log(error);
	}
	else {
	  res.json(doc);
	}
  });
});

app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
		if (error) {
			console.log(error);
		}
		else {
			Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
			.exec(function(err, doc) {
				if (err) {
					console.log(err);
				}
				else {
					res.send(doc);
				}
			});
		}
  });
});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});