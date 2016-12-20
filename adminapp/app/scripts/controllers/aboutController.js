'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('AboutCtrl', function ($scope, $http, $filter, $uibModal, $q, $timeout, userDetailsService) {
    $scope.displayType = '';
    $scope.personaId = '';
    $scope.searchTextValue = '';
    $scope.functionalArea = '';
    $scope.reportType = '';
    $scope.sourceSystem = '';
    var searchPromises = [];
    $scope.$emit('resetDisplayType', 'All');
    $scope.$emit('resetSearchText');
    $scope.isBUFlag = false;
    
    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.columnDefs
     * @description
     * Columns options defiened, returns an array of columns definition objects. Each object allows you to assign specific options to columns in the table.
     * Please refer link: https://github.com/angular-ui/ui-grid/wiki/defining-columns
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected"   name="radioButton" type="radio" ng-value="row.entity.sourceReportId" > </div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportName', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'sourceSystem', displayName: 'Source System', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'reportDesc', displayName: 'Description', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportType', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'functionalArea', displayName: 'Functional Area', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'owner', displayName: 'Owner', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'additionalInfo', displayName: 'Additional Info', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'updatedDate', displayName: 'Updated Date', enableCellEdit: false, width: '200', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.updatedDate | date:"MM/dd/yy h:mm:ss a"}}</div>'}
        ];
    }

    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.onRegisterApi
     * @description
     * A callback that returns the gridApi once the grid is instantiated, which is then used to interact with the grid programatically.
     * Note that the gridApi.core.renderingComplete event is identical to this callback, but has the advantage that it can be called from multiple places if needed
     */
    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            var promiseObj = $scope.open(angular.copy(row.entity));
            promiseObj.then(function (resp) {
                row.entity = resp;
            });
        });
    }
    
    //Properties for Ui grid.
    $scope.myData = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    $scope.$on('userObjectBroadCast', function(userObject) {
        $scope.userObject = userObject;
    });
    
    //Modal open callBack.
    $scope.open = function (row) {
        var defer = $q.defer();
        row.isBUFlag = $scope.isBUFlag;

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return row;
                }
            }
        });
        
        modalInstance.result.then(function (returnObj) {
            $scope.myData.data = [];
            $scope.updateReportForm();
        }, function () {
            //OnCancel
        });
        return defer.promise;
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
    
    $scope.$on('reportGroupList', function (event, list) {
        _.map(list, function(item) {
            if(item.buGroupName.toLowerCase() == 'sales'){
                $scope.isBUFlag = true;
            }
        })
    });
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('funcAreaUpdate', function (event, funcArea) {
        $scope.functionalArea = funcArea;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('reportTypeUpdate', function (event, reportType) {
        $scope.reportType = reportType;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });

    $scope.$on('sourceSystemUpdate', function (event, sourceSystem) {
        $scope.sourceSystem = sourceSystem;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });

    $scope.$on('broadcastDeployedSelection', function (event, displayType, personaId) {
        $scope.displayType = (displayType === 'All')? '' : displayType;
        $scope.personaId = personaId;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('broadcastDeployedReportGroup', function (event, displayType, personaId) {
        $scope.displayType = displayType;
        $scope.personaId = personaId;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function () {
        userDetailsService.userPromise.then(function (userObject) {
            var offset = $scope.myData.data.length + 1;
            var promise = $q.defer();
            //for cancelling the running service.
            var canceller = $q.defer();
            
            if($scope.displayType === 'Deployed') {
                $scope.sourceSystem = ''
                $scope.functionalArea = ''
                $scope.reportType = '';
                var url = ($scope.personaId) ? 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType+'&personaId=' + $scope.personaId : 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType;
            } else {
                var url = 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType;
            }
            
            var httpPromise = $http({
                'url': url,
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
        });
    };
    
    $scope.updateReportForm();
});