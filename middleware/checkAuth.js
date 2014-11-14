/**
 * Created by Dmitry_Fisenko on 12/22/13.
 */

var HttpError = require('error').HttpError;

module.exports = function (req, res, next) {
    if (!req.session.user) {
        return next(new HttpError(401, "User not authorized"));
    }
    next();
};