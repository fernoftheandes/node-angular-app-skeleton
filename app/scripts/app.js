'use strict';

require('lodash');
require('angular');
require('angular-ui-bootstrap');

// main controller logic exported from mainController.js
var mainController = require('../controllers/mainController.js');

var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainController', ['$scope', mainController]);
