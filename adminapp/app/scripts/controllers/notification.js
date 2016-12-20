'use strict';

angular.module('adminPageApp').controller('NotificationCtrl', function ($scope, $http, $uibModal, $q, $timeout) {
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.myData = {};
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    var groupIdList = [];
    $scope.searchTextValue = '';
    $scope.personaId = '';
    var searchPromises = [];
    
    function columnDefs() {
        return[
            {name: 'Action', width: '8%', cellTemplate: 'views/adminDropdown.html'},
            {name: 'notificationId', displayName: 'ID', width: '6%', cellTooltip: true},
            {name: 'header', displayName: 'Title', width: '10%', cellTooltip: true},
            {name: 'messageBody', displayName: 'Message', width: '15%', cellTooltip: true},
            {name: 'moreInfoUrl', displayName: 'More Info URL', width: '10%', cellTooltip: true},
            {name: 'isActive', displayName: 'Is Active', width: '7%', cellTooltip: true, cellTemplate:"<div class='ui-grid-cell-contents'>{{(row.entity.isActive === 'Y') ? 'Yes' : 'No'}}</div>"},
            {name: 'notificationType', displayName: 'Type', width: '5%', cellTooltip: true, cellTemplate:"<div class='ui-grid-cell-contents'>{{(row.entity.notificationType === 'M') ? 'Message' : 'Alert'}}</div>"},
            {name: 'startDate', displayName: 'Notification Start Date', width: '15%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.startDate | date:"yyyy-MM-dd HH:mm:ss"}}</div>'},
            {name: 'endDate', displayName: 'Notification End Date', width: '15%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.endDate | date:"yyyy-MM-dd HH:mm:ss"}}</div>'},
            {name: 'persona', displayName: 'Persona', width: '10%', cellTooltip: true},
            {name: 'owner', displayName: 'Owner', width: '15%', cellTooltip: true},
            {name: 'biCreatedDate', displayName: 'Created Date', width: '10%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.biCreatedDate | date:"MM/dd/yy h:mm:ss a"}}</div>'},
            {name: 'biUpdatedDate', displayName: 'Updated Date', width: '10%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{(row.entity.biUpdatedDate)? (row.entity.biUpdatedDate | date:"MM/dd/yy h:mm:ss a") : ""}}</div>'}            
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateNotificationForm);
    };

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateNotificationForm();
    });

    $scope.$on('broadcastAuditGroup', function(event, personaId){
        (personaId) ? $scope.personaId = personaId : $scope.personaId = '';
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateNotificationForm();
    });

    $scope.deleteItems = function (row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    row.id = row.notificationId;
                    return {
                        pageType: 'Notification',
                        data: row
                    };
                }
            }
        });

        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting Notification " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteNotification?notificationId=' + deleteObjID)
                .then(function (response, status, headers) {
                    if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Notification " + deleteObjID + " deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.id === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }

                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
                        $scope.messageAlertError = "Error While Deleting the Notification " + deleteObjID;
                        if (response.data && response.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                        }
                    }
                }, function (newArray, status, headers, config) {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the Notification " + deleteObjID;
                });
        });
    };

    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/NotificationModal.html',
            controller: 'NotificationModelCtrl',
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
        
        modalInstance.result.then(function (notificationObj) {
            if (notificationObj.type && notificationObj.type === 'new') {
                var postObj = _.omit(notificationObj, 'type');
                $scope.messageAlert = "Saving " + notificationObj.header + "...";
                $scope.messageAlertError = '';
                
                $http.post('BITool/admin/saveOrUpdateNotification', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Notification " + notificationObj.header + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateNotificationForm();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Notification " + notificationObj.header;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }

                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Notification " + notificationObj.header;
                });

            } else {
                notificationObj.notificationId = parseInt(notificationObj.notificationId);
                $scope.messageAlert = "Updating " + notificationObj.header + "...";
                $scope.messageAlertError = '';

                $http.post('BITool/admin/saveOrUpdateNotification', notificationObj)
                    .then(function (updateNotification, status, headers) {
                        if (updateNotification.data && updateNotification.data.status && updateNotification.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "Notification " + notificationObj.header + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateNotificationForm();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Notification " + notificationObj.header;
                            if (updateNotification.data && updateNotification.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + updateNotification.data.message
                            }
                        }
                    }, function (updateNotification, status, headers, config) {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the Notification " + notificationObj.header;
                    });
            }
            defer.resolve(notificationObj);
        }, function () {

        });
        return defer.promise;
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.updateNotificationForm = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/getNotificationList/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId=' + $scope.personaId,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            $http.get('BITool/buAdmin/getBUAdminGroupByRole').then(function(resp){
                groupIdList = _.sortBy(resp.data, 'groupName');
                $scope.$emit('emitAuditGroup', groupIdList);
            });
            
            angular.forEach(resp.data, function(item) {
                item.startDate = new Date(item.startDate);
                item.endDate = new Date(item.endDate);
            });
            
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

    $scope.updateNotificationForm();

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
});

