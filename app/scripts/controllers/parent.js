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
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: newHeight,
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
        $scope.zIndex = '999';
    });
    
    $scope.hideNavBar = function() {
//        ($scope.noNavBar) ? $scope.noNavBar = false: $scope.noNavBar = true;
        if($scope.noNavBar) {
            $scope.noNavBar = false;
            $scope.zIndex = '998';
        } else {
            $scope.noNavBar = true;
            $timeout(function(){$scope.zIndex = '999'}, 1000);
            
        }
    };
    
    $scope.$on('myLevelIndication', function(event, value) {
        $localStorage.myLevel = value
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $scope.userTheme = $localStorage.userTheme;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    userDetailsService.userPromise.then(function (userObject) {
        $scope.userObject = userObject[0];
        
//        if($localStorage.myLevel) {
//            $scope.myLevel = $localStorage.myLevel;
//        } else {
//            setUserLevel($scope.userObject);
//        }
        
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
        
        /**
         * Update my level indication
         */
//        var userRoleDetailsUrl = commonService.prepareUserRoleDetailsUrl($scope.userObject.emcLoginName);
        
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

    //?:embed=y&:showVizHome=n&:apiID=handler0&:toolbar=bottom 
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
    
    $scope.setReadNotification = function(id) {
        console.log('read function');
        console.log(id);
    }
    
    $scope.dismissNotification = function(id) {
        console.log('dismiss function');
        console.log(id);
    }
    
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
    
    function getNotification() {
        $http.get('BITool/home/getNotificationByUser').then(function(response) {
            $scope.notficationObj = $localStorage.notficationObj = response.data;
            console.log($scope.notficationObj);
            if($scope.notficationObj.userNewAlertList.length > 0) {
                console.log($scope.notficationObj.userNewAlertList.length)
            }
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
    }
    
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

angular.module('myBiApp')
.controller('SwitchPeronaCtrl', function ($scope, $state, $uibModalInstance, items, $http, $window, $rootScope, $timeout) {
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