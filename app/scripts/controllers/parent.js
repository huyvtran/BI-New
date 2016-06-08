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
.controller('ParentCtrl', function ($scope, $rootScope, $http, $q, ngProgressFactory, $state, reportsMenu, commonService, userDetailsService, userAlertService, CONFIG) {
    /**
     * @ngdoc property
     * @name biGroup
     * @description Will have object of service reportsMenu which basically have the menu or group levels of users.
     * 
     */
    $scope.biGroup = reportsMenu;
    $scope.chevron = false;
    $scope.searchParent = '#search-parent';//id of div which append typeahead popup 
    $scope.searchin = 'persona';
    $scope.searchText = '';
    $scope.searchId = 0;
    $scope.showList = true;
    $scope.mainState = $state;
    $scope.setLoading(true);
    $scope.badge = '0%';
    
    /**
     *Update my level indication
     */
    $scope.badgePercentage = {
        'Bronze': '25%',
        'Silver': '50%',
        'Gold': '75%',
        'Platinum': '100%'
    };

    userDetailsService.userPromise.then(function (userObject) {
        $scope.userObject = userObject[0];
        $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
        $scope.badge = $scope.badgePercentage[$scope.userObject.userinfo.badge];
        var userRoleDetailsUrl = commonService.prepareUserRoleDetailsUrl($scope.userObject.emcLoginName);
        
        $q.all([$http.get(userRoleDetailsUrl), reportsMenu.all()])
            .then(function (/*response*/) {
                $scope.setLoading(false);
            });
    });

    $scope.getSearchSuggest = function (val) {
        var defer = $q.defer();

        userDetailsService.userPromise.then(function (userObject) {

            var url;

            if ($scope.searchin === 'persona') {
                url = commonService.prepareSearchUrlPersona(userObject[0].emcLoginName, 1, CONFIG.limit, val);
            } else {
                url = commonService.prepareSearchUrl(userObject[0].emcLoginName, 1, CONFIG.limit, val);
            }

            $http.get(url).then(function (response) {
                defer.resolve(_.uniq(response.data.map(function (item) {
                    return ($scope.searchin === 'persona') ? item.name : item.reportName;
                })));
            });
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
                    'searchFilter': $scope.searchFilter,
                    'userName': response[0].emcLoginName
                };
                console.log(postObj);
                $http.post(addSearchTermUrl, postObj);
            });
            $scope.chevron = false;
            $state.go('search', {'searchText': $scope.searchText, 'persona': ($scope.searchin === 'persona') ? 'Y' : 'N', 'searchFilter': $scope.searchFilter});
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

    //?:embed=yes&:toolbar=no

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