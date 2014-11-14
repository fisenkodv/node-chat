/**
 * Created by Dmitry_Fisenko on 12/22/13.
 */

var express = require('express');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(express);

var sessionStore = new MongoStore({mongoose_connection: mongoose.connection});
module.exports = sessionStore;