'use strict';

angular.module('adminPageApp').controller('deleteModalCtrl',function($scope,items,$uibModalInstance){
    $scope.items=items;
    $scope.message = '';
    
    if($scope.items.pageType==='News'){
        $scope.message = 'Are you sure to delete NewsID ' + $scope.items.data.id + ' from Insights';
    } else if($scope.items.pageType==='Communication'){
        $scope.message = 'Are you sure to delete CommunicationID ' + $scope.items.data.communicationId + ' from Insights';
    } else if($scope.items.pageType === 'Groups'){
        $scope.message = 'Are you sure to delete PersonaID ' + $scope.items.data.groupId + ' from Insights';
    } else if($scope.items.pageType === 'Levels'){
        $scope.message = 'Are you sure to delete LevelID ' + $scope.items.data.levelId + ' from Insights';
    } else if($scope.items.pageType === 'Users'){
        $scope.message = 'Are you sure to delete UserName ' + $scope.items.data.userName + ' from Insights';
    }
    
    $scope.delete=function(deleteObj){
        $uibModalInstance.close(deleteObj);
    };
    
    $scope.cancel = function(){
      $uibModalInstance.dismiss('cancel');  
    };
    
    
    
    
});

