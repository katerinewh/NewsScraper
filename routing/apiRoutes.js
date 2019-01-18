var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
module.exports = function (app) {
    app.get("/scrape", function (req, res) {

        axios.get("http://www.nytimes.com/section/world?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=World&WT.nav=page").then(function (response) {
            //  load tocheerio 
            var $ = cheerio.load(response.data);
            var results = new Array();
            $(".story-body").each(function (i, element) {
                var result = {};
                result.title = $(this)
                    .children(".headline")
                    .text().replace(/ +(?= )/g, '').replace(/\n/g, '');
                result.summary = $(this)
                    .children(".summary")
                    .text();

                // Create a new Article 
                if (result.title.length > 5 && result.summary.length > 5) {
                    db.Article
                        .create(result)
                        .then(function (dbArticle) {

                            // console.log("Article saved");
                        })
                        .catch(function (err) {

                            console.log(err);
                        });
                   
                }
            });
            db.Article.find({})
            .then(function (dbArticle) {

                res.json(dbArticle);
            })
            .catch(function (err) {

                console.log(err);
            });
        });
    });

    app.post("/api/save", function (req, res) {

        db.Article
            .create(req.body)
            .then(function (dbArticle) {

                console.log("Article saved");
            })
            .catch(function (err) {

                res.json(err);
            });
    });


    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {

        db.Article
            .find({})
            .then(function (dbArticle) {
                res.json(dbArticle)
            })
            .catch(function (err) {
                res.json(err);
            });

    });


    app.delete("/api/article/:id", function (req, res) {
        db.Article
            .remove({ "_id": req.params.id })
            .then(function (dbArticle) {
                res.json(dbArticle)
            })
    });


    app.get("/articles/:id", function (req, res) {

        db.Article
            .findOne({ "_id": req.params.id })
            .populate("comment")
            .then(function (dbArticle) {
                res.json(dbArticle)
            })
            .catch(function (err) {
                res.json(err);
            });

    });

    //creating a comment 
    app.post("/api/new_comment/:id", function (req, res) {

        db.Comment
            .create(req.body)
            .then(function (dbComment) {
                //res.json(dbArticle)
                return db.Article.findOneAndUpdate(
                    { _id: req.params.id },
                    { comment: dbComment._id },
                    { new: true }
                );
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    //delete a note
    app.delete("/comment/:id", function (req, res) {
        db.Comment
            .remove({ "_id": req.params.id })
            .then(function (dbArticle) {
                res.json(dbArticle)
            })
    });
}