'use strict';

require('../../bower_components/lodash/lodash.js');
require('../../bower_components/angular/angular.js');
require('../../bower_components/angular-bootstrap/ui-bootstrap-tpls.js');

// main controller logic exported from mainController.js
var mainController = require('../controllers/mainController.js');

var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainController', ['$scope', mainController]);
