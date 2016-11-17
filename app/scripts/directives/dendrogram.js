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
        templateUrl: 'views/dendroGram.html',
        link: function(scope, elem, attrs){
            var data =  scope[attrs.data];
            var url = scope[attrs.url];
            var toggle = elem.find("#toggle");    
            var d3 = $window.d3;
            var rawSvg = elem.find("#d3d svg")[0];
            var initWidth = (scope.isTableu) ? 1250: 960; 
            //http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
            //https://chartio.com/resources/tutorials/how-to-resize-an-svg-when-the-window-is-resized-in-d3-js
            var margin = {top: 20, right: 120, bottom: 20, left: 190},
                width = initWidth  - margin.right - margin.left,
                height = 800 - margin.top - margin.bottom;
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
//                d3.json("/scripts/data/data.json", function(error, json) {
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
            
            function update(source) {
                // Compute the new tree layout. -- Sent by Viswa
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);
            
                // add the tool tip
                var div = d3.select("body").append("div")
                    .attr("class", "tooltip tooltip-box");

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
                        div.html('<b>'+d.className+'</b>'+ ' <hr class="border-line" /> ' +d.name)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 30) + "px");
//                            .style("left", (d3.event.pageX) + "px")
//                            .style("top", (d3.event.pageY - 70) + "px");  
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
                    
                var status = 'start';
                
                nodeEnter.append("text")
                    .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) {
                        status = d.children || d._children ? "end" : "start"; 
                        return d.children || d._children ? "end" : "start"; 
                    })
                    .text(function(d) { return d.name; })
                    .call(wrap, 25, status)
                    .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) { 
                        return "translate(" + d.y + "," + d.x + ")"; 
                    });

                nodeUpdate.select("circle")
                    .attr("r", 7)
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
            
            function wrap(text, width, status) {
                text.each(function() {
                    var nodeText = d3.select(this).text(),
                        nodeTextlength = nodeText.length,
                        nWords = (nodeTextlength > width) ? nodeText.substring(0,width-1)+'...' :nodeText,
                        text = d3.select(this),
                        x = text.attr("x"),
                        y = text.attr("y"),
                        dy = (status ===  'start') ? parseFloat(text.attr("dy")) : "-.35em",
//                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy",dy);
                        tspan.text(nWords);
                });
            }
            
            toggle.on("click", function() {
                var toggleText = toggle.text();
                if(toggleText === "Expand All") {
                    toggle.text('Collapse All');
                    toggleAll(root); 
                    update(root);
                } else {
                    toggle.text('Expand All');
                    root.children.forEach(collapseAll);
                    collapseAll(root);
                    update(root);
                }
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