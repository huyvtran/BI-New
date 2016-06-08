'use strict';
/*
 angular.treeview.js
 */
// Code here will be linted with JSHint.
/* jshint ignore:start */

(function (l) {
    l.module('angularTreeview', []).directive('treeModel', ['$compile', function ($compile) {
        return{
            restrict: 'A',
            link: function (a, g, c) {
                var e = c.treeModel,
                    h = c.nodeLabel || 'label',
                    d = c.nodeChildren || 'children',
                    k = '<ul><li data-ng-repeat="node in ' + e + '" ui-sref-active="active"><i class="collapsed" data-ng-show="node.' + d + '.length && node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i><i class="expanded" data-ng-show="node.' + d + '.length && !node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i><a ui-sref="reports.details({levelId:node.levelId})" class="collapsed1" data-ng-show="node.' + d + '.length && node.collapsed" >{{node.' + h + '}}</a><a ui-sref="reports.details({levelId:node.levelId})" class="expanded1" data-ng-show="node.' + d + '.length && !node.collapsed">{{node.' + h + '}}</a><a ui-sref="reports.details({levelId:node.levelId})" data-ng-hide="node.' +
                    d + '.length"><div><i class="normal"></i><span class="normal1" data-ng-hide="node.' +
                    d + '.length" >{{node.' + h + '}}</span> </div></a>    <div class="collapse" uib-collapse="node.collapsed" data-tree-model="node.' + d + '" data-node-id=' + (c.nodeId || 'id') + ' data-node-label=' + h + ' data-node-children=' + d + '></div></li></ul>';
                e && e.length && (c.angularTreeview ? (a.$watch(e, function (m, b) {
                    g.empty().html($compile(k)(a));
                }, !1), a.selectNodeHead = a.selectNodeHead || function (a, b) {
                    b.stopPropagation && b.stopPropagation();
                    b.preventDefault && b.preventDefault();
                    b.cancelBubble = !0;
                    b.returnValue = !1;
                    a.collapsed = !a.collapsed
                }, a.selectNodeLabel = a.selectNodeLabel || function (c, b) {
                    b.stopPropagation && b.stopPropagation();
                    b.preventDefault && b.preventDefault();
                    b.cancelBubble = !0;
                    b.returnValue = !1;
                    a.currentNode && a.currentNode.selected && (a.currentNode.selected = void 0);
                    c.selected = "selected";
                    a.currentNode = c
                }) : g.html($compile(k)(a)));
            }
        }
    }])
})(angular);

// Code here will be linted with ignored by JSHint.
/* jshint ignore:end */
