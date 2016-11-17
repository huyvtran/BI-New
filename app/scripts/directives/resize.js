'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("resize", function($window) {
    return {
        restrict: "A",
        link: function (scope, element) {
            scope.getHeight = function () {
                return $(element).height();
            };
            scope.$watch(scope.getHeight, function (height) {
                $(element).find('#main-div').removeAttr("style");
                var navHeight = $(element).find('#nav-menu').height();
                var divHeight = $(element).find('#page-wrapper').height();
//                console.log(height);
//                console.log($(element).find('#nav-menu').height());
//                console.log($(element).find('#page-wrapper').height());
                if(parseInt(navHeight, 10) > parseInt(divHeight,  10)) {
//                    console.log('in if');
                    $(element).find('#main-div').height(navHeight);
                } else {
//                    console.log('in else');
                }
            });
            
            scope.getHeightNav = function () {
                return $(element).find('#nav-menu').height();
            };
            scope.$watch(scope.getHeightNav, function (height) {
                $(element).find('#main-div').removeAttr("style");
                var navHeight = $(element).find('#nav-menu').height();
                var divHeight = $(element).find('#page-wrapper').height();
                if(parseInt(navHeight, 10) > parseInt(divHeight,  10)) {
                    $(element).find('#main-div').height(navHeight);
                } else {
                }
            });
        }
   }
});