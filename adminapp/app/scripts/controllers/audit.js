'use strict';

angular.module('adminPageApp').controller('AuditCtrl',function($scope, $q,$uibModal, $http, $timeout, userDetailsService){
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.myData = {}; 
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    $scope.popup1 = {
        opened: false,
        dt: new Date(),
        minDate: null,
        maxDate: new Date()
    };
    $scope.popup1.dt.setDate($scope.popup1.dt.getDate()-7);
    $scope.popup2 = {
        opened: false,
        dt: new Date(),
        minDate: $scope.popup1.dt,
        maxDate: new Date()
    };
    $scope.downloadLink = "/BITool/audit/downloadAuditReport?searchReportName="; 
    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };
    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };
    $scope.filterAudit = function() {
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();   
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    function columnDefs(){
        return [
            /*{name: 'reportId', isplayName:'Report Id' , width:'10%', cellToolTip:true },*/
            {name: 'reportType',displayName:'Report Type' ,width:'10%', cellToolTip:true/*, cellTemplate:"<span>{{row.entity.lastName}}<span ng-show='row.entity.lastName && row.entity.firstName'>,</span> {{row.entity.firstName}}</span>"*/},
            {name: 'functionalArea',displayName:'Functional Area' ,width:'15%', cellToolTip:true},
            {name: 'accessDate',displayName:'Date' ,width:'15%', cellToolTip:true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.accessDate | date:"MM/dd/yy h:mm:ss a"}}</div>'},
            {name: 'sourceSystem',displayName:'Source System' ,width:'15%', cellToolTip:true},
            {name: 'sourceReportId',displayName:'Source Report Id' ,width:'15%', cellToolTip:true},
            {name: 'type',displayName:'Type' ,width:'10%', cellToolTip:true},
            {name: 'reportName',displayName:'Report Name' ,width:'15%', cellToolTip:true},
            {name: 'userName',displayName:'User Name' ,width:'15%', cellToolTip:true},
            {name: 'userPersona',displayName:'User Persona' ,width:'15%', cellToolTip:true},
            {name: 'owner',displayName:'Owner' ,width:'15%', cellToolTip:true},
            {name: 'groupName',displayName:'Audit Persona' ,width:'15%', cellToolTip:true}
        ];
    }

    function onRegisterApi (gridApi){
        $scope.gridApi=gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateAudit);
    };
    
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            :[],
        columnDefs                      :columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    //Continue the code for update and new when the webservices are provided
    $scope.searchTextValue = '';
    $scope.searchPersonaValue = '';
    $scope.searchGroupValue = 0;
    var searchPromises = [];
    
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
            var group = _.sortBy(resp.data, 'groupName');
            $scope.$emit('emitAuditGroup', group);
        });
    });
   
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
            eachPromise.cancelService();
        });
        
        searchPromises = [];
    }
    
    $scope.$on('searchReportAudit', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
    
    $scope.$on('broadcastAuditPersona', function(event, searchTxt){
        $scope.searchPersonaValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
 
    $scope.$on('broadcastAuditGroup', function(event, searchTxt){
        if (searchTxt) {
            $scope.searchGroupValue = searchTxt;
        } else {
            $scope.searchGroupValue = 0;
        }
        
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
 
    $scope.updateAudit = function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        
        var httpPromise = $http({
            'url': 'BITool/audit/getBIAuditSearchReport/'+offset+'/20?searchReportName='+$scope.searchTextValue+'&searchReportType='+$scope.searchPersonaValue+'&searchGroupId='+$scope.searchGroupValue+'&searchFromDate='+$scope.popup1.dt.toISOString().substring(0, 10)+' 00:00:00'+'&searchToDate='+$scope.popup2.dt.toISOString().substring(0, 10)+' 23:59:59',
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            if($scope.myData.data.length===0){
                $scope.myData.data=resp.data;
            }else{
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }
        
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function(){
                promise.resolve();
            });
        });
        
        httpPromise.cancelService = function(){
             canceller.resolve();
        };
        
        searchPromises.push(httpPromise);
        
        return promise.promise;
    };
    
    $scope.updateAudit();
        
    $scope.$watch('messageAlert',function(){
        $timeout(function(){
            $scope.messageAlert= "";
        },5000);
    });
//end    
});