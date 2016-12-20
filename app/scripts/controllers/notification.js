'use strict';


angular.module('myBiApp').controller('NotificationModalCtrl', function ($scope, $uibModalInstance, items, $http) {
    $scope.notificationAlert = items.data;
    
    $scope.dismissAlert = function () {
        $uibModalInstance.close($scope.notificationAlert);
    };
    
    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
});


angular.module('myBiApp').controller('DeleteNotificationModalCtrl',function($scope,items,$uibModalInstance){
    $scope.items = items;
    $scope.message = '';
    
    $scope.delete = function(){
        $uibModalInstance.close($scope.items);
    };
    
    $scope.cancel = function(){
      $uibModalInstance.dismiss('cancel');  
    };
});