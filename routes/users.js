const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')

//load user model
require('../models/user');
const User = mongoose.model('users');

//login
router.get('/login', (req, res) => {
    res.render('users/login')
})
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: "/ideas",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
})

router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.pwd != req.body.confirm_pwd) {
        errors.push({
            text: 'Passwords do not match'
        });
    }

    if (req.body.pwd.length < 4) {
        errors.push({
            text: 'Password must be at least 4 characters'
        });
    }
    if (!req.body.name) {
        errors.push({
            text: 'Plz enter name'
        })
    }
    if (!req.body.email) {
        errors.push({
            text: 'Plz enter email'
        })
    }
    if (!req.body.pwd) {
        errors.push({
            text: 'Plz enter password'
        })
    }
    if (!req.body.confirm_pwd) {
        errors.push({
            text: 'Plz confirm password'
        })
    }
    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.pwd,
            confirm_pwd: req.body.confirm_pwd
        })
    } else {
        User.findOne({
                email: req.body.email
            })
            .then(user => {
                if (user) {
                    req.flash('error_msg', "Email already register")
                    res.redirect('/users/register');
                } else {
                    const newUser = {
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.pwd
                    }

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) throw err;
                            newUser.password = hash
                            new User(newUser).save()
                                .then(user => {
                                    req.flash('success_msg', "Add successfully")
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err)
                                    return;
                                })
                        });
                    });
                }
            })
    }
})

//logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logout successfully');
    res.redirect('/users/login')
})

module.exports = router