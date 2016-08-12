'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:AddExternalCtrl
 * @description
 * # AddExternalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ManageExternalCtrl', function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    $scope.urlValid = false;
    $scope.external = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.searchText = '';
    var searchPromises = [];
    $scope.$emit('resetDisplayForm', 'edit');
    $scope.$emit('resetSearchText');
    $scope.external.additionalInfo = "#0000FF";
    
    /**
     * Search Edit report functions 
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected"   name="radioButton" type="radio" ng-value="row.entity.sourceReportId" > </div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportName', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'sourceSystem', displayName: 'Source System', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportDesc', displayName: 'Description', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportLink', displayName: 'Report Link', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportType', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'functionalArea', displayName: 'Functional Area', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'owner', displayName: 'Created By', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'additionalInfo', displayName: 'Tile Color', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'updatedDate', displayName: 'Updated Date', enableCellEdit: false, width: '100', cellTooltip: true}
        ];
    }
    
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
        infiniteScrollDown: false,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    //Modal open callBack.
    $scope.open = function (row) {
        var defer = $q.defer();

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modalExternal.html',
            controller: 'ExternalModalCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return row;
                }
            }

        });
        
        modalInstance.result.then(function (returnObj) {
            //var returnItems = returnObj.items;
            //defer.resolve(returnItems);
            $scope.myData.data = [];
            $scope.updateReportForm();
        }, function () {
            //OnCancel
        });
        
        return defer.promise;
    };
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchText = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        //for cancelling the running service.
        var canceller = $q.defer();
        var url = 'BITool/admin/externalrepo/searchreports/' + offset + '/20?searchText=' + $scope.searchText +'&displayType=';
        
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
    };
    
    $scope.$on('emitDisplayForm', function(event, displayForm) {
       $scope.displayForm = displayForm;
    });
    
    $scope.updateReportForm();
    
    /**
     * Add report Functions 
     */
    
    //Help pop over object
    $scope.popAdditionalInfo = {
        content : 'Use Hexadecimal Color Codes here. eg: #000000 for black color tile',
        title : 'Please Note:',
        placement:'top',
        class:'additiona-info'
    };
    
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0];
        $scope.reportPersona = userObj.userinfo.group[0].groupId;
    });

    $scope.validateUrl = function(url) {
        var urlIndex = (url) ? url.indexOf('http') && url.indexOf('//') : -1;
        (urlIndex > -1) ? $scope.urlValid = true : $scope.urlValid = false;
    };
    
    $scope.addExternal = function(external) {
        $scope.messageAlert= "Saving "+external.reportName+"...";
        $scope.messageAlertError = '';
        $scope.external  = external;
        $scope.external.groupId = $scope.reportPersona;
        
        $http.post('BITool/admin/externalrepo/savereport', $scope.external)
            .then(function(resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert= resp.data.message;
                    $scope.messageAlertError = '';
                    clearMessage(); 
                    $scope.clearForm();
                } else {
                    $scope.messageAlert ='';
                    $scope.messageAlertError= resp.data.message;
                    clearMessage();
                }
            },function(){
                $scope.messageAlert ='';
                $scope.messageAlertError= resp.data.message;
                clearMessage();
            });
    };
    
    function clearMessage() {
        $timeout(function() {
            $scope.messageAlert= '';
            $scope.messageAlertError = '';
        }, 4000);
    }
    
    $scope.clearForm = function() {
//        $scope.external = {
//            reportName : '',
//            reportDesc : '',
//            reportLink : '',
//            functionalArea: '',
//            linkTitle :'',
//            linkHoverInfo :'',
//        };
        $scope.external = {};
        $scope.external.additionalInfo = "#0000FF";
    };
});