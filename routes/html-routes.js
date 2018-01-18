var db = require("../models");
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");
var express = require("express");
var request = require("request");
var router =express.Router();
var cheerio = require("cheerio");

router.get("/", function(req, res) {
    Article.find({"saved": false}, function(error, data){
        var obj = {
            article: data
        };
        res.render("index", obj);
    })
});

router.get("/scrape", function (req, res) {
    request("http://www.npr.org/sections/news", function (error, response, html) {
        var $ = cheerio.load(html);
        $("h2.title").each(function (i, element) {
            var result = {};
            result.link = $(element).children().attr("href");
            result.title = $(element).children().text();
            result.summary = $(element).parent(".item-info").children("p.teaser").text();
            db.Article.create(result)
          .then(function(dbArticle){
              console.log(dbArticle);
          }).catch(function(err) {
              res.json(err);
          })
        });
        res.send("Scrape Complete");

    });
});

router.get("/saved", function (req, res) {
    db.Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
        var obj = {
            article: articles
        };
        res.render("saved", obj);
    });
});

router.get("/articles", function (req, res) {
    db.Article
        .find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        }).then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

router.post("/articles/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .then(function(dbArticle) {
            res.json(dbArticle);
        }).catch(function(err) {
            res.json(err);
        })
});

router.post("/articles/delete/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .then(function(dbArticle) {
            res.json(dbArticle);
        }).catch(function(err) {
            res.json(err);
        })
});

router.post("/notes/save/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body)
    // And save the new note the db
    newNote.save(function (error, note) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's notes
            db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
                // Execute the above query
                .exec(function (err) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        // Or send the note to the browser
                        res.send(note);
                    }
                });
        }
    });
});

router.delete("/notes/delete/:note_id/:article_id", function (req, res) {
    db.Note.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            db.Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
            .then(function(dbNote) {
                res.send("Note Deleted")
            }).catch(function(err) {
                res.json(err);
            })
        }
    });
});

module.exports = router;