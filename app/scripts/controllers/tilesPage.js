'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesPageCtrl
 * @description
 * # tilesPageCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('tilesPageCtrl', function ($scope, $http, $location, WEBSERVICEURL) {
    $http.get(WEBSERVICEURL.reportTileBigroup)
            .success(function (response) {
                $scope.biGroupList = response;
            });

    $http.get(WEBSERVICEURL.reportTileRoles)
            .success(function (response) {
                $scope.roleList = response;
            });

    $scope.formData = {
        linkId: null,
        bIGroup: '',
        tileTitle: '',
        tileSubtitle: '',
        role: '',
        scope: 'scope',
        navigateTo: 'navigateTo',
        linkTitle: '',
        link: '',
        createDate: null,
        updateDate: null,
        linkUsed: 0,
        rowStatus: null,
        mobileLink: 'mobileLink',
        ordinal: null
    };

    //MyBIRoleLinkMapping = {'linkId':null, 'bIGroup':'testbigroup', 'tileTitle':'test', 'tileSubtitle':'testSubTitle', 'role':'Rep', 'scope':'scope', 'navigateTo':'navigateTo', 'linkTitle':'linkTitle', 'link':'link', 'createDate':null, 'updateDate':null, 'linkUsed':'linkUsed', 'rowStatus':null, 'mobileLink':'mobileLink', 'ordinal':null};
    $scope.addTile = function () {
        $http({
            method: 'POST',
            url: WEBSERVICEURL.reportTileAdd,
            headers: {'Content-Type': 'application/json'},
            /*transformRequest: function(obj) { 
             var str = []; 
             for(var p in obj) 
             str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p])); 
             return str.join('&'); },*/
            data: $scope.formData
            }).success(function () {
                $scope.formData = {
                    linkId: null,
                    bIGroup: '',
                    tileTitle: '',
                    tileSubtitle: '',
                    role: '',
                    scope: 'scope',
                    navigateTo: 'navigateTo',
                    linkTitle: '',
                    link: '',
                    createDate: null,
                    updateDate: null,
                    linkUsed: 0,
                    rowStatus: null,
                    mobileLink: 'mobileLink',
                    ordinal: null
                };
            });
    };

    $scope.movePanelTo = function (newPosition) {
        console.log(newPosition);
    };

    $scope.cancelTile = function () {
        $location.path('/');
    };
});
