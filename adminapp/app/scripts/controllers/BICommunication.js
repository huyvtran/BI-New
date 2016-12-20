'use strict';

angular.module('adminPageApp').controller('BICommunicationCtrl',function($scope, userDetailsService, $http, $uibModal, $q, $timeout){
    var groups = []; 
    $scope.myData = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    function columnDefs(){
        return[
            {name: 'Action',  width:'10%', cellTemplate: 'views/adminDropdown.html',enableSorting: false},
            {name: 'communicationId',displayName: 'Communications ID', width:'12%', cellTooltip:true}, 
            {name: 'groupName',displayName: 'Persona', width:'12%', cellTooltip:true},
            {name: 'link',displayName: 'Op_Dashboard_Page', width:'24%', cellTooltip:true},
            {name: 'title',displayName: 'Title', width:'15%', cellTooltip:true},
            {name: 'details',displayName: 'Details', width:'10%', cellTooltip:true},
            {name: 'image',displayName: 'Image URL', width:'20%', cellTooltip:true}
        ];
    }
   
    function onRegisterApi (gridApi){
        $scope.gridApi=gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateCommunication);
     };
  
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            :[],
        columnDefs                      :columnDefs(),
        onRegisterApi                   :onRegisterApi
    };

    //
    //groups dropdown on leftpanel
//    userDetailsService.userPromise.then(function(userObj){
//        userObj = userObj[0];
//        var url;
//        if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'admin' ) {
//            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
//        } else if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'buadmin') {
//            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
//        }
//        url = url+userObj.emcLoginName;
//        $http.get(url).then(function(resp){
//            $scope.$emit('emitAuditGroup', resp.data);
//        });
//    });

    $scope.$on('broadcastAuditGroup', function(event, communicationGroup){
        if (communicationGroup) {
            $scope.communicationGroup = communicationGroup;
        } else {
            $scope.communicationGroup = '';
        }
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateCommunication();
    });
    //
    
    $scope.deleteItems=function(row){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    row.id = row.communicationId;
                    return{
                        pageType : 'Communication',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function(deleteObjID){
            var newArray = $scope.myData.data;
            $scope.messageAlert= "Deleting CommunicationID "+deleteObjID ;
            $scope.messageAlertError='';
            
            $http.delete('BITool/admin/deleteBICommunication/'+deleteObjID)
                .then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "CommunicationID " +deleteObjID + " deleted successfully";
                        var deleteObj={};
                        for(var i=0; i<$scope.myData.data.length; i++){
                            var eachEle=$scope.myData.data[i];
                            if(eachEle.communicationId===deleteObjID){
                                deleteObj=eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index,1);
                    } else {
                        $scope.messageAlert="";
                        $scope.messageAlertError="Error While Deleting the CommunicationID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                },function(){
                    $scope.messageAlert="";
                    $scope.messageAlertError="Error While Deleting the CommunicationID " + deleteObjID;
                });
        });
    };
 
    $scope.open = function(row){
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/BICommunicationModal.html',
            controller: 'BICommunicationModalInstanceCtrl',
            resolve: {
                items: function(){
                    if(row === undefined){
                        return {'type':'new', groups: groups};
                    }else{
                        return {'type':'edit', groups: groups, data: angular.copy(row)};
                    }
                }
            }
        });
        
        modalInstance.result.then(function (selectedItem){
            if(selectedItem.type && selectedItem.type === 'new'){
                if (selectedItem.file) {
                    var request = {
                        method: 'POST', 
                        url: 'BITool/admin/addCommunicationWithImage',
                        data: selectedItem.data,
                        transformRequest : angular.identity,
                        headers : {
                            'Content-Type' : undefined
                        } 
                    };
                } else {
                    var request = {
                        method: 'POST',
                        url: 'BITool/admin/addCommunicationWithImage',
                        data: selectedItem.data,
                        headers : {
                            'Content-Type' : undefined
                        }
                    };
                }

                $scope.messageAlert = "Saving "+selectedItem.title+"...";
                $scope.messageAlertError='';
                
                $http(request)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert= "Communication " + selectedItem.title + " saved successfully";
                            $scope.myData.data = [];
                            $scope.updateCommunication();
                        } else {
                            $scope.messageAlert ='';
                            $scope.messageAlertError= "Error While Saving the Communication " + selectedItem.title;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    },function(){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While Saving the Communication " + selectedItem.title;
                    });
            } else {
                $scope.messageAlert= "Updating "+selectedItem.title+"...";
                $scope.messageAlertError='';
                var request = {
                        method: 'POST',
                        url: 'BITool/admin/updateBICommunication',
                        data: selectedItem.data,
                        headers : {
                            'Content-Type' : undefined
                        }
                    };
            
                //var communication = _.omit(selectedItem,'groupName');
                $http(request)
                    .then(function(resp){
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert= "Communication " + selectedItem.title + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateCommunication();
                        } else {
                            $scope.messageAlert ='';
                            $scope.messageAlertError= "Error While updating the Communication " + selectedItem.title;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    },function(){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the Communication " + selectedItem.title;
                    });
            }
            defer.resolve(selectedItem);
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
    
    $scope.$on('searchCommunication', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateCommunication();
    });
 
    $scope.updateCommunication = function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        $scope.communicationGroup = ($scope.communicationGroup) ? $scope.communicationGroup : '';
        
        var httpPromise = $http({
            'url': 'BITool/admin/communicationSearch/'+offset+'/20?searchText='+$scope.searchTextValue+'&groupid='+$scope.communicationGroup,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            groups = _.sortBy(resp.data.allGroups, 'groupName');
            $scope.$emit('emitAuditGroup', groups);
            
            _.map(resp.data.communicationList,function(eachList){
               //eachList.groupId; 
                _.map(resp.data.allGroups,function(eachGroup){
                    if(eachList.groupId === eachGroup.groupId){
                        eachList.groupName = eachGroup.groupName;
                    }
                });
            });
                
            if($scope.myData.data.length===0){
                $scope.myData.data=resp.data.communicationList;
            }else{
                $scope.myData.data = $scope.myData.data.concat(resp.data.communicationList);
            }

            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false,resp.data && resp.data.communicationList && resp.data.communicationList.length === 20).then(function(){
                promise.resolve();
            });
        });
        
        httpPromise.cancelService = function(){
            canceller.resolve();
        };
        
        searchPromises.push(httpPromise);
        return promise.promise;
    };
        
    $scope.updateCommunication();
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

