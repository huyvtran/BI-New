'use strict';

angular.module('adminPageApp').controller('GroupCtrl',function($scope, $http, $uibModal, $q, $timeout){
    $scope.myData = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    
    $scope.$on('userObjectBroadCast', function(userObject) {
        $scope.userObject = userObject;
    });
    
    function columnDefs(){
        return[
            {name: 'Action', width:'8%', cellTemplate: 'views/adminDropdown.html',enableSorting: false},
            {name: 'groupId',displayName: 'Persona ID', width:'7%', cellTooltip: true },
            {name: 'groupName', displayName: 'Persona Name', width:'15%', cellTooltip: true},
            {name: 'operationDashboardPage', displayName:'Op_Dashboard_Page', width:'20%',cellTooltip: true},
            {name: 'helpLinkLabel', displayName: 'Help Link Label', width:'10%', cellTooltip: true},
            {name: 'pageLink', displayName: 'Help Link', width:'20%', cellTooltip: true},
            {name: 'contactEmail', displayName: 'Contact Email', width:'10%', cellTooltip: true},
            {name: 'buGroupName', displayName: 'Business Unit', width:'10%', cellTooltip: true}
        ];
    }
    
    function onRegisterApi(gridApi){
        $scope.gridApi=gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateGroup);
    };
    
    $scope.myData = {
      enableRowSelection            :true,
      infiniteScrollRowsFromEnd     : 20,
      infiniteScrollUp              : false,
      infiniteScrollDown            : true,
      data                          :[],
      columnDefs                    :columnDefs(),
      onRegisterApi                   : onRegisterApi
    };
    
    $scope.deleteItems = function(row){
        row.id=row.groupId;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    return{
                        pageType: 'Groups',
                        data: row
                    };
                }
            }
        });
        modalInstance.result.then(function(deleteObjID){
            var newArray = $scope.myData.data;
            $scope.messageAlert= "Deleting PersonaID "+deleteObjID;
            $scope.messageAlertError='';
            $http.delete('BITool/admin/deleteBIGroup/'+deleteObjID)
                .then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {        
                        $scope.messageAlert = "PersonaID " +deleteObjID + "deleted successfully";
                        var deleteObj={};
                        for(var i=0;i<$scope.myData.data.length; i++){
                            var eachEle = $scope.myData.data[i];
                            if(eachEle.groupId === deleteObjID){
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index,1);
                    } else {
                        $scope.messageAlert="";
                        $scope.messageAlertError="Error While Deleting the PersonaID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                },function(){
                    $scope.messageAlert="";
                    $scope.messageAlertError="Error While Deleting the PersonaID " + deleteObjID;
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
    
    $scope.$on('searchGroup', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = []; 
        $scope.updateGroup();
    });
    
    $scope.updateGroup = function(){
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/groupSearch/' + offset + '/20?searchText=' + $scope.searchTextValue,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    $scope.updateGroup();

    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });

    $scope.$watch('messageAlertError', function () {
        $timeout(function () {
            $scope.messageAlertError = "";
        }, 5000);
    });


    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/GroupsModal.html',
            controller: 'GroupModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        return {'type': 'new'};
                    } else {
                        return angular.copy(row);
                    }
                }
            }
        });
        modalInstance.result.then(function (updateGroupObj) {
            if (updateGroupObj.type && updateGroupObj.type === 'new') {
                var postObj = _.omit(updateGroupObj, 'type');
                $scope.messageAlert = "Saving " + updateGroupObj.groupName + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/addBIGroup', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Persona " + updateGroupObj.groupName + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateGroup();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Persona " + updateGroupObj.groupName;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Persona " + updateGroupObj.groupName;
                });
            } else {
                $scope.messageAlert = "Updating " + updateGroupObj.groupName + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/updateBIGroup', updateGroupObj)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "Persona " + updateGroupObj.groupName + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateGroup();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Persona " + updateGroupObj.groupName;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the Persona " + updateGroupObj.groupName;
                    });
            }
            defer.resolve(updateGroupObj);
        }, function () {

        });
        return defer.promise;
    };
});

angular.module('adminPageApp').controller('GroupModalInstanceCtrl',function($scope, $http, $uibModalInstance, items){
    if(items.type && items.type === 'new'){
        $scope.items = {
            "groupName" : "",
            "operationDashboardPage" : "",
            "helpLinkLabel" : "",
            "pageLink" : "",
            "type" : 'new',
            "contactEmail" : "",
            "buGroupId" : ""
        };
    } else {
        $scope.items = items;
    }
    
    $http.get('BITool/admin/getBUGroup').then(function(response) {
        $scope.buGroupObj = response.data;
    });
    
    $scope.close=function(){
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.save = function(selectedItem){
        selectedItem = _.omit(selectedItem,'buGroupName');
        $scope.selectedItem = selectedItem;
        $uibModalInstance.close(selectedItem);
    };
});