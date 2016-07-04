'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ExternalModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ExternalModalCtrl', function ($scope, $uibModalInstance, items, $http, $q) {
    $scope.items = items;
    $scope.levelGroupMaps = [{
        'selectedlevel': 0,
        'selectedgroup': 0
    }];
    $scope.updatefields = true;
    $scope.progress = false;
    $scope.saveText = '';
    
    $http.get('BITool/admin/externalrepo/searchreport/' + $scope.items.sourceReportId)
        .then(function (response) {
            var resp = response.data;
            $scope.items.owner = resp.owner;
            $scope.items.reportDesc = resp.reportDesc;
            $scope.items.refreshStatus = (resp.refreshStatus) ? resp.refreshStatus : 'N';
            $scope.items.tabbedViews = (resp.tabbedViews) ? resp.tabbedViews : 'N';
            //$scope.items.recommended = (resp.recommended)? resp.recommended : 'N';
            $scope.items.reportLink = resp.reportLink;
            $scope.items.functionalArea = resp.functionalArea;
            $scope.items.functionalAreaLvl1 = resp.functionalAreaLvl1;
            $scope.items.functionalAreaLvl2 = resp.functionalAreaLvl2;
            $scope.items.linkTitle = resp.linkTitle;
            $scope.items.linkHoverInfo = resp.linkHoverInfo;
            $scope.items.createdDate = resp.createdDate;
            $scope.items.updatedDate = resp.updatedDate;
            $scope.items.sourceSystem = resp.sourceSystem;
            $scope.items.viewCount = resp.viewCount;
            $scope.items.additionalInfo = resp.additionalInfo;
            $scope.items.systemDescription = resp.systemDescription;
            $scope.items.reportName = resp.reportName;
            $scope.items.reportType = resp.reportType;
        });

    $scope.ok = function () {
        delete $scope.items.createdBy;
        delete $scope.items.updatedBy;
        delete $scope.items.groupId;
        delete $scope.items.groupName;
        
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $scope.saveText = 'saving...';
        $scope.progress = true;
        
        $http.put("BITool/admin/updateReport?isManageExternalUpdate=true", $scope.items)
            .then(function (updatedData, status, headers) {
                $scope.progress = false;
                $scope.saveText = updatedData.data.message;
            }, function (updatedData, status, headers, config) {
                $scope.progress = false;
                $scope.saveText = updatedData.data.message;
            });
        //$uibModalInstance.close(returnObj);
    };

    $scope.cancel = function () {
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $uibModalInstance.close(returnObj);
    };
});