//'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
//angular.module("myBiApp")
//.filter('highlight', function($sce) {
//    return function(text, phrase) {
//        console.log(text);
//        console.log(phrase);
//        if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
//        '<span class="highlighted">$1</span>')
//
//        return $sce.trustAsHtml(text)
//    }
//});

//.filter('highlight', function($sce) {
//    return function(str, termsToHighlight) {
//    // Sort terms by length
//        termsToHighlight.sort(function(a, b) {
//            return b.length - a.length;
//        });
//        // Regex to simultaneously replace terms
//        var regex = new RegExp('(' + termsToHighlight.join('|') + ')', 'g');
//        return $sce.trustAsHtml(str.replace(regex, '<span class="match">$&</span>'));
//    };
//});