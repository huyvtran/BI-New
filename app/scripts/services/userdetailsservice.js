'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userDetailsService
 * @description
 * # userDetailsService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('userDetailsService', function userDetailsService(WEBSERVICEURL, $http, $q, commonService, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var userObject, userPromise = $q.defer();
    $http.get(WEBSERVICEURL.getUserDetails).then(function (resp) {
        userObject = resp.data;
        $http.get(commonService.prepareUserInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].userinfo = response.data;
            userPromise.resolve(userObject);
        });
        if(!$rootScope.personaInfo) {
            console.log('In If');
            $http.get(commonService.prepareGetUserPersonaInfoUrl()).then(function (response) {
                userObject[0].personaInfo = response.data;
                userPromise.resolve(userObject);
            }); 
        } else {
            console.log('In Else');
            console.log($rootScope.personaInfo);
            userObject[0].personaInfo = $rootScope.personaInfo;
        }
    });
    return {
        'userObject': userObject,
        'userPromise': userPromise.promise,
    };
});