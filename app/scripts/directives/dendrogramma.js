'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */

angular.module("myBiApp")
.directive("dendroGram", function ($window) {
    return {
        restrict: "E",
        template: "<div id='d3d'><button class='btn btn-info' id='expand'>Expand All</button><button class='btn btn-info' id='collapse'>Collapse All</button><svg width='960' height='2000'></svg></div>",
        link: function(scope, elem, attrs){
            //https://bipduruat01.corp.emc.com/BITool/home/getD3DendrogramForMetadata?sourceReportId=Aa.49YHKKkNBuh0kJvrfCbI&sourceSystem=PROPEL%20BOBJ%20PRD
            var data =  scope[attrs.data];
            var url = scope[attrs.url];
            console.log(url);
            var expand = elem.find("#expand");
            var collapse = elem.find("#collapse");
            
            var d3 = $window.d3;
            var rawSvg = elem.find("#d3d svg")[0];
            var margin = {top: 20, right: 120, bottom: 20, left: 250},
                width = 960  - margin.right - margin.left,
                height = 2000 - margin.top - margin.bottom;

            var i = 0,
                duration = 750,
                root;

            var tree = d3.layout.tree()
                .size([height, width]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });
            var svg = d3.select(rawSvg);
            var svg = d3.select("svg")    
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class",  'dendrogram')
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            function generateTree(){
//                d3.json("/scripts/data/data1.json", function(error, json) {
                d3.json(url, function(error, json) {
                    if (error) throw error;
                    root = json;
                    root.x0 = height / 2;
                    root.y0 = 0;

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }
                    
                    root.children.forEach(collapse);
                    update(root);
                });
            }
            
            generateTree();
            
            d3.select(self.frameElement).style("height", "800px");

//            function update(source) {
//                // Compute the new tree layout.
//                var nodes = tree.nodes(root).reverse(),
//                    links = tree.links(nodes);
//
//                // Normalize for fixed-depth.
//                nodes.forEach(function(d) { d.y = d.depth * 180; });
//
//                // Update the nodes…
//                var node = svg.selectAll("g.node")
//                    .data(nodes, function(d) { return d.id || (d.id = ++i); });
//
//                // Enter any new nodes at the parent's previous position.
//                var nodeEnter = node.enter().append("g")
//                    .attr("class", "node")
//                    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
//                    .on("click", click);
//
//                nodeEnter.append("circle")
//                    .attr("r", 1e-6)
//                    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
//
//                nodeEnter.append("text")
//                    .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
//                    .attr("dy", ".35em")
//                    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
//                    .text(function(d) { return d.name; })
//                    .style("fill-opacity", 1e-6);
//
//                // Transition nodes to their new position.
//                var nodeUpdate = node.transition()
//                    .duration(duration)
//                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
//
//                nodeUpdate.select("circle")
//                    .attr("r", 4.5)
//                    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
//
//                nodeUpdate.select("text")
//                    .style("fill-opacity", 1);
//
//                // Transition exiting nodes to the parent's new position.
//                var nodeExit = node.exit().transition()
//                    .duration(duration)
//                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
//                    .remove();
//
//                nodeExit.select("circle")
//                    .attr("r", 1e-6);
//
//                nodeExit.select("text")
//                    .style("fill-opacity", 1e-6);
//
//                // Update the links…
//                var link = svg.selectAll("path.link")
//                    .data(links, function(d) { return d.target.id; });
//
//                // Enter any new links at the parent's previous position.
//                link.enter().insert("path", "g")
//                    .attr("class", "link")
//                    .attr("d", function(d) {
//                        var o = {x: source.x0, y: source.y0};
//                        return diagonal({source: o, target: o});
//                    });
//
//                // Transition links to their new position.
//                link.transition()
//                    .duration(duration)
//                    .attr("d", diagonal);
//
//                // Transition exiting nodes to the parent's new position.
//                link.exit().transition()
//                    .duration(duration)
//                    .attr("d", function(d) {
//                        var o = {x: source.x, y: source.y};
//                        return diagonal({source: o, target: o});
//                    })
//                    .remove();
//
//                // Stash the old positions for transition.
//                nodes.forEach(function(d) {
//                    d.x0 = d.x;
//                    d.y0 = d.y;
//                });
//            }
            
            function update(source) {
                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });

                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++i); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { 
                        return "translate(" + source.y0 + "," + source.x0 + ")"; 
                    })
                    .on("click", click)
                    // add tool tip for ps -eo pid,ppid,pcpu,size,comm,ruser,s
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div .html(
                            d.class + d.name + "<br/>" + 
                            "Dashboard Name: " + d.COMMAND + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                        .duration(500)
                        .style("opacity", 0);
                    });

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function(d) { 
                        return d._children ? "lightsteelblue" : "#fff"; 
                    });

                nodeEnter.append("text")
                    .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                    .text(function(d) { return d.name; })
                    .style("fill-opacity", 1e-6);

                // add the tool tip
                var div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) { 
                        return "translate(" + d.y + "," + d.x + ")"; 
                    });

                nodeUpdate.select("circle")
                    .attr("r", 6)
                    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = svg.selectAll("path.link")
                    .data(links, function(d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }
            
            function expandCollapse () {
                
            }
            expand.on("click", function() {
                console.log('Exand here');
                toggleAll(root); 
                update(root);
                
            });

            collapse.on("click", function() {
                console.log('collapse here');
                root.children.forEach(collapseAll);
                collapseAll(root);
                update(root);
            });
            
            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
            
            function collapseAll(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapseAll);
                    d.children = null;
                }
            }
            
            function toggleAll(d){   
                var children = (d.children)?d.children:d._children;
                if (d._children) {        
                    d.children = d._children;
                    d._children = null;       
                }
                if(children)
                    children.forEach(toggleAll);
            }
        }
    };
});