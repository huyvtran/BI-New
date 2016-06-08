'use strict';

/**
 * @ngdoc service
 * @name myBiApp.WEBSERVICEURL
 * @description List of All webservices listed here
 * # WEBSERVICEURL
 * Constant in the myBiApp.
 */
angular.module('adminPageApp')
.constant('WEBSERVICEURL', {
    'getUserDetails'        : 'BITool/getUserDetails',//
    'userInfo'              : 'BITool/userinfo/:username',//
    'dashboard'             : 'BITool/dashboard/:username',//
    //this not an ajax call and '/' is not appended from app.js. So appended '/' to work same in www folder also
    'userProfilePic'        : '/BITool/getEmployeeImage/:entityId'
});