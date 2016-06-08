'use strict';

angular.module('adminPageApp').controller('LevelCtrl',function($scope, $http, $uibModal, $q, $timeout){
    $scope.myData = {};
    var levels = [];
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    
    function columnDefs(){
        return[
            {name: 'Options', width:'10%', cellTemplate: 'views/adminDropdown.html',enableSorting: false},
            {name: 'levelDesc',displayName: 'Level Name', width:'10%', cellTooltip: true },
            {name: 'levelNumber', displayName: 'Level Number', width:'15%', cellTooltip: true},
            {name: 'parentLevelDesc', displayName: 'Parent Name', width:'35%', cellTooltip: true},
           {name: 'parentLevelId', displayName: 'Parent id', width:'25%', cellTooltip: true}
        ];
    }
    
    function onRegisterApi(gridApi){
        $scope.gridApi=gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateLevel);
    };
    
    $scope.myData = {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApi
    };

$scope.deleteItems = function(row){
  row.id = row.levelId;
  var modalInstance = $uibModal.open({
     templateUrl: 'views/deleteModal.html',
     controller: 'deleteModalCtrl',
     resolve: {
         items: function(){
             return{
                 pageType: 'Levels',
                 data: row
             };
         }
     }
  });
  modalInstance.result.then(function(deleteObjID){
      var newArray = $scope.myData.data;
      $scope.messageAlert= "Deleting LevelID "+deleteObjID;
      $scope.messageAlertError='';
      $http.delete('BITool/admin/deleteBILevel/'+deleteObjID)
              .then(function(resp){
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert = "LevelID " +deleteObjID + "deleted successfully";
                    var deleteObj={};
                    for(var i=0;i<$scope.myData.data.length; i++){
                        var eachEle = $scope.myData.data[i];
                        if(eachEle.levelId === deleteObjID){
                            deleteObj = eachEle;
                        }
                    }
                    var index = $scope.myData.data.indexOf(deleteObj);
                    $scope.myData.data.splice(index,1);
                } else {
                    $scope.messageAlert="";
                    $scope.messageAlertError="Error While Deleting the LevelID " + deleteObjID;
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                    }
                }
            },function(){
               $scope.messageAlert="";
               $scope.messageAlertError="Error While Deleting the LevelID " + deleteObjID;
      });
  });
};
$scope.searchTextValue = '';
    var searchPromises = [];
    
    function cancelPendingPromise () {
                _.map(searchPromises, function(eachPromise){
                        eachPromise.cancelService();
                });
                searchPromises = [];
    }
    
    $scope.$on('searchLevel', function(event, searchTxt){
            $scope.searchTextValue = searchTxt;
            cancelPendingPromise();
            $scope.myData.data = []; 
            $scope.updateLevel();
    });
    
    $scope.updateLevel = function(){
      var offset = $scope.myData.data.length+1;
      var promise = $q.defer();
      var canceller = $q.defer();
      var httpPromise = $http({
          'url':'BITool/admin/levelSearch/'+offset+'/20?searchText='+$scope.searchTextValue,
          'method' : 'get',
          'timeout' : canceller.promise
      }).then(function(resp){
          levels = resp.data.allLevels;
          _.map(resp.data.levelList,function(eachList){
                       //eachList.groupId; 
                _.map(resp.data.allLevels,function(eachLevel){
                        if(eachList.parentLevelId === eachLevel.levelId){
                            eachList.parentLevelDesc = eachLevel.levelDesc;
                        }
                       });
                       
                     });
      
           if($scope.myData.data.length === 0){
                $scope.myData.data= resp.data.levelList;
          }else{
              $scope.myData.data = $scope.myData.data.concat(resp.data.levelList);
          }
          $scope.gridApi.infiniteScroll.saveScrollPercentage();
          $scope.gridApi.infiniteScroll.dataLoaded(false,resp.data && resp.data.levelList && resp.data.levelList.length === 20).then(function(){
          promise.resolve();
      });
    });
    httpPromise.cancelService = function(){
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
};
$scope.updateLevel();
$scope.$watch('messageAlert',function(){
        $timeout(function(){
            $scope.messageAlert= "";
        },5000);
    });
    
    $scope.$watch('messageAlertError',function(){
        $timeout(function(){
            $scope.messageAlertError= "";
        },5000);
    });

$scope.open = function(row){
    var defer = $q.defer();
    var modalInstance = $uibModal.open({
        templateUrl: 'views/LevelModal.html',
         controller: 'LevelModalInstanceCtrl',
         resolve: {
             items: function(){
                 if(row === undefined){
                     return {'type': 'new', levels: levels};
                 } else {
                     return {'type': 'edit', levels: levels, data:angular.copy(row)};
                 }
             }
         }
    });
    modalInstance.result.then(function(updateLevelObj){
        if(updateLevelObj.type && updateLevelObj.type === 'new'){
             var postObj = _.omit(updateLevelObj,'type');
             $scope.messageAlert = "Saving "+updateLevelObj.levelDesc+"...";
             $scope.messageAlertError='';
             $http.post('BITool/admin/addBILevel',postObj).then(function(resp){
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert = "Level " + updateLevelObj.levelDesc + " saved successfully";
                    $scope.myData.data = [];
                    $scope.updateLevel();
                } else {
                    $scope.messageAlert ='';
                    $scope.messageAlertError= "Error While Saving the Level " + updateLevelObj.levelDesc;
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                    }
                }
             },function(){
                   $scope.messageAlert ='';
                   $scope.messageAlertError= "Error While Saving the Level " + updateLevelObj.levelDesc;
             });
         } else {
            $scope.messageAlert= "Updating "+updateLevelObj.levelDesc+"...";
            $scope.messageAlertError='';
            var postObj = _.omit(updateLevelObj,'parentLevelDesc');
            $http.post('BITool/admin/updateBILevel',postObj)
                .then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert= "Level " + updateLevelObj.levelDesc + " updated successfully";
                        $scope.myData.data = [];
                        $scope.updateLevel();
                    } else {
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the Level " + updateLevelObj.levelDesc;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
            },function(){
               $scope.messageAlert ='';
               $scope.messageAlertError= "Error While updating the Level " + updateLevelObj.levelDesc;
            });
         }
         defer.resolve(updateLevelObj);
      },function(){
          
      });
      return defer.promise;
    };
  });
  
 angular.module('adminPageApp').controller('LevelModalInstanceCtrl',function($scope, $uibModalInstance, items){
    if(items.type && items.type === 'new'){
        $scope.items = {
            "levelDesc" : "",
            "levelId": null,
            "levelNumber" : "",
            "parentLevelId": "",
            "type" : 'new'
        };
        //{'type': 'new', levels: levels}
        $scope.levels = items.levels;
    } else {
        //{'type': 'edit', levels: levels, data:row}
        $scope.items = items.data;
        
        var newLevel = [];
        _.map(items.levels, function(eachLvl){
            if(eachLvl.levelId !== items.data.levelId){
                newLevel.push(eachLvl);
            }
        });
        $scope.levels = newLevel;
    }
    $scope.close=function(){
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.save = function(selectedItem){
        $scope.selectedItem = selectedItem;
        $uibModalInstance.close(selectedItem);
    };
});


