const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Cafe } = require("../models/cafeModel");
const { User } = require("../models/userModel");
const { DB } = require("../config/config");
const { RestrictRoute } = require("../middlewares/auth");

router.get("/", RestrictRoute, function (req, res) {
    mongoose.connect(DB.uri);
    Cafe.find({}).then(function(cafes) {
        if(cafes) {
            User.findOne({_id: mongoose.Types.ObjectId(req.session.userId)})
            .then(function(user) {
                if(user) {
                    res.render("../views/index.njk", {
                        username: user.firstName + " " + user.lastName,
                        userLevel: user.accessLevel,
                        cafes: cafes
                    });
                }
                else {
                    res.redirect("/user/login");
                }
            });
        }
    });
});
module.exports = router;
