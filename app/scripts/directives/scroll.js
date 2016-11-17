'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("scroll", function($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            if (this.pageYOffset >=40) {
                scope.scrollVariable = true;
            } else {
                scope.scrollVariable = false;
            }
            scope.$apply();
        });
    }
});