 const express = require('express');
 const mongoose = require('mongoose');
 const bcrypt = require('bcrypt');
 const jwt = require('jsonwebtoken');
 const router = express.Router();
 const checkAuth = require('../middleware/check-auth');

 const User = require('../models/user');

 router.get('/', checkAuth, (req, res) => {
     User.find({}, (err, docs) => {
         if (!err) {
             res.status(200).json({
                 count: docs.length,
                 users: docs
             })
         } else {
             res.status(404).json({
                 error: err
             })
         }
     })
 });

 router.post('/signup', (req, res) => {
     User.find({ email: req.body.email }, (err, doc) => {
         if (doc.length > 0) {
             //console.log("inside find ", doc);
             res.status(409).json({
                 message: 'this email already exists'
             });
         } else {
             const saltRounds = 10;
             const plainTextPassword = req.body.password;

             bcrypt.genSalt(saltRounds, function(err, salt) { //generate salt 
                 if (!err)
                     bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                         if (!err) {
                             const user = new User({
                                 _id: new mongoose.Types.ObjectId(),
                                 email: req.body.email,
                                 password: hash
                             });
                             user.save((err, result) => {
                                 if (!err) {
                                     res.status('201').json({
                                         message: 'user created'
                                     })
                                 } else {
                                     res.status('500').json({
                                         error: err
                                     })
                                 }
                             });
                         } else {
                             res.status('500').json({
                                 error: err
                             })
                         }
                     })
             });
         }
     });
 });

 router.post('/login', (req, res) => {
     User.find({ email: req.body.email }, (err, user) => {
         if (!err) {
             if (user.length > 0) {
                 bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                     if (!err) {
                         if (result) {
                             // get TOKEN
                             const token = jwt.sign({
                                     email: user[0].email,
                                     userId: user[0]._id
                                 },
                                 'secret', {
                                     expiresIn: "1h"
                                 }
                             );
                             res.status(200).json({
                                 message: 'Auth successful',
                                 token: token
                             });

                         } else {
                             res.status(401).json({
                                 message: 'Auth failed'
                             })
                         }
                     } else
                         res.status(401)
                 })
             }
         } else {
             res.status(401).json({
                 message: 'Auth failed'
             })
         }
     })
 })

 router.delete("/:userId", (req, res, next) => {
     User.deleteOne({ _id: req.params.userId }, (err, result) => {
         if (!err) {
             res.status(200).json({
                 message: "User deleted"
             });
         } else {
             //console.log(err);
             res.status(500).json({
                 error: err
             });
         }
     })
 });

 module.exports = router;