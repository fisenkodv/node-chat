/**
 * Created by Dmitry_Fisenko on 12/15/13.
 */

var nconf = require('nconf');
var path = require('path');

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, 'config.json')});

module.exports = nconf;