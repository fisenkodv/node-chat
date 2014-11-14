/**
 * Created by Dmitry_Fisenko on 12/22/13.
 */

var log = require('libs/log')(module);
var config = require('config');
var connect = require('connect');
var async = require('async');
var cookie = require('cookie');
var sessionStore = require('libs/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;

function loadSession(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (arguments.length == 0) {
            // no argument => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser(session, callback) {
    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }
    log.debug("Retrieving user", session.user);
    User.findById(session.user, function (err, user) {
        if (err)return callback(err);
        if (!user)
            return callback(null, null);
        log.debug("User findById is: ", user);
        callback(null, user);
    });
}

module.exports = function (server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');
    io.set('logger', log);
    io.set('authorization', function (handshake, callback) {
        async.waterfall([
            function (callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:key')];
                var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));
                loadSession(sid, callback);
            },
            function (session, callback) {
                if (!session) {
                    return callback(new HttpError(401, 'No session'));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function (user, callback) {
                if (!user) {
                    return callback(new HttpError(403, 'Anonymous session may not connect'));
                }

                handshake.user = user;
                callback(null);
            }
        ], function (err) {
            if (!err) {
                return callback(null, true);
            }

            if (err instanceof HttpError) {
                return callback(null, false);
            }

            callback(err);
        });
    });

    io.sockets.on('session:reload', function (sid) {
        var clients = io.sockets.clients();
        clients.forEach(function (client) {
            if (client.handshake.session.id != sid)return;

            loadSession(sid, function (err, session) {
                if(err){
                    client.emit('error', 'server error');
                    client.disconnect();
                    return;
                }

                if(!session){
                    client.emit('logout');
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });
        });
    });

    io.sockets.on('connection', function (socket) {
        var username = socket.handshake.user.get('username');
        socket.broadcast.emit('join', username);
        socket.on('message', function (msg, callback) {
            socket.broadcast.emit('message', username, msg);
            callback();
        });
        socket.on('disconnect', function () {
            socket.broadcast.emit('leave', username);
        })
    });

    return io;
};