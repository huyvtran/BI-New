'use strict';

angular.module('adminPageApp')
.controller('UsersCtrl', function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    var groups = [], roles = [];
    $scope.myData = {};
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.personaId= '';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    function columnDefs() {
        return [
            {name: 'Options', width: '10%', cellTemplate: 'views/adminDropdown.html'},
            {name: 'fullName', displayName: 'Display Name', width: '25%', cellToolTip: true/*, cellTemplate:"<span>{{row.entity.lastName}}<span ng-show='row.entity.lastName && row.entity.firstName'>,</span> {{row.entity.firstName}}</span>"*/},
            {name: 'userName', displayName: 'Username', width: '25%', cellToolTip: true},
            {name: 'role', displayName: 'Role', width: '15%', cellToolTip: true},
            {name: 'groupName', displayName: 'Persona', width: '25%', cellToolTip: true}
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateUsers);
    }
    ;

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };

    //groups dropdown on leftpanel
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0];
        var url;
        if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'admin' ) {
            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
        } else if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'buadmin') {
            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
        }
        url = url+userObj.emcLoginName;
        $http.get(url).then(function(resp){
            $scope.$emit('emitAuditGroup', resp.data);
        });
    });
    
    $scope.$on('broadcastAuditGroup', function(event, personaId){
        if (personaId) {
            $scope.personaId = personaId;
        } else {
            $scope.personaId = '';
        }
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateUsers();
    });

    $scope.checkRole = function (row) {
        return !(row.role && row.role.toLowerCase() === 'buadmin');
    };

    $scope.checkRoleForOption = function (row) {
        if ($scope.userDetails && $scope.userDetails.emcLoginName) {
            return (row.role && (row.role.toLowerCase() === 'admin' || row.role.toLowerCase() === 'buadmin') && $scope.userDetails.emcLoginName.toLowerCase() !== row.userName.toLowerCase());
        } else {
            return (row.role && (row.role.toLowerCase() === 'admin' || row.role.toLowerCase() === 'buadmin'));
        }
    };

    $scope.updateMemberShip = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/updateMemberShip.html',
            controller: 'UpdateMemberShipCtrl',
            resolve: {
                items: function () {
                    return row;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.messageAlert = "Saving " + selectedItem.userName + "...";
            $scope.messageAlertError = '';
            //{'groupids':$scope.selected,'userid':items.userId, 'userName' : $scope.userName }
            var postObj = {'userId': selectedItem.userid, 'groupIdList': selectedItem.groupids.toString(), 'deletedGroupIdList': selectedItem.deletedGroupIdList.toString()};

            $http.put('BITool/buAdmin/saveOrUpdateBUAdminGroup', postObj)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "User " + selectedItem.userName + " updated successfully";
                        $scope.myData.data = [];
                        $scope.updateUsers();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                });

            defer.resolve(selectedItem);
        }, function () {

        });
        return defer.promise;
    };

    $scope.deleteItems = function (row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    row.id = row.userName;
                    return{
                        pageType: 'Users',
                        data: row
                    };
                }
            }
        });

        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting UserID " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteBIUser/' + deleteObjID)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "UserID " + deleteObjID + "deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.userName === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
                        $scope.messageAlertError = "Error While Deleting";
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the User " + deleteObjID;
                });
        });
    };

    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/AddUserModal.html',
            controller: 'UsersModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        var defer = $q.defer(),
                        returnObj = {'type': 'new', 'roles': roles, 'groups': groups};

                        userDetailsService.userPromise.then(function (userObj) {
                            userObj = userObj[0];
                            if (userObj && userObj.userinfo && userObj.userinfo.role && userObj.userinfo.role.toLowerCase() === 'buadmin') {
                                returnObj.userRole = 'buadmin';
                            }
                            defer.resolve(returnObj);
                        });

                        return defer.promise;
                    } else {
                        var defer = $q.defer(),
                        returnObj = {'type': 'edit', 'data': angular.copy(row), 'roles': roles, 'groups': groups};

                        userDetailsService.userPromise.then(function (userObj) {
                            returnObj.user = userObj[0];
                            defer.resolve(returnObj);
                        });

                        return defer.promise;
                    }
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {

            if (selectedItem.type && selectedItem.type === 'new') {
                if (selectedItem.file) {
                    var request = {
                        method: 'POST',
                        url: 'BITool/admin/addBIUser/csv',
                        data: selectedItem.formdata,
                        headers: {
                            'Content-Type': undefined
                        }
                    };
                    $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                    $scope.messageAlertError = '';
                    // SEND THE FILES.
                    $http(request)
                        .then(function (resp) {
                            if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                                $scope.messageAlert = "User/Users added successfully";
                                $scope.myData.data = [];
                                $scope.updateUsers();
                            } else {
                                $scope.messageAlert = '';
                                $scope.messageAlertError = "Error While Adding";
                                if (resp.data && resp.data.message) {
                                    $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                                }
                            }
                        }, function () {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While Adding";
                        });
                } else {
                    var postObj = _.omit(selectedItem, 'type');
                    postObj = _.omit(postObj, 'userRole');
                    $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                    $scope.messageAlertError = '';
                    $http.post('BITool/admin/addBIUser', postObj).then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "User " + selectedItem.userName + " saved successfully";
                            $scope.myData.data = [];
                            $scope.updateUsers();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While Adding";
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Adding";
                    });
                }

            } else {
                $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                $scope.messageAlertError = '';
                //selectedItem.groupName = null;
                var postObj = _.omit(selectedItem, '$$hashKey');
                postObj = _.omit(postObj, 'firstName');
                postObj = _.omit(postObj, 'lastName');
                postObj = _.omit(postObj, 'login');
                postObj = _.omit(postObj, 'userId');
                postObj = _.omit(postObj, 'id');

                $http.post('BITool/admin/updateBIUser', postObj)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "User " + selectedItem.userName + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateUsers();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                    });
            }
            
            defer.resolve(selectedItem);
        }, function () {

        });
        return defer.promise;
    };

    //Continue the code for update and new when the webservices are provided
    $scope.searchTextValue = '';
    var searchPromises = [];

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }

    $scope.$on('searchUsers', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateUsers();
    });

    $scope.updateUsers = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var url = ($scope.personaId) ? 'BITool/admin/userSearch/' + offset + '/20?searchText=' + $scope.searchTextValue +'&personaId='+$scope.personaId : 'BITool/admin/userSearch/' + offset + '/20?searchText=' + $scope.searchTextValue;
        
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            userDetailsService.userPromise.then(function (userObj) {
                $scope.userDetails = userObj[0];
            });
            groups = resp.data.allGroups;
            roles = resp.data.allRoles;
            /*_.map(resp.data.users,function(eachList){
             //eachList.groupId; 
             _.map(resp.data.allGroups,function(eachGroup){
             if(eachList.groupId === eachGroup.groupId){
             eachList.groupName = eachGroup.groupName;
             }
             });

             });*/
            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data.users;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data.users);
            }
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.users && resp.data.users.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };

    $scope.updateUsers();

    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });

