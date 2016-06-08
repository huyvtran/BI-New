'use strict';

/**
 * @ngdoc service
 * @name myBiApp.carouselService
 * @description
 * # carouselService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('carouselService', function carouselService($q, $http, userDetailsService, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var defer = $q.defer(), carousel = defer.promise;
    userDetailsService.userPromise.then(function (response) {
        var url = commonService.prepareUserCommunicationUrl(response[0].emcLoginName);
        $http.get(url).then(function (resp) {
            defer.resolve(resp.data);
        });
    });

    return carousel;
});
