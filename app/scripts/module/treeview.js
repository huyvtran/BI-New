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
                    k = '<ul>\n\
                            <li data-ng-repeat="node in ' + e + '" ui-sref-active="active">\n\
                                <div class="parent-div"><span class="first">\n\
                                    <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" class="collapsed1" data-ng-show="node.' + d + '.length>0 && node.collapsed" data-ng-click="selectNodeHead(node, $event)" >\n\
                                        {{node.' + h + '}}\n\
                                    </a>\n\
                                    <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" class="expanded1" data-ng-show="node.' + d + '.length>0 && !node.collapsed">\n\
                                        {{node.' + h + '}}\n\
                                    </a>\n\
                                </span>\n\
                                <span class="second">\n\
                                    <i class="collapsed" data-ng-show="node.' + d + '.length>0 && node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i>\n\
                                    <i class="expanded" data-ng-show="node.' + d + '.length>0 && !node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i>\n\
                                </span>\n\
                                </div>\n\
                                <div class="child-div">\n\
                                    <span class="first">\n\
                                        <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" data-ng-hide="node.' + d + '.length">\n\
                                            <div>\n\
                                                <span class="normal1" data-ng-hide="node.' + d + '.length" >\n\
                                                    {{node.' + h + '}}\n\
                                                </span>\n\
                                            </div>\n\
                                        </a>\n\
                                    </span>\n\
                                    <span class="second" data-ng-show="node.' + d + '.length>0">\n\
                                        <i class="normal" data-ng-hide="node.' + d + '.length>0" value="node.' + d + '.length > 0"></i>\n\
                                    </span>\n\
                                </div>\n\
                                <div class="collapse" uib-collapse="node.collapsed" data-tree-model="node.' + d + '" data-node-id=' + (c.nodeId || 'id') + ' data-node-label=' + h + ' data-node-children=' + d + '></div>\n\
                            </li>\n\
                        </ul>';
                e && e.length && (c.angularTreeview ? (a.$watch(e, function (m, b) {
                    g.empty().html($compile(k)(a));
                }, !1), a.selectNodeHead = a.selectNodeHead || function (a, b) {
//                    b.stopPropagation && b.stopPropagation();
//                    b.preventDefault && b.preventDefault();
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
