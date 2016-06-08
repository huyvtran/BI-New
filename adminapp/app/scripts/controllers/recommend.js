'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:RecommendCtrl
 * @description
 * # RecommendCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('RecommendCtrl', function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    var myData1 = {}, 
        myData2 = {},
        selectedReportList = [], 
        searchPromises = [], 
        removedList = [];
    $scope.userGroupId = '';
    $scope.recommendedCount = '';
    $scope.maxSelected = false; 
    $scope.selected = false; 
    $scope.deSelected = false;
    $scope.selectedMove = false;
    $scope.$emit('resetSearchText');
    
    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.columnDefs
     * @description
     * Columns options defiened, returns an array of columns definition objects. Each object allows you to assign specific options to columns in the table.
     * Please refer link: https://github.com/angular-ui/ui-grid/wiki/defining-columns
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected" name="radioButton" type="radio" ng-value="row.entity.sourceReportId"></div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'name', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'type', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true}
        ];
    }
    
    //
    function onRegisterApi (gridApi1){
        $scope.gridApi1 = gridApi1;
        //infiniteScroll functionality for adding more rows.
        //gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi1.selection.on.rowSelectionChanged($scope,function(row){
            $scope.gridApi2.selection.clearSelectedRows();
            var promiseObj = angular.copy(row.entity);
            var removeRowIndex = $scope.myData1.data.indexOf(row.entity);
            promiseObj['index1'] = removeRowIndex; 
            myData1 = promiseObj;
            statusFlag(true, false);
        });
    }
    
    //
    function onRegisterApiList (gridApi2){
        $scope.gridApi2 = gridApi2;
        //Click on each row of table.
        gridApi2.selection.on.rowSelectionChanged($scope,function(row){
            $scope.gridApi1.selection.clearSelectedRows();
            var promiseObj = angular.copy(row.entity);
            var removeRowIndex = $scope.myData2.data.indexOf(row.entity);
            promiseObj['index2'] = removeRowIndex; 
            myData2 = promiseObj;
            statusFlag(false, true);
        });
    }
    
    //
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    //Properties for Ui grid.
    $scope.myData1 = {
        enableRowSelection              : true, 
        enableRowHeaderSelection        : false,
        multiSelect                     : false,
        modifierKeysToMultiSelect       : false,
        noUnselect                      : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    //Properties for Ui grid.
    $scope.myData2 = {
        enableRowSelection              : true, 
        enableRowHeaderSelection        : false,
        multiSelect                     : false,
        modifierKeysToMultiSelect       : false,
        noUnselect                      : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApiList
    };
    
    //left menue
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0].userinfo.group;
        $scope.userGroupId = ($scope.userGroupId) ? $scope.userGroupId : userObj[0].groupId;
        var url = 'BITool/biReport/getRecommendedReportPage/?personaId='+$scope.userGroupId;
        
        $http.get(url).then(function(resp){
            $scope.recommendedCount = resp.data.recommendedCount;
            var data = resp.data.biGroupDTOList;
            $scope.$emit('emitUserGroup', data, userObj[0]);
        });
        $scope.updateReportForm();
    });
    
    //
    $scope.$on('broadcastUserGroup', function(event, userGroup){
        $scope.userGroupId = userGroup;
        cancelPendingPromise();       
        resetAll();
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function() {
        var promise = $q.defer();
        var canceller = $q.defer();

        var httpPromise = $http({
            'url' : 'BITool/biReport/getRecommendedReportPage/?personaId='+$scope.userGroupId,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            var data = resp.data.biReportDTOList;       

            _.map(data, function(report) {
                if(report && report.recommendedSeq !== null && report.recommendedSeq !== 0) {
                    selectedReportList.push(report);
                }
            });
            
            selectedReportList = _.sortBy(selectedReportList, 'recommendedSeq');
            
            data = _.difference(data, selectedReportList);

            if($scope.myData1.data.length === 0){
                $scope.myData1.data = data;
            }else{
                $scope.myData1.data = $scope.myData1.data.concat(data);
            }

            if(selectedReportList.length === 0){
                $scope.myData2.data = [];
            }else{
                $scope.myData2.data = selectedReportList;
            }
        });

        httpPromise.cancelService = function(){
            canceller.resolve();
        };

        searchPromises.push(httpPromise);

        return promise.promise;
    };
    
    //
    $scope.selectedReport = function () {
        checkMaxSelection();
        if(selectedReportList.length < $scope.recommendedCount && !_.isEmpty(myData1)) {
            $scope.myData1.data.splice(myData1.index1, 1);
            selectedReportList.push(myData1);
            $scope.myData2.data = selectedReportList;
            updateRemovedList(myData1, false);
            myData1 = {};
        } 
        statusFlag(false, false);
    };
    
    //
    $scope.deSelectedReport = function () {
        if(selectedReportList.length && !_.isEmpty(myData2)) {
            selectedReportList.splice(myData2.index2, 1);
            $scope.myData1.data.splice(0, 0, myData2);
            $scope.myData2.data = selectedReportList;
            updateRemovedList(myData2, true);
            myData2 = {};
        }
        statusFlag(false, false);
    };
    
    //
    $scope.cancelSelectedReport = function () {
        resetAll();
        statusFlag(false, false);   
        $scope.updateReportForm();
    };
    
    //
    $scope.updateRecommendedReport = function () {
        
        var biReportDTOList = [];

        biReportDTOList = _.map($scope.myData2.data, function(report, index) {
            return {
                "id": report.id, 
                "levelId": report.levelId, 
                "groupId": report.groupId, 
                "recommendedSeq": index+1
            };  
        });
        
        $scope.progress = false;
        $scope.saveText = '';
        
        var postObject = {
            "biReportDTOList" : biReportDTOList,
            "deletedBIReportDTOList" : removedList
        }
        
        $http.put("BITool/biReport/saveRecommendedReportPage/",postObject)
            .then(function (updatedData, status, headers) {
                $scope.progress = false;
                $scope.saveText = 'Recommended Reports are added successfully';
                $timeout(function(){
                    $scope.saveText = '';
                }, 5000);
                removedList = [];
            }, function (updatedData, status, headers, config) {
                $scope.progress = false;
                $scope.saveText = '';
                removedList = [];
            });
    };
    
    //
    $scope.move = function(pos) {
        if(!_.isEmpty(myData2)) {
            if(pos) {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(0, 0, myData2);
            } else {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice($scope.myData2.data.length, 0, myData2);
            }
        }
        statusFlag(false, false);
        myData2 = {};
    };
    
    //
    $scope.moveUpDown = function(pos) {
        if(!_.isEmpty(myData2)) {
            if(pos) {
                var index = ((myData2.index2 - 1) < 0 ) ? 0 : myData2.index2 - 1;
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(index, 0, myData2);
            } else {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(myData2.index2 + 1, 0, myData2);
            }
        }
        statusFlag(false, false);
        myData2 = {};
    };
    
    //
    function checkMaxSelection() {
        $scope.maxSelected = false;
        
        if(selectedReportList.length === $scope.recommendedCount) {
            $scope.maxSelected = true;
            $timeout(function(){
                $scope.maxSelected = false;
            }, 5000);
        }
    }
    
    //
    function updateRemovedList(report, flag) {
        var index = _.findLastIndex(removedList, {id: report.id, levelId: report.levelId});
        if(flag) {
            if(index < 0) {
                (_.pick(report, 'index1'))? delete report.index1 : ''; 
                (_.pick(report, 'index2'))? delete report.index2 : '';
                removedList.push(report);
            }
        } else {
            if(index >= 0) {
                removedList.splice(index,1);
            }
        }
    }
    
    //
    function statusFlag(status1, status2) {
        $scope.selected = status1;
        $scope.deSelected = status2;
        $scope.selectedMove = status2;
    }
    
    //
    function resetAll() {
        $scope.myData1.data = [];
        $scope.myData2.data = [];
        selectedReportList = [];
        removedList = [];
        myData1 = {};
        myData2 = {};
    }
});