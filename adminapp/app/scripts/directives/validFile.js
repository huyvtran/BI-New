'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:ngFiles
 * @description
 * # ngFiles
 */
angular.module('adminPageApp')
.directive('validFile', function () {
    var validFormats = ['csv'];
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            elem.bind('change', function () {
                validImage(false);
                scope.$apply(function () {
                    ngModel.$render();
                });
            });
            ngModel.$render = function () {
                ngModel.$setViewValue(elem.val());
            };
            function validImage(bool) {
                ngModel.$setValidity('extension', bool);
            }
            ngModel.$parsers.push(function (value) {
                var ext = value.substr(value.lastIndexOf('.') + 1);
                if (ext == '')
                    return;
                if (validFormats.indexOf(ext) == -1) {
                    return value;
                }
                validImage(true);
                return value;
            });
        }
    };
});