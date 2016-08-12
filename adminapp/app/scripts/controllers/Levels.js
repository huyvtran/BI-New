'use strict';

angular.module('adminPageApp').controller('LevelCtrl', function ($scope, $http, $uibModal, $q, $timeout, userDetailsService) {
    $scope.myData = {};
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    var groupIdList = [];
    
    function columnDefs() {
        return[
            {name: 'Options', width: '10%', cellTemplate: 'views/adminDropdown.html', enableSorting: false},
            {name: 'levelId', displayName: 'Level Id', width: '10%', cellTooltip: true},
            {name: 'levelDesc', displayName: 'Level Name', width: '15%', cellTooltip: true},
            {name: 'levelNumber', displayName: 'Level Number', width: '15%', cellTooltip: true},
            {name: 'parentLevelName', displayName: 'Parent Name', width: '35%', cellTooltip: true},
            {name: 'parentLevelId', displayName: 'Parent id', width: '25%', cellTooltip: true}
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateLevel);
    }

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };

    $scope.deleteItems = function (row) {
        row.id = row.levelId;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    return{
                        pageType: 'Levels',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting LevelID " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteBILevel/' + deleteObjID)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "LevelID " + deleteObjID + "deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.levelId === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
                        $scope.messageAlertError = "Error While Deleting the LevelID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the LevelID " + deleteObjID;
                });
        });
    };
    
    $scope.searchTextValue = '';
    $scope.personaId = '';
    var searchPromises = [];

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }

    $scope.$on('searchLevel', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateLevel();
    });
    
    $scope.$on('broadcastAuditGroup', function(event, personaId){
        if (personaId) {
            $scope.personaId = personaId;
        } else {
            $scope.personaId = '';
        }
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateLevel();
    });
    
    $scope.updateLevel = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var url ='';
        
        if($scope.personaId) {
            url = 'BITool/admin/levelSearch/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId='+ $scope.personaId;
        } else {
            url = 'BITool/admin/levelSearch/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId=';
        }
        console.log(url);
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
//            levels = resp.data.allLevels;
            groupIdList = _.sortBy(resp.data.allGroups, 'groupName');
            $scope.$emit('emitAuditGroup', groupIdList);
            var newUrl = 'BITool/admin/getParentOrChildLevel?levelId=';
            
//            $http.get(newUrl).then(function(resp){
//                parentLevelList = resp.data;
//            });
            
//            _.map(resp.data.levelList, function (eachList) {
//                //eachList.groupId; 
//                _.map(resp.data.allLevels, function (eachLevel) {
//                    if (eachList.parentLevelId === eachLevel.levelId) {
//                        eachList.parentLevelDesc = eachLevel.levelDesc;
//                    }
//                });
//            });

            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data.levelList;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data.levelList);
            }
            
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.levelList && resp.data.levelList.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    
    $scope.updateLevel();
    
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
            templateUrl: 'views/LevelModal.html',
            controller: 'LevelModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        return {'type': 'new', groupIdList : groupIdList};
                    } else {
                        return {'type': 'edit', groupIdList : groupIdList, data: angular.copy(row)};
                    }
                }
            }
        });
        
        modalInstance.result.then(function (updateLevelObj) {
            if (updateLevelObj.type && updateLevelObj.type === 'new') {
                var postObj = _.omit(updateLevelObj, 'type');
                $scope.messageAlert = "Saving " + updateLevelObj.levelDesc + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/addBILevel', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Level " + updateLevelObj.levelDesc + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateLevel();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Level " + updateLevelObj.levelDesc;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Level " + updateLevelObj.levelDesc;
                });
            } else {
                $scope.messageAlert = "Updating " + updateLevelObj.levelDesc + "...";
                $scope.messageAlertError = '';
                var postObj = _.omit(updateLevelObj, 'parentLevelDesc');
                $http.post('BITool/admin/updateBILevel', postObj)
                        .then(function (resp) {
                            if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                                $scope.messageAlert = "Level " + updateLevelObj.levelDesc + " updated successfully";
                                $scope.myData.data = [];
                                $scope.updateLevel();
                            } else {
                                $scope.messageAlert = '';
                                $scope.messageAlertError = "Error While updating the Level " + updateLevelObj.levelDesc;
                                if (resp.data && resp.data.message) {
                                    $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                                }
                            }
                        }, function () {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Level " + updateLevelObj.levelDesc;
                        });
            }
            defer.resolve(updateLevelObj);
        }, function () {
        });
        
        return defer.promise;
    };
});

