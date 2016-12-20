'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ParentCtrl
 * @description
 * # ParentCtrl
 * Controller of the myBiApp
 * Parent/top Controller for all controllers.
 */
angular.module('myBiApp')
.controller('ParentCtrl', function ($scope, $rootScope, $window, $localStorage, $http, $q, ngProgressFactory, $state, reportsMenu, commonService, userDetailsService, userAlertService, CONFIG, $uibModal, $timeout) {
    /**
     * @ngdoc property
     * @name biGroup
     * @description Will have object of service reportsMenu which basically have the menu or group levels of users.
     * 
     */
//    redirectToPage();
    checkUserExist();
    getNotification();
    $scope.isMobileDevice = ($window.innerWidth < 768) ? true: false;
    $scope.noNavBar = true; 
    $scope.biGroup = reportsMenu;
    $scope.chevron = false;
    $scope.searchParent = '#search-parent';//id of div which append typeahead popup 
    $scope.searchin = 'persona';
    $scope.searchText = '';
    $scope.searchId = 0;
    $scope.showList = true;
    $scope.mainState = $state;
    $scope.setLoading(true);
    $scope.scrollVariable = false
    $scope.zIndex = '999';
    $localStorage.treeLevelId = false;
    $scope.operationalDashboard = false;
    $scope.toggleNotfy = false;
    var newHeight, scrollBar;
    
    if($window.innerWidth < 768) {
        newHeight = 75;
        scrollBar = true;
    } else if ($window.innerWidth < 992) {
        newHeight = 100;
        scrollBar = true;
    } else {
        newHeight = 250;
        scrollBar = false;
    }
    
    $scope.notfyConfig = {
        autoHideScrollbar: scrollBar,
        theme: 'dark',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: newHeight,
        scrollInertia: 0
    };
    
    $scope.notfyConfigEmpty = {
        autoHideScrollbar: scrollBar,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 0,
        scrollInertia: 0
    };
    
    $scope.$on('breadCrumbValue', function(event, value){
        $scope.pageBreadCrumb = value
    });
    
    $scope.$on('hideReportTabs', function(event, value){
        $scope.hideTabsFlag = value
    });
    
    $scope.$on('setNavBar', function(event, value){
        $scope.noNavBar = true;
        $scope.toggleNotfy = false;
        $scope.zIndex = '999';
    });
    
    $scope.$on('hideNotfy', function(event, value){
        $scope.toggleNotfy = value;
    });
    
    $scope.toggleLeftMenu = function () {
        $scope.isMenuCollapsed = ($scope.isMenuCollapsed) ? false : true;
        $scope.$broadcast('menuCollapsedStatus', $scope.isMenuCollapsed);
        var value = ($scope.isMenuCollapsed) ? 1 : 0;
        
        userDetailsService.userPromise.then(function(userObj) {
            var putObj = {
                'userId' : userObj[0].uid,
                'isMenuCollapsed' :value,
            };

            $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                .then(function (resp, status, headers) {

                }, function (resp, status, headers, config) {

                });
        });
    };
    
    $scope.showDismissIcon = function(status, id) {
        if(status) {
            $scope.dismissId = id;
        } else {
            $scope.dismissId = status;
        }
    };
    
    $scope.hideNavBar = function() {
        $scope.toggleNotfy = false;
        if($scope.noNavBar) {
            $scope.noNavBar = false;
            $scope.zIndex = '998';
        } else {
            $scope.noNavBar = true;
            $timeout(function(){$scope.zIndex = '999'}, 1000);
            
        }
    };
    
    $scope.openNotfyMobile = function() {
        if($scope.toggleNotfy){
            $scope.toggleNotfy = false;
        }  else {
            $scope.toggleNotfy = true;
        }
    }
    
    $scope.$on('myLevelIndication', function(event, value) {
        $localStorage.myLevel = value
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization, isMenuCollapsed){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $localStorage.isMenuCollapsed = isMenuCollapsed
        $scope.userTheme = $localStorage.userTheme;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    /**
     * Update my level indication
     */
    userDetailsService.userPromise.then(function (userObject) {
        $scope.userObject = userObject[0];
        
        $timeout(function() {
            if($localStorage.myLevel) {
                $scope.myLevel = $localStorage.myLevel;
            } else {
                setUserLevel($scope.userObject);
            }

            $scope.personaList =  userObject[0].userinfo.userPersonaList;
            $scope.defaultPersona = userObject[0].userinfo.group[0].groupId;
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
        },2000);
        
        $q.all([reportsMenu.all()])
            .then(function (/*response*/) {
                $scope.operationalDashboard = reportsMenu.operationalLink;;
                $scope.setLoading(false);
            });
    });

    $scope.getSearchSuggest = function (val) {
        var defer = $q.defer();
        var filter = ($scope.searchFilter && $scope.searchFilter.id) ? $scope.searchFilter.id : 'searchText';
        var url = 'BITool/home/getAutoSuggestionList/1/20?searchType=' + $scope.searchin + '&' + filter + '=' + val;
            
        $http.get(url).then(function (response) {
            defer.resolve(_.uniq(response.data.map(function (item) {
                return item;
            })));
        });
        
        return defer.promise;
    };
    
    $scope.updateSearchIn = function(val) {
        $scope.searchin = (val === 'persona') ? 'persona' : 'catalog';
        $rootScope.searchin = $scope.searchin;
    }

    $scope.searchOnSelect = function ($item/*, $model, $label, $event*/) {
        $scope.searchText = $item;
        $scope.submitSearch();
    };

    $scope.submitSearch = function () {
        if ($scope.searchText) {
            $scope.model.isMinimised = true;
            
            userDetailsService.userPromise.then(function (response) {
                var addSearchTermUrl = commonService.prepareAddSearchTermUrl();
                var postObj = {
                    'searchString': $scope.searchText,
                    'userName': response[0].emcLoginName
                };
                $http.post(addSearchTermUrl, postObj);
            });
                
            $scope.chevron = false;
            
            if($scope.searchFilter) {
                $state.go('search', {'searchText': $scope.searchText, searchfilter:{'filter':$scope.searchFilter.id}, 'persona': ($scope.searchin === 'persona') ? 'Y' : 'N'});
            } else {
                $state.go('search', {'searchText': $scope.searchText, searchfilter:{'filter':null}, 'persona': ($scope.searchin === 'persona') ? 'Y' : 'N'});
            } 
        }
    };

    $scope.updateSearchId = function (id) {
        $scope.searchId = id;
    };

    $scope.$watch('userRole.selected', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.$broadcast('changeRole', newValue);
        }
    });

    $scope.updateShowlist = function (boolValue) {
        $scope.showList = boolValue;
    };

    $scope.showIcons = function () {
        $scope.updateShowlist(true);
    };

    $scope.hideIcons = function () {
        $scope.updateShowlist(false);
    };

    $scope.$on('emptySearchText', function (/*event, next, current, error*/) {
        $scope.searchText = '';
    });
    
    $scope.readAllNotification = function() {
        $http.put('BITool/home/markAllNotificationAsRead')
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.readStatusMessage = resp.data.message;
                    
                    angular.forEach($scope.notficationObj.userNotificationList, function(notification){
                        notification.readDate = new Date().getTime();
                    });
                    
                    angular.forEach($scope.notficationObj.userNewAlertList, function(notification){
                        notification.readDate = new Date().getTime();
                    });
                    
                    $scope.notficationObj.newNotificationCount = 0;
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.readStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.readStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.dismissAllNotification = function() {
        var modalDeleteNotification = $uibModal.open({
            templateUrl:'views/deleteNotificationModal.html',
            controller:'DeleteNotificationModalCtrl',
            windowClass: 'switch-modal',
            resolve: {
                items: function() {
                    return {
                        data: $scope.notficationObj
                    };
                }
            }
        });
        
            
        modalDeleteNotification.result.then(function(Obj){
            $http.put('BITool/home/dismissAllNotification')
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.dismissStatusMessage = resp.data.message;            
                        $localStorage.notficationObj  = $scope.notficationObj = {"userNewAlertList":[],"userNotificationList":[],"newNotificationCount":0};
                        paginateNotification();
                    } else {
                        $scope.dismissStatusMessage = '';
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = resp.data.message
                        }
                    }
                }, function () {
                    $scope.dismissStatusMessage = '';
                    $scope.messageAlertError = "Error!!.";
                }); 
        });
    };
    
    $scope.itemsPerPage = 3;
    $scope.currentPage = 0;
    $scope.notificationItems = [];
    
    $scope.setReadNotification = function(id,readFlag) {
        $http.put('BITool/home/markNotificationAsRead?assignId='+id+'&isRead='+readFlag)
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    var index = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === id});   
                    $scope.readStatusMessage = resp.data.message;
                    
                    if(!$scope.notficationObj.userNotificationList[index].readDate) {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
                        $scope.notficationObj.userNotificationList[index].readDate = new Date().getTime();
                    } else {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount +1;
                        $scope.notficationObj.userNotificationList[index].readDate = '';
                    }
                    
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.readStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.readStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.dismissNotification = function(id) {
        $http.put('BITool/home/dismissNotification?assignId='+id)
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    var index = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === id});
                    $scope.dismissStatusMessage = resp.data.message;            
                    
                    if(!$scope.notficationObj.userNotificationList[index].readDate) {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
                        ($scope.notficationObj.userNewAlertList).splice(index, 1);
                    }
                    
                    ($scope.notficationObj.userNotificationList).splice(index, 1);
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.dismissStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.dismissStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            paginateNotification();
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled link-disable" : "";
    };
    
    $scope.nextPage = function() {
        if ($scope.currentPage < getPageCount()) {
            $scope.currentPage++;
            paginateNotification();
        }
    };

    $scope.nextPageDisabled = function() {
        return $scope.currentPage === getPageCount() ? "disabled link-disable" : "";
    };
    
    function setUserLevel(usrObj) {
        if (usrObj.userinfo.badge === 'Bronze') {
            $scope.myLevel = 'bronze-level';
        } else if (usrObj.userinfo.badge === 'Silver') {
            $scope.myLevel = 'silver-level';
        } else if (usrObj.userinfo.badge === 'Gold') {
            $scope.myLevel = 'gold-level';
        } else if (usrObj.userinfo.badge === 'Platinum') {
            $scope.myLevel = 'platinum-level';
        }

        $localStorage.myLevel = $scope.myLevel
        $scope.$emit('myLevelIndication', $scope.myLevel);
    }
    
    function checkUserExist() {
        $http.get('BITool/userExistInBITool').then(function(response) {
            $rootScope.personaInfo = response.data;
            if(response.data && response.data.isApplicationRunning === false) {
                $window.location.href ='/maintenance/index.html';
            }
        });
    }
    
    function getPageCount() {
        if($scope.notficationObj && $scope.notficationObj.userNotificationList) {
            return Math.ceil($scope.notficationObj.userNotificationList.length/$scope.itemsPerPage)-1;
        }
    }
    
    function getNotification() {
        $http.get('BITool/home/getNotificationByUser').then(function(response) {
            $scope.notficationObj = $localStorage.notficationObj = response.data;
            
            if($scope.notficationObj.userNewAlertList.length > 0) {
                $scope.createAlertPopup($scope.notficationObj);
            }
            
            paginateNotification();
        });
    }
    
    function paginateNotification() {
        $scope.notificationItems = [];
        var min = ($scope.currentPage * $scope.itemsPerPage);
        var max  = ($scope.notficationObj.userNotificationList.length < min+3) ? $scope.notficationObj.userNotificationList.length : min+3;
        
        for (var i= min; i<max; i++) {
            ($scope.notficationObj.userNotificationList[i])? $scope.notificationItems.push($scope.notficationObj.userNotificationList[i]):'';
        }
        
        if($scope.notficationObj.userNotificationList.length === min) {
            $scope.currentPage--;
            paginateNotification();
        }
    }
    
    $scope.createAlertPopup = function () {
        if($window.innerWidth < 768) {
            return;
        }
            
        angular.forEach($scope.notficationObj.userNewAlertList, function(notfication) {
            var modalInstance = $uibModal.open({
                templateUrl:'views/notificationModal.html',
                controller:'NotificationModalCtrl',
                windowClass: 'notfy-modal',
                resolve: {
                    items: function() {
                        return{
                            data: notfication
                        };
                    }
                }
            });
            
            modalInstance.result.then(function(Obj){
                var index1 = _.findIndex($scope.notficationObj.userNewAlertList, function(item) { return item.assignId === Obj.assignId});
                var index2 = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === Obj.assignId});
                console.log(index1);
                console.log(index2);
                $http.put('BITool/home/dismissNotification?assignId='+Obj.assignId)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            getNotification();
//                            $timeout(function() {
//                                $scope.dismissAlertMessage = resp.data.message;     
//                                ($scope.notficationObj.userNewAlertList).splice(index1, 1);   
//                                ($scope.notficationObj.userNotificationList).splice(index2, 1);
//                                $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
//                                $localStorage.notficationObj  = $scope.notficationObj;
//                                $scope.$apply();
//                            }, 1000);
                        } else {
                            $scope.dismissAlertMessage = '';
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = resp.data.message
                            }
                        }
                    }, function () {
                        $scope.dismissAlertMessage = '';
                        $scope.messageAlertError = "Error!!.";
                    });
            });
        });
    }
    
