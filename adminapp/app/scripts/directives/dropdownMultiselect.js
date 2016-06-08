'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:dropdownMultiselect
 * @description
 * # dropdownMultiselect
 */
angular.module('adminPageApp')
.directive('dropdownMultiselect', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            options: '=',
            //pre_selected: '=preSelected',
            //dropdownTitle: '@'
        },
        template: "<div class='btn-group' data-ng-class='{open: open}'>" +
                "<button class='btn btn-small'  data-ng-click='toggleDropdown()'>{{getButtonText()}}&nbsp;</button>" +
                "<button class='btn btn-small dropdown-toggle' data-ng-click='toggleDropdown()'><span class='caret'></span></button>" +
                "<ul class='dropdown-menu scrollable-menu' aria-labelledby='dropdownMenu'>" +
                "<li><input type='checkbox' data-ng-change='checkAllClicked()' data-ng-model=checkAll> Check All</li>" +
                "<li class='divider'></li>" +
                "<li data-ng-repeat='option in options'><div class='checkbox'><label for=''><input type='checkbox' data-ng-change='setSelectedItem(option.groupId)' ng-model='selectedItems[option.groupId]'>{{option.groupName}}</label></div></li>" +
                "</ul>" +
                "</div>",
        link: function (scope, element, attr) {

            scope.selectedItems = {};
            scope.checkAll = false;
            scope.texts = {
                checkAll: 'Check All',
                uncheckAll: 'Uncheck All',
                selectionCount: 'checked',
                buttonDefaultText: 'Select',
                dynamicButtonTextSuffix: 'checked'
            };

            $(document).bind('click', function (event) {
                var isClickedElementChildOfPopup = element
                        .find(event.target)
                        .length > 0;

                if (isClickedElementChildOfPopup)
                    return;

                scope.$apply(function () {
                    scope.open = false;
                });
            });

            init();

            function init() {
                scope.model = [];
                for (var i = 0; i < scope.options.length; i++) {
                    scope.selectedItems[scope.options[i].id] = true;
                }
            };

            scope.toggleDropdown = function () {
                scope.open = !scope.open;
                scope.openState = scope.open;
            };

            scope.openDropDown = function () {
                console.log('hi');
            };

            scope.checkBoxClick = function (id) {
                scope.setSelectedItem(id);
                $event.stopImmediatePropagation();
            };

            scope.checkAllClicked = function () {
                if (scope.checkAll) {
                    selectAll();
                } else {
                    deselectAll();
                }
            };

            function selectAll() {
                scope.model = [];
                scope.selectedItems = {};

                angular.forEach(scope.options, function (option) {
                    scope.model.push(option.groupId);
                });
                angular.forEach(scope.model, function (id) {
                    scope.selectedItems[id] = true;
                });
            }
            ;

            function deselectAll() {
                scope.model = [];
                scope.selectedItems = {};
            }
            ;

            scope.setSelectedItem = function (id) {
                var filteredArray = [];

                if (scope.selectedItems[id] == true) {
                    scope.model.push(id);
                } else {
                    filteredArray = scope.model.filter(function (value) {
                        return value != id;
                    });
                    scope.model = filteredArray;
                }
                return false;
            };

            scope.getButtonText = function () {
                if ((scope.selectedItems.length > 0 || (angular.isObject(scope.selectedItems) && _.keys(scope.selectedItems).length > 0))) {
                    var totalSelected = angular.isDefined(scope.model) ? scope.model.length : 0;
                    if (totalSelected === 0) {
                        return scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + scope.texts.dynamicButtonTextSuffix;
                    }
                } else {
                    return scope.texts.buttonDefaultText;
                }
            };
        }
    }
});