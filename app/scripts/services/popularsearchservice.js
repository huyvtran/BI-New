'use strict';

/**
 * @ngdoc service
 * @name myBiApp.popularSearchService
 * @description
 * # popularSearchService
 * Execute popular search webservice and return list of popular search's.
 */
angular.module('myBiApp')
.service('popularSearchService', function popularSearchService($http, WEBSERVICEURL, $state, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return $http.get(WEBSERVICEURL.popularSearch).then(function (resp) {
        _.map(resp.data, function (eachItem) {
            eachItem.text = eachItem.searchString;
            eachItem.weight = eachItem.searchCount;
            eachItem.handlers = {click: function () {
                angular.element('.color-white').triggerHandler('click');    
                if($rootScope.searchin === 'persona' || !$rootScope.searchin) {
                    $state.go('search', {'searchText': eachItem.searchString, 'persona': 'Y'});
                } else {
                    $state.go('search', {'searchText': eachItem.searchString, 'persona': 'N'});
                }
            }};
            return eachItem;
        });
        return resp.data;
    });
});