//    function redirectToPage(){
//        if($localStorage.urlObj) {
//            console.log($localStorage.urlObj);
//            $state.go($localStorage.urlObj.hash.split('/')[1]);
//        }
//    }
    
    $scope.openModelPersona = function () {
        var modalInstance = $uibModal.open({
           templateUrl:'views/switchPersona.html',
           controller:'SwitchPeronaCtrl',
           windowClass: 'switch-modal',
           resolve: {
                items: function () {
                    return{
                        personaList: $scope.userObject.userinfo.userPersonaList,
                        defaultPersona: $scope.userObject.userinfo.group[0].groupId
                    };
                }
            }
        });
    };
    
    $scope.setNewPersona = function() {
        $scope.setLoading(true);
        
        var obj = {
            'groupId' : $scope.defaultPersona,
            'isActive' : 'Y'
        };
        
        $http.put('BITool/activateDefaultPersona', obj)
            .then(function (data, status, headers, config) {
                $scope.statusMessage = data.message; 
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            }, function (data, status, headers, config) {
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            });
    };
    
}).directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    };
});

angular.module('myBiApp').controller('SwitchPeronaCtrl', function ($scope, $state, $uibModalInstance, items, $http, $window, $rootScope, $timeout) {
    $scope.personaList = items.personaList;
    $scope.defaultPersona = items.defaultPersona;
    $scope.currentPersona = items.defaultPersona;
    
    $scope.setDefaultPersona = function () {
        $scope.setLoading(true);
        var obj = {
            'groupId' : $scope.defaultPersona,
            'isActive' : 'Y'
        };
        
        $http.put('BITool/activateDefaultPersona', obj)
            .then(function (data, status, headers, config) {
                $uibModalInstance.dismiss('close');
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            }, function (data, status, headers, config) {
                $uibModalInstance.dismiss('close');
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            });
    }

    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
});