/**
 * Created by Dmitry_Fisenko on 12/21/13.
 */

var User = require('models/user').User;
var AuthError = require('error').AuthError;
var HttpError = require('error').HttpError;
var async = require('async');

exports.get = function (req, res) {
    res.render('login');
};

exports.post = function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.authorize(username, password, function (err, user) {
        if (err) {
            if (err instanceof AuthError){
                return next(new HttpError(403, err.message));
            }else{
                return next(err);
            }
        }

        req.session.user = user.id;
        res.send({});
    });
};