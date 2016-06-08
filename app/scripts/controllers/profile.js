'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ProfileCtrl', function ($scope, userDetailsService, commonService) {
    $scope.setLoading(true);
    $scope.badge = '0%';
    $scope.badgePercentage = {
        'Bronze': '25%',
        'Silver': '50%',
        'Gold': '75%',
        'Platinum': '100%'
    };
    
    userDetailsService.userPromise.then(function (response) {
        $scope.setLoading(false);
        $scope.userObject = response[0];
        $scope.badge = $scope.badgePercentage[$scope.userObject.userinfo.badge];
        console.log($scope.badge);
        $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
    });
});
