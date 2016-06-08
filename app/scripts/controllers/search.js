'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchCtrl', function ($scope, $stateParams, reportsFactory) {
    //subcaption for subheader
    $scope.mainState.$current.data.subCaption = $stateParams.searchText;
    $scope.groupsData = {};
    console.log($stateParams);
    return;
    function doSearch(text) {
        var groupService = new reportsFactory.reportsFactoryFunction('search', text, $stateParams.persona);
        $scope.setLoading(false);
        /*groupService.loadReports().then(function(){
         });
         groupService.loadmoredisable = true;*/
        $scope.groupsData = {
            'title': 'Search',
            'open': true,
            'limit': undefined,
            'class_names': 'col-xs-12',
            'loadmoredisable': groupService.loadmoredisable,
            'service': groupService,
            'data': groupService.reports/*,
             'searchTypePersona' : $stateParams.persona*/
        };
    }
    $scope.setLoading(true);
    doSearch($stateParams.searchText);
});