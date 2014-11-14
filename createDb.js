/**
 * Created by Dmitry_Fisenko on 12/18/13.
 */

var mongoose = require('libs/mongoose');
var async = require('async');
var User = require('models/user').User;

// 1. Create database
// 2. create & save 3 users
// 3. close connection

async.series([
    open,
    dropDatabase,
    createUsers,
    close
], function (err, results) {
    console.log(arguments);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function createUsers(callback) {
    async.parallel([
        function (callback) {
            var admin = new User({username: 'admin', password: 'Welcome01'});
            admin.save(function (err) {
                callback(err, admin);
            })
        },
        function (callback) {
            var dima = new User({username: 'dima', password: 'Welcome01'});
            dima.save(function (err) {
                callback(err, dima);
            })
        },
        function (callback) {
            var vasya = new User({username: 'vasya', password: 'Welcome01'});
            vasya.save(function (err) {
                callback(err, vasya);
            })
        }
    ], callback);
}

function close(callback) {
    mongoose.disconnect(callback);
}