angular.module('adminPageApp').controller('BICommunicationModalInstanceCtrl',function($scope,$uibModalInstance,items, $timeout, $http){
    $scope.groups = items.groups;
    $scope.imageMode = 'url';
    $scope.errorFlag = false;
    $scope.imageError = '';
    var imageData = new FormData();
    
    $scope.getTheImageFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            imageData.append('imageFile', value);
        }); 
    };
    
    $scope.validateUpload = function(files) {
        $scope.imageError = '';
        var fileName = files[0].name;
        var size = files[0].size;
        var extension = fileName.split('.');
        extension = extension[extension.length-1];
        
        $scope.$apply(function() {

            if(extension !== 'jpg' && extension !== 'png') {
                changeToDefault('Error : Unsupported file format. Please choose only jpg or png only');
                return;
            }

            if(size > 500000) {
                changeToDefault('Error : File size greater than 500KB. Please select an image less than 500 KB in size');
                return;
            }
            
            var url = 'BITool/admin/imageExistInServer/?imageName='+fileName;
            
            $http.get(url).then(function(response, status, headers){
                if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                    $scope.imageError = '';
                    $scope.errorFlag = true;
                } else {
                    $scope.imageError = response.data.message;
                    $scope.errorFlag = true;
                }
            },function(newArray, status,headers, config){
                $scope.messageAlertError="Error While updating";
            });
        });
    };
    
    $scope.urlValidate = function() {
        var imageUrl = document.getElementById('communicationImageUrl').value;
        if(imageUrl && (imageUrl.indexOf('.png') < 0) && (imageUrl.indexOf('.jpg') < 0 )) {
            $scope.CommunicationForm.communicationImage.$error.url = true;
        }
    }
    
    if(items.type && items.type === 'new') {
        $scope.items = {
            "communicationId":null,
            "link":"",
            "title":"",
            "details":"",
            "image":"",
            "type": 'new',
            "imageFile":""
        };
    }else {
        $scope.items = items.data;
        
        angular.forEach($scope.groups, function(group) {
            if(group.groupId === items.data.groupId) {
                $scope.items.groupName = group.groupName;
            } 
        });
    }

    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
    
    $scope.save = function(selectedItem){
        $scope.selectedItem = selectedItem;
        var file = document.getElementById('myFile').files[0];
        
        (selectedItem.title)? imageData.append('title', selectedItem.title) :'';
        (selectedItem.details)? imageData.append('details', selectedItem.details): '';
        imageData.append('link', selectedItem.link);
        
        if(items.type && items.type === 'new'){
            selectedItem.groupIdList = selectedItem.groupIdList.toString();
            selectedItem = _.omit(selectedItem,'type');
            imageData.append('groupIdList', selectedItem.groupIdList);
            imageData.append('communicationId', null);
            
            if(file) {
                imageData.append('image', '');
                $uibModalInstance.close({'type':'new', 'file':true, 'title':selectedItem.title, 'data':imageData});
            } else {
                imageData.append('image', selectedItem.image);
                $uibModalInstance.close({'type':'new', 'file':false, 'title':selectedItem.title, 'data':imageData});
            }
        } else {
            imageData.append('communicationId', selectedItem.communicationId);
            imageData.append('image', selectedItem.image);
            imageData.append('groupId', selectedItem.groupId);
            $uibModalInstance.close({'title':selectedItem.title, 'data':imageData});
        }
    };
    
    function changeToDefault(message) {
        $scope.imageError = message;
        $scope.errorFlag = false;
        var fileInputElement = document.getElementById('myFile');
        fileInputElement.parentNode.replaceChild(
            fileInputElement.cloneNode(true), 
            fileInputElement
        );
    }
});