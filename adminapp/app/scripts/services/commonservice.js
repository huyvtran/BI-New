'use strict';

/**
 * @ngdoc service
 * @name myBiApp.commonService
 * @description
 * # commonService
 * Service in the myBiApp.
 */
angular.module('adminPageApp')
.service('commonService', function commonService(WEBSERVICEURL) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    /**
     *prepare the user profile Url
     */
    this.prepareUserProfilePicUrl = function (entityId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userProfilePic, {'entityId': entityId});
    };

    /**
     *prepare the user Info Url
     */
    this.prepareUserInfoUrl = function (username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userInfo, {'username': username});
    };


    /**
     *prepare the user Role Details Url
     */
    this.prepareUserRoleDetailsUrl = function (username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.dashboard, {'username': username});
    };


    /**
     *Replace matching object keys in string with its values.
     */
    this.replaceStringWithValues = function (rString, replaceObject) {
        _.map(_.keys(replaceObject), function (key) {
            rString = rString.replace(new RegExp(':' + key, 'g'), replaceObject[key]);
        });
        return rString;
    };
});