angular.module('adminPageApp').controller('LevelModalInstanceCtrl', function ($scope, $uibModalInstance, items, $http, $rootScope, $timeout) {
    $scope.levelFlag = 'Parent';
    $scope.childLevelList = [];
    $scope.listReady = false;
    
    if (items.type && items.type === 'new') {
        $scope.items = {
            "levelDesc": "",
            "levelId": null,
            "parentLevelId": "",
            "childLevelId": "",
            "groupIds":"",
            "type": 'new'
        };
        
        $scope.groupIdList = items.groupIdList;

    } else {
        var url = 'BITool/admin/getBILevelForEdit?levelId='+items.data.levelId;

        $http.get(url).then(function(resp) {
            $scope.items = resp.data;
            (resp.data.groupIds) ? $scope.selectedGroupIds = getSelectedGIds(resp.data.groupIds) : '';
            $scope.groupIdList = resp.data.allGroups;
            $scope.levelFlag = ($scope.items.parentLevelList && $scope.items.parentLevelList.length > 0)? 'Child' :'Parent'; 
            $scope.parentLevelList = $scope.items.parentLevelList;
            $scope.childLevelList = $scope.items.childLevelList;
        });
    }
    
    function getSelectedGIds (gIds) {
        gIds = gIds.split(',');
        var preList = []
        for(var i = 0; i < gIds.length; i++ ){
            preList.push({'id':gIds[i]});
        }
        return preList;
    }
    
    $scope.selectLevelType = function(type) {
        $scope.levelFlag = type;
        
        if(type === 'Child') {
            if(!$scope.parentLevelList) {
                var url = 'BITool/admin/getParentOrChildLevel?levelId=';
                $http.get(url).then(function(resp){
                    $scope.parentLevelList = resp.data;
                });
            }
        }    
    };
    
    $scope.getChildLevels = function() {
        var url = 'BITool/admin/getParentOrChildLevel?levelId='+$scope.items.parentLevelId;
        
        $http.get(url).then(function(resp){
            $scope.childLevelList = resp.data;
        });
    };
    
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.save = function (selectedItem) {
        if(selectedItem.type==='new') {
            if($scope.levelFlag === 'Parent') {
                selectedItem.parentLevelId = null;
                selectedItem.childLevelId = null;
            }
            
            selectedItem.groupIds = selectedItem.selectedGroupIdList.toString();
            selectedItem = _.omit(selectedItem,'groupIdList');
            selectedItem = _.omit(selectedItem,'selectedGroupIdList');
            $scope.selectedItem = selectedItem;
            console.log($scope.selectedItem);
            $uibModalInstance.close(selectedItem);
        } else {
            if($scope.levelFlag === 'Parent') {
                selectedItem.parentLevelId = null;
                selectedItem.childLevelId = null;
            }
            selectedItem.deletedGroupIds = getDeletedGroupIds(selectedItem.groupIds, selectedItem.selectedGroupIdList).toString();
            selectedItem.groupIds = selectedItem.selectedGroupIdList.toString();
            selectedItem = _.omit(selectedItem,'allGroups');
            selectedItem = _.omit(selectedItem,'childLevelList');
            selectedItem = _.omit(selectedItem,'createdBy');
            selectedItem = _.omit(selectedItem,'createdDate');
            selectedItem = _.omit(selectedItem,'groupNames');
            selectedItem = _.omit(selectedItem,'levelNumber');
            selectedItem = _.omit(selectedItem,'parentLevelList');
            selectedItem = _.omit(selectedItem,'parentLevelName');
            selectedItem = _.omit(selectedItem,'rowCount');
            selectedItem = _.omit(selectedItem,'selectedGroupIdList');
            selectedItem = _.omit(selectedItem,'updatedBy');
            selectedItem = _.omit(selectedItem,'updatedDate');
            $scope.selectedItem = selectedItem;
            console.log($scope.selectedItem);
            $uibModalInstance.close(selectedItem);
        }
    };
    
    function getDeletedGroupIds(initialList, currentList) {
        var oldList = [];
        var finalList = [];
        if(initialList) {
            initialList = initialList.split(',');
            for(var i =0; i < initialList.length; i++) {
                oldList.push(parseInt(initialList[i], 10));
            }
        } else {
            oldList = [];
        }
        
        if(currentList && currentList.length ) {
            for(var i =0; i < currentList.length; i++) {
                finalList.push(parseInt(currentList[i], 10));
            }
        } else {
            finalList = [];
        }
        
        return _.difference(oldList, finalList);
    }
});