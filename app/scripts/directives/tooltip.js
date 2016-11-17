'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show').click( function () {
                    $this.attr('title', '');
                });
                var $this = $(this);
                $this.data('title', $this.attr('title'));
                // Using null here wouldn't work in IE, but empty string will work just fine.
                $this.attr('title', '');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
                var $this = $(this);
                $this.attr('title', $this.data('title'));
            });
            
            $(element).on('click', function () {
                var title = $(element).attr('data-original-title'),
                    newTitle = '';
                
                if(title === 'Mark as favorite') {
                    newTitle = 'Remove favorite';
                } else if(title === 'Remove favorite') {
                    newTitle = 'Mark as favorite';
                }
                
                if(newTitle) {
                    $(element).removeAttr('data-original-title');
                    $(element).attr('title', newTitle)
                        .attr('data-original-title', newTitle)
                        .tooltip('fixTitle')
                        .data('bs.tooltip')
                        .$tip.find('.tooltip-inner')
                        .text(newTitle)
                        .tooltip('show')
                        .attr('title', '');
                }
            });
        }
    };
});