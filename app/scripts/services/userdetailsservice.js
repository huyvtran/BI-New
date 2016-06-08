'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userDetailsService
 * @description
 * # userDetailsService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('userDetailsService', function userDetailsService(WEBSERVICEURL, $http, $q, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var userObject, userPromise = $q.defer();
    $http.get(WEBSERVICEURL.getUserDetails).then(function (resp) {
        userObject = resp.data;
        $http.get(commonService.prepareUserInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].userinfo = response.data;
            userPromise.resolve(userObject);
        });

        $http.get(commonService.prepareGetUserPersonaInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].personaInfo = response.data;
            userPromise.resolve(userObject);
        });       
    });
    return {
        'userObject': userObject,
        'userPromise': userPromise.promise,
    };
});
