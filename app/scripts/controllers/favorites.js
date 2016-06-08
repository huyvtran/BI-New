'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp. Controls the favorite page.
 */
angular.module('myBiApp')
.controller('favoritesCtrl', function ($scope, reportsFactory) {
    var favoriteService = new reportsFactory.reportsFactoryFunction('favorite');
    
    $scope.setListView = function (status) {
        if ($scope.myfavorites) {
            $scope.myfavorites.service['listView'] = status;
            //$scope.groupsData['listView']=status;

        }
        if (!$scope.dataObj) {
            return;
        }
        else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].service.listView = status;
            }
        }
    }

    $scope.myfavorites = {
        'title': 'My Favorites',
        'open': true,
        'limit': undefined,
        'class_names': 'col-lg-2 col-md-4 col-sm-4 col-xs-6 report-tile',
        'loadmoredisable': favoriteService.loadmoredisable,
        'service': favoriteService,
        'data': favoriteService.reports
    };
    $scope.setListView(false);
});