angular.module('adminPageApp').controller('NotificationModelCtrl', function ($scope, $uibModalInstance, items, $http, $timeout, $filter) {
    $scope.formats = ['yyyy-MM-dd','yyyy-MM-ddTHH:mm:ss.sssZ', 'medium'];
    $scope.format = $scope.formats[0];
    $scope.dateError = '';
    $scope.mytime1 = setTime(0,0);
    $scope.mytime2 = setTime(0,0);
    $scope.hstep = 1;
    $scope.mstep = 5;
    $scope.ismeridian = false;
    
    $scope.popup1 = {
        opened: false,
        dt: new Date(),
        minDate: new Date(),
        maxDate: null
    };

    $scope.popup2 = {
        opened: false,
        dt: new Date(),
        minDate: $scope.popup1.dt,
        maxDate: null
    };
    
    $scope.popup2.dt.setDate($scope.popup1.dt.getDate()+7);
    
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    if (items.type && items.type === 'new') {
        $scope.items = {
            "notificationId": null,
            "groupIds": null,
            "header": "",
            "messageBody": "",
            "notificationType": "M",
            "isActive":"Y",
            "type": 'new'
        };
        
        $scope.groupIdList = items.groupIdList;
    } else {
        $scope.items = items.data;
        $scope.items.selectedGroupIdList = $scope.items.groupIds;
        $scope.items.notificationType = items.data.notificationType;
        $scope.popup1.dt = $filter('date')(new Date($scope.items.startDate), $scope.formats[1]);  
        $scope.popup2.dt = $filter('date')(new Date($scope.items.endDate), $scope.formats[1]);
        $scope.mytime1 = setTime($scope.popup1.dt.substring(11, 13), $scope.popup1.dt.substring(14, 16));
        $scope.mytime2 = setTime($scope.popup2.dt.substring(11, 13), $scope.popup2.dt.substring(14, 16));
    }
    
    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };
    
    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };
    
    $scope.toggleMax = function() {
        var dateTime1 = getDateTime($scope.popup1.dt, $scope.mytime1);
        var dateTime2 = getDateTime($scope.popup2.dt, $scope.mytime2);
        
        if(dateTime1 === dateTime2 || dateTime1 > dateTime2) {
            var chDate = new Date($scope.popup1.dt).setDate($scope.popup1.dt.getDate()+7);
            $scope.popup2.dt = chDate;
        }
    };
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.save = function (notificationObj) {
        notificationObj = _.omit(notificationObj,'id');
        var dateTime1 = getDateString(($filter('date')($scope.popup1.dt, $scope.formats[1])), $scope.mytime1);
        var dateTime2 = getDateString(($filter('date')($scope.popup2.dt, $scope.formats[1])), $scope.mytime2);
        notificationObj.startDate = dateTime1;
        notificationObj.endDate = dateTime2;
        
        if(dateTime1 === dateTime2 || dateTime1 > dateTime2) {
            $scope.dateError = 'Select a valid date range';
            $timeout(function() {
                $scope.dateError = '';
            }, 2000)
            return false;
        }
        
        if(notificationObj.type==='new') {
            notificationObj.groupIds = notificationObj.selectedGroupIdList.toString();
            notificationObj = _.omit(notificationObj,'selectedGroupIdList');
            $uibModalInstance.close(notificationObj);
        } else {
            notificationObj.groupIds = notificationObj.groupId;
            notificationObj = _.omit(notificationObj,'biUpdatedBy');
            notificationObj = _.omit(notificationObj,'biUpdatedDate');
            notificationObj = _.omit(notificationObj,'biCreatedBy');
            notificationObj = _.omit(notificationObj,'biCreatedDate');
            notificationObj = _.omit(notificationObj,'biDeletedBy');
            notificationObj = _.omit(notificationObj,'biDeletedDate');
            notificationObj = _.omit(notificationObj,'owner');
            notificationObj = _.omit(notificationObj,'persona');
            notificationObj = _.omit(notificationObj,'reportId');
            notificationObj = _.omit(notificationObj,'selectedGroupIdList');
            notificationObj = _.omit(notificationObj,'notificationEndDate');
            notificationObj = _.omit(notificationObj,'notificationStartDate');
            notificationObj = _.omit(notificationObj,'groupId');
            $uibModalInstance.close(notificationObj);
        }
    };
    
    function getDateTime(date, time) {
        var date1 = $filter('date')(new Date(date), $scope.format);
        var time1 = $filter('date')(new Date(time), 'HH:mm:dd');
        return date1 + ' ' +time1;
    };
    
    function getDateString(date, time) {
        var date = String(date);
        var timeString = time.toString().substring(16, 21);
        var str = date.substring(11, 16);
        var dateString = date.replace(str, timeString);
        return dateString;
    };
    
    function setTime(hours,min) {
        var d1 = new Date();
        d1.setHours( hours );
        d1.setMinutes( min );
        d1.setMilliseconds( 0 );
        return d1;
    };
});