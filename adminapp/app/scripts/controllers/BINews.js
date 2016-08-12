'use strict';

angular.module('adminPageApp').controller('BINewsCtrl',function($scope,$http,$uibModal,$q, $timeout){
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.myData={};
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    
    function columnDefs(){
        return[ 
            {name: 'Options', width:'10%',cellTemplate: 'views/adminDropdown.html'},
            {name: 'id', displayName: 'News ID', width: '10%', cellTooltip:true},
            {name: 'title', displayName: 'Title', width: '15%', cellTooltip:true},
            {name: 'description', displayName: 'Description', width: '20%', cellTooltip:true},
            {name: 'url', displayName: 'URL', width: '20%', cellTooltip:true},
            {name: 'createdDate', displayName: 'Created Date', width: '25%', cellTooltip:true}
        ];
    }
    
     function onRegisterApi (gridApi){
                $scope.gridApi=gridApi;
                //infiniteScroll functionality for adding more rows.
                gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateNews);
     };
     
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    
    
    $scope.deleteItems=function(row){
        var modalInstance=$uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    
                    return {
                        pageType : 'News',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function(deleteObjID){
           
           var newArray=$scope.myData.data;
           
           $scope.messageAlert= "Deleting NewsId "+deleteObjID;
            $scope.messageAlertError='';
           $http.get('BITool/admin/deleteNews/'+deleteObjID)
           .then(function(response, status, headers){
                if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert = "NewsID " +deleteObjID + " deleted successfully";
                    var deleteObj={};
                    for(var i=0; i<$scope.myData.data.length; i++){
                        var eachEle=$scope.myData.data[i];
                        if(eachEle.id===deleteObjID){
                            deleteObj=eachEle;
                        }
                    }
    
                    var index = $scope.myData.data.indexOf(deleteObj);
                    $scope.myData.data.splice(index,1);
                } else {
                    $scope.messageAlert= "";
                    $scope.messageAlertError="Error While Deleting the NewsId " + deleteObjID;
                    if (response.data && response.data.message) {
                        $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                    }
                }
           },function(newArray, status,headers, config){
                $scope.messageAlert= "";
                $scope.messageAlertError="Error While Deleting the NewsId " + deleteObjID;
               
           });
        });
        
    };
    
    
    $scope.open=function(row){
        var defer=$q.defer();
        var modalInstance=$uibModal.open({
           templateUrl: 'views/BINewsModal.html',
           controller: 'BINewsModalInstanceCtrl',
           resolve: {
               items: function(){
                   if(row === undefined) {
                       return {'type':'new'};
                   } else {
                       return angular.copy(row);
                   }
                   
               }
           }
        });
        modalInstance.result.then(function(updateNewsObj){
            
            if(updateNewsObj.type && updateNewsObj.type === 'new') {
                var postObj = _.omit(updateNewsObj,'type');
                $scope.messageAlert= "Saving "+updateNewsObj.title+"...";
                $scope.messageAlertError='';
                $http.post('BITool/admin/addNews',postObj).then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert= "News " + updateNewsObj.title + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateNews();
                    } else {
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While Saving the News " + updateNewsObj.title;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                    
                },function(){
                   $scope.messageAlert ='';
                   $scope.messageAlertError= "Error While Saving the News " + updateNewsObj.title;
                });
                
            } else {
                updateNewsObj.id=parseInt(updateNewsObj.id);
                $scope.messageAlert= "Updating "+updateNewsObj.title+"...";
                $scope.messageAlertError='';
                $http.post('BITool/admin/updateNews',updateNewsObj)
                .then(function(updatedNews, status, headers){
                    if (updatedNews.data && updatedNews.data.status && updatedNews.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert= "News " + updateNewsObj.title + " updated successfully";
                        $scope.myData.data = [];
                        $scope.updateNews();
                    } else {
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the News " + updateNewsObj.title;
                        if (updatedNews.data && updatedNews.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + updatedNews.data.message
                        }
                    }
                },function(updatedNews, status, headers, config){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the News " + updateNewsObj.title;
                });
                
            }
            defer.resolve(updateNewsObj);
        },function(){
            
        });
        return defer.promise;
   };
   $scope.searchTextValue = '';
   var searchPromises = [];
   
   function cancelPendingPromise () {
                _.map(searchPromises, function(eachPromise){
                        eachPromise.cancelService();
                });
                searchPromises = [];
    }
   
   $scope.$on('searchNews', function(event, searchTxt){
             $scope.searchTextValue = searchTxt;
             cancelPendingPromise();
             $scope.myData.data = [];
             $scope.updateNews();
        });
   
    $scope.updateNews=function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/newsSearch/'+offset+'/20?searchText='+$scope.searchTextValue,
            'method': 'get',
            'timeout': canceller.promise
          }).then(function(resp){
                    
                    if($scope.myData.data.length===0){
                        $scope.myData.data=resp.data;
                    }else{
                        $scope.myData.data = $scope.myData.data.concat(resp.data);
                    }
                    $scope.gridApi.infiniteScroll.saveScrollPercentage();
                    $scope.gridApi.infiniteScroll.dataLoaded(false,resp.data && resp.data.length === 20).then(function(){
                        promise.resolve();
                    });
        });
        httpPromise.cancelService = function(){
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    
    $scope.updateNews();
    
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
    
});

angular.module('adminPageApp').controller('BINewsModalInstanceCtrl',function($scope,$uibModalInstance,items, $http){
    if(items.type && items.type === 'new' ) {
        $scope.items = {
            "id":null,
            "createdDate":null,
            "description":"",
            "title":"",
            "url":"",
            "type": 'new'
            };
    } else {
        $scope.items = items;
    }
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    };
    
   
    $scope.save=function(updateNewsObj){
        
        $scope.updateNewsObj = updateNewsObj;
       
        $uibModalInstance.close(updateNewsObj);
        
        
    };
});

