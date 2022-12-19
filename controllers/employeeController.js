const mongoose = require("mongoose");
const session = require("express-session");
const crypto = require("crypto");
const { Cafe } = require("../models/cafeModel");
const { User } = require("../models/userModel");
const { DB } = require("../config/config");
const { handleError } = require("../middlewares/errorHandler")

async function index(req, res) {
    await mongoose.connect(DB.uri);
    User.find({$or: [{accessLevel: 0}, {accessLevel: 1}]}).then(function(employees) {
        if(employees) {
            res.render("../views/employee.njk", {
                employees: employees
            });
        }
        else {
            handleError(res, 404);
        }
    });
}

async function create(req, res) {
    await mongoose.connect(DB.uri);
    Cafe.find({}).then(function(cafes) {
        if(cafes) {
            res.render("../views/createEmployee.njk", {
                csrf: req.session.csrf,
                cafes: cafes
            });
        }
        else {
            handleError(res, 404);
        }
    });
}

async function insert(req, res) {
    req.body.salt = crypto.randomBytes(16).toString("hex"); 
    req.body.hash = crypto.pbkdf2Sync(req.body.password ,req.body.salt, 1000, 64, "sha512").toString("hex"); 
    let newUser = new User(req.body);

    await mongoose.connect(DB.uri);  
    newUser.save(function(err) {
        if(err) {
            handleError(res, 500);
        }
        else {
            res.redirect("/employee");
        }
    });
}

async function edit(req, res) {
    await mongoose.connect(DB.uri);
    User.findOne({_id: mongoose.Types.ObjectId(req.params.employeeId)})
    .then(function(employee) {
        if(employee) {
            Cafe.find({}).then(function(cafes) {
                if(cafes) {
                    res.render("../views/editEmployee.njk", {
                        csrf: req.session.csrf,
                        employee: employee,
                        cafes: cafes
                    });
                }
                else {
                    handleError(res, 500);
                }
            });
        }
        else {
            handleError(res, 404);
        }
    });
}

async function update(req, res) {
    await mongoose.connect(DB.uri);
    User.findOne({_id: mongoose.Types.ObjectId(req.params.employeeId)})
    .then(function(employee) {
        if(employee) {
            for([key, value] of Object.entries(req.body)) {
                employee[key] = value;
            }
            employee.save(function(err) {
                if(err) {
                    handleError(res, 500);
                }
                else {
                    res.redirect("/employee");
                }
            });
        }
        else {
            handleError(res, 404);
        }
    });
}

async function deleteEmployee(req, res) {
    await mongoose.connect(DB.uri);
    User.deleteOne({_id: mongoose.Types.ObjectId(req.params.employeeId)}, function(err, deletedEmployee) {
        if(err) {
            handleError(res, 500);
        }
        else {
            res.send("OK");
        }
    });
}

module.exports = {
    index, create, insert, edit, update, deleteEmployee
}