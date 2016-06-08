'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userDetailsService
 * @description
 * # userDetailsService
 * Service in the myBiApp.
 */
angular.module('adminPageApp')
.service('userDetailsService', function userDetailsService(WEBSERVICEURL, $http, $q, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var userObject, userPromise = $q.defer();
    $http.get(WEBSERVICEURL.getUserDetails).then(function (resp) {
        userObject = resp.data;
        $http.get(commonService.prepareUserInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].userinfo = response.data;
            userPromise.resolve(userObject);
        });
    }, function () {
        //failed
        userObject = [{"uid": "975409", "userFullName": "Vidyadhar Guttikonda", "emcIdentityType": "V", "title": "Mobile Developer", "mail": "Vidyadhar.Guttikonda@emc.com", "emcCostCenter": "IN1218315", "emcGeography": null, "emcOrgCode": null, "emcOrgName": "IT", "emcEntitlementsCountry": "IN", "emcLoginName": "guttiv", "emctelephoneextension": null, "telephonenumber": "91  7702466463"}];
        userObject[0].userinfo = {"group": [{"groupId": 1, "groupName": "Manufacturing"}], "role": "User", "badge": "Bronze"};
        userPromise.reject(userObject);
    });
    return {
        'userObject': userObject,
        'userPromise': userPromise.promise
    };
});
