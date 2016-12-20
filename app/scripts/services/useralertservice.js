'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userAlertService
 * @description
 * # userAlertService
 * This service is used to alert any messages in project & modal/popup functionality
 */
angular.module('myBiApp')
.service('userAlertService', function userAlertService($rootScope, $uibModal, $window, $localStorage) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var ModalInstanceCtrl = function ($scope, $uibModalInstance, $uibModal, modalContent) {
        $scope.modalContent = modalContent;

        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$uibModal', 'modalContent'];

    function showUserAlert(args) {
        var opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            size: 'sm',
            templateUrl: 'views/useralert.html',
            controller: ModalInstanceCtrl,
            windowClass: 'Css-Center-Modal',
            resolve: {} // empty storage
        };

        opts.resolve.modalContent = function () {
            return angular.copy(args); // pass name to resolve storage
        };
        
        var modalInstance = $uibModal.open(opts);
        modalInstance.result.then(function () {
            args.ok.callback();
        }, function () {       //on cancel button press
            args.cancel.callback();
        });
    }
    
    function RefreshSSO(args) {
        $window.location.reload();
    }

    // This event need not be broadcasted from directuve which aren't in an isolated 
    // scope (UserAlertCtrl is used as a Global Controller like CommonCtrl ).
    // This Event handler is needed for isolated scope directives, if broadcasted from $rootScope.
    $rootScope.$on('ShowUserAlert', function (event, args) {
        showUserAlert(args);
        $rootScope.setLoading(false);
    });
    
    $rootScope.$on('RefreshSSO', function (event, args) {
        RefreshSSO(args);
        $rootScope.setLoading(false);
    });

    return {
        'showUserAlert': showUserAlert,
        'RefreshSSO': RefreshSSO
    };
});