//end    
});

angular.module('adminPageApp').controller('UsersModalInstanceCtrl', function ($scope, $uibModalInstance, items, $uibModal) {
    $scope.activeDirectoryButton = false;
    $scope.importFromCSV = false;
    $scope.modalTitle = 'Add New User';
    $scope.roles = items.roles;
    $scope.groups = items.groups;

    if (items.type && items.type === 'new') {

        $scope.items = {
            "userName": "",
            "role": "User",
            "groupId": 0,
            "type": 'new'
        };
    } else {
        $scope.items = items.data;
        $scope.userDetails = items.user;
        $scope.buFlag = false;

        if (($scope.items.userName.toLowerCase() === $scope.userDetails.emcLoginName.toLowerCase()) && ($scope.items.role !== 'Admin')) {
            $scope.buFlag = true;
        }
    }

    if (items && items.userRole && items.userRole === 'buadmin') {
        $scope.activeDirectoryButton = true;
        $scope.modalTitle = 'Add Users from Active Directory';
        $scope.items.userRole = items.userRole;
    }

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };

    /**
     * Used for uploading files
     * reference: http://www.encodedna.com/angularjs/tutorial/angularjs-file-upload-using-http-post-formdata-webapi.htm
     */
    var formdata = new FormData();

    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append('file', value);
        });
    };

    /**
     * End of uploading files logic
     */

    $scope.save = function (selectedItem) {
        if ($scope.items.type && $scope.activeDirectoryButton && selectedItem) {
            $scope.selectedItem = selectedItem;
            $uibModalInstance.close(selectedItem);
        } else if ($scope.importFromCSV) {
            $uibModalInstance.close({'type': 'new', 'formdata': formdata, 'file': true});
        } else if (selectedItem) {
            _.map($scope.groups, function (eachGrp) {
                if (eachGrp.groupName === selectedItem.groupName) {
                    selectedItem.groupId = eachGrp.groupId;
                }
            });
            $scope.selectedItem = selectedItem;
            $uibModalInstance.close(selectedItem);
        }
    };

    $scope.importUser = function () {
        $scope.importFromCSV = true;
        $scope.modalTitle = 'Import Users from file';
    };

    $scope.addUserFromActiveDirectory = function () {
        $scope.activeDirectoryButton = true;
        $scope.modalTitle = 'Add Users from Active Directory';
    };

    $scope.checkSaveConditions = function () {
        if ($scope.items.type && $scope.activeDirectoryButton && !($scope.items.userName && $scope.items.groupId)) {
            return true;
        } else if (!($scope.items.userName)) {
            return true;
        }
        return false;
    };
});

angular.module('adminPageApp').controller('UpdateMemberShipCtrl', function ($scope, $uibModalInstance, items, $http, $q) {

    $scope.groupsArray = [];
    $scope.selected = [];
    $scope.groupIdList = [];
    $scope.deletedIdList = [];
    $scope.userName = (items.fullName) ? items.fullName : items.userName;

    $q.all([$http.get('BITool/buAdmin/getBUAdminGroup/?userName=' + items.userName), $http.get('BITool/buAdmin/getBIGroupForBUAdmin/?userName=' + items.userName)]).then(function (resp) {
        $scope.groupsArray = resp[0].data;
        _.map(resp[1].data, function (group) {
            $scope.selected.push(group.groupId);
        });

    });

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
            $scope.deletedIdList.push(item);
        }
        else {
            list.push(item);
            var idx1 = $scope.deletedIdList.indexOf(item);
            (idx1 > -1) ? $scope.deletedIdList.splice(idx1, 1) : $scope.deletedIdList;
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };

    $scope.save = function () {
        $uibModalInstance.close({'groupids': $scope.selected, 'deletedGroupIdList': $scope.deletedIdList, 'userid': items.userId, 'userName': $scope.userName});
    };
});
