// Get JSON data
treeJSON = d3.json("data.json", function(error, treeData) {

    //可设置接口
    var font_size = 12; //设置字体大小
    var font_family = "微软雅黑"; //设置字体类型
    var maxValueLength = 10; //设置数据最大长度
    var visibleDepth = 2; // 初始化时树展开的最大深度
    var backgroundColor = "white";//图表背景色
    var valueUpColor = "green"; //数值背景颜色
    var valueDownColor = "red"; //数值背景颜色
    var nodeNameColor = "gray"; //节点名称颜色
    var nodeValueFontColor = "#0000"; //节点数值颜色
    var linkColor = "gray"; //连线颜色
    var collapseDotBgColor = "lightsteelblue"; //折叠点背景颜色
    var collapseDotValueColor = "white"; //折叠点 “+” “-” 号颜色


    function parseData(data){

        var result = data.find(function(d){
            return d.parentID = "1";
        });

        data = data.sort(function(a,b){
            return a.parentID.length < b.parentID.length ;
        });

        //add children
        data.forEach(function(d){
            if( (i = data.findIndex(function(dd){return dd.parentID == d.parentID.substring(0, d.parentID.length - 1)})) >= 1 ){
                if(!data[i].children) data[i].children = [];
                data[i].children.push(d);
            }
        });
        result = data[data.length - 1];
        return result;
    }

    var treeData = parseData(treeData);

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    var maxNameLength = 0;

    // Misc. variables
    var i = 0;
    var duration = 500;
    var root;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxNameLength = Math.max(d.name.length, maxNameLength);
        //maxValueLength = Math.max(toString(d.value).length, maxValueLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    maxLabelLength = Math.max(maxNameLength,maxValueLength);

    //visit tree to count parent value

    //function countParentsValue(cur) {
    //
    //    if(cur.children && cur.children.length > 1){
    //        cur.value = 0;
    //        cur.last_year_value = 0;
    //        for(var i = 0; i < cur.children.length; i++){
    //
    //            //count the value and last_year_value of parents
    //            var child = countParentsValue(cur.children[i]);
    //
    //            if(i == 0){
    //                cur.value = child.value;
    //                cur.last_year_value = child.last_year_value;
    //            }
    //            //兄弟关系判定计算父节点的值
    //
    //            else{
    //                if(!child.relation){
    //                    cur.value += child.value;
    //                    cur.last_year_value += child.last_year_value;
    //                }else{
    //                    switch(child.relation) {
    //                        case "+" :
    //                        {
    //                            cur.value += child.value;
    //                            cur.last_year_value += child.last_year_value;
    //                            break;
    //                        }
    //                        case "-" :
    //                        {
    //                            cur.value -= child.value;
    //                            cur.last_year_value -= child.last_year_value;
    //                            break;
    //                        }
    //                        case "*" :
    //                        {
    //                            cur.value *= child.value;
    //                            cur.last_year_value *= child.last_year_value;
    //                            break;
    //                        }
    //                        case "/" :
    //                        {
    //                            cur.value = cur.value / child.value;
    //                            cur.last_year_value = cur.last_year_value / child.last_year_value;
    //                            break;
    //                        }
    //                        default :
    //                        {
    //                            cur.value += child.value;
    //                            cur.last_year_value += child.last_year_value;
    //                        }
    //                    }
    //                }
    //
    //            }
    //            //cur.value = child.relation && (child.relation == "-") ?  cur.value - child.value : cur.value + child.value;
    //
    //            //cur.last_year_value = child.relation && (child.relation == "-") ?  cur.last_year_value - child.last_year_value : cur.last_year_value + child.last_year_value;
    //        }
    //        return cur;
    //    }else{
    //        return cur;
    //    }
    //}

    //treeData = countParentsValue(treeData);

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.2, 4]).on("zoom", zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .style("background-color",backgroundColor)
        .call(zoomListener);

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 3;
        y = y * scale + viewerHeight / 3;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d, d.depth + 2);
        centerNode(d);
    }

    function update(source,visibleDepth) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n, visibleDepth) {

            if(level < visibleDepth - 1){
                if(n.children && n.children.length > 0){
                    if(levelWidth.length <= level + 1) levelWidth.push(1);
                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d, visibleDepth);
                    })
                }
            }
        };
        childCount(0, root, visibleDepth);
        var newHeight = d3.max(levelWidth) * font_size * 8; // font-size * 10 pixels per line
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var node = tree.nodes(root).reverse();
        //var nodesForLinks = nodes.filter(function(d){
        //    return d.depth < visibleDepth ? true : false;
        //});
        var nodes = [];

        function collapse(d,visibleDepth){
            if(d.depth >= visibleDepth - 1){
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }
            return d;
        }

        node.forEach(function(d) {
            d = collapse(d,visibleDepth);
            nodes.push(d);
        });

        nodes = nodes.filter(function(d){
           return d.depth < visibleDepth;
        });

        var links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * font_size) *1.2); //maxLabelLength * font_size  px 字体为font_sizepx
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the links…

        //自定义折线对角线 polylineDiagonal 扩展 D3 的功能

        function d3_target(d) {
            return d.target;
        }
        function d3_source(d) {
            return d.source;
        }

        d3.svg.polylineDiagonal = function() {
            var source = d3_source,
                target = d3_target,
                projection = d3_svg_diagonalProjection;

            function polylineDiagonal(d, i) {
                var s = source.call(this, d, i),
                    t = target.call(this, d, i);
                //m = (p0.y + p3.y) / 2,
                //p = [p0, {x: p0.x, y: m}, {x: p3.x, y: m}, p3];

                var cy = t.y;
                    i = 2;
                while(i--){
                    cy = (s.y + cy) / 2
                }

                var points = [{
                    x: s.x, y: s.y
                },{
                    x: s.x, y: cy
                },{
                    x: t.x, y: cy
                },{
                    x: t.x , y: t.y
                }];

                var line = d3.svg.line()
                    .x(function(d) { return d.y;})
                    .y(function(d) { return d.x;});
                //p = p.map(projection);
                return line(points);
            }

            polylineDiagonal.source = function(x) {
                if (!arguments.length) return source;
                source = d3_functor(x);
                return polylineDiagonal;
            };

            polylineDiagonal.target = function(x) {
                if (!arguments.length) return target;
                target = d3_functor(x);
                return polylineDiagonal;
            };

            polylineDiagonal.projection = function(x) {
                if (!arguments.length) return projection;
                projection = x;
                return polylineDiagonal;
            };

            return polylineDiagonal;
        };

        function d3_svg_diagonalProjection(d) {
            return [d.x, d.y];
        }

        // define a d3 diagonal projection for use by the node paths later on.
        var polylineDiagonal = d3.svg.polylineDiagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .style("stroke",linkColor)
            .attr("d", function(d) {
                var s = {
                    x: source.x0,
                    y: source.y0
                };
                var t = {
                    x: source.x0,
                    y: source.y0
                };
                return polylineDiagonal({
                    source: s,
                    target: t
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", polylineDiagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return polylineDiagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter();

        var nodeGroup = nodeEnter.append("g")
            .attr("class", "node")
            .style("font-size",font_size)
            .style("font-family",font_family)
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .attr("opacity", 1);
            //.on('click', click);

        //用一个矩形作为背景 background
        var content_x = -(font_size + maxValueLength * font_size * 0.67)

        nodeGroup.append("rect")
            .attr("x", function(d) {
                return  -(font_size + maxValueLength * font_size * 0.67);
            })
            .attr("y", -font_size * 2)
            .attr("width", maxValueLength * font_size * 0.67 + font_size)
            .attr("height", font_size * 2.5 )
            .attr("fill", backgroundColor)
            .attr("opacity", 1);

        //添加 折叠点 折叠为 + 展开为 -

        nodeGroup.append("rect")
            .attr("x", function(d) {
                return  0;
            })
            .attr("y", -font_size * 0.6)
            .attr("rx", font_size * 0.5)
            .attr("ry",font_size * 0.5)
            .attr("width", font_size * 1.5)
            .attr("height", font_size *1.2 )
            .attr("fill",collapseDotBgColor)
            //.attr("opacity", 0.5)
            .style("display",function(d){
                return d._children || d.children ? "block" : "none";
            });

        nodeGroup.append("text")
            .attr("x",font_size * 0.3)
            .attr("y",font_size * 0.4)
            .style("font-size",font_size * 1.5)
            .attr("fill",collapseDotValueColor)
            .style("display",function(d){
                return d._children || d.children ? "block" : "none";
            })
            .attr("class", "collapseDot")
            .on("click.collapse",click)
            .on("click.toggleBinaryRelation",function(d){
                d3.select(this.parentNode).select("text.binaryRelation").style("display", function(d) {
                    return d._children ? "none" : "block";
                    //return "none";
                });
                d3.select(this).text(function(d){
                    return d._children? "+" : "-";
                });
            })
            .text(function(d){
                return d.children ? "-" : "+";
            });

        //添加数值背景颜色
        nodeGroup.append("rect")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", -0.5 * font_size)
            .attr("width", maxValueLength * font_size * 0.67)
            .attr("height", font_size )
            .attr("fill", function(d) {
                return d.year_on_year_fluctuation >= 0 ? valueUpColor : valueDownColor;
            })
            .attr("opacity", 0.5);

        //节点数据
        nodeGroup.append("text")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("dy", ".35em")
            .style("font-size",font_size)
            .attr("fill",nodeValueFontColor)
            .attr('class', 'value')
            .text(function(d) {
                return d.value;
            });
            //.style("fill-opacity", 0);

        //节点名称
        nodeGroup.append("text")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return - (font_size * 1.5);
            })
            .attr("dy", ".35em")
            .attr("class", 'name')
            .attr("fill", nodeNameColor)
            .style("font-size",font_size)
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 1);

        //标注与兄弟节点加减乘除关系

        //非二元关系标签显示
        nodeGroup.append("text")
            .attr("x", function(d) {
                return  -font_size * maxLabelLength * 0.85;
            })
            .attr("y", function(d) {
                return -font_size;
            })
            .attr("class","relation")
            .attr("dy", ".35em")
            .attr("fill", "gray")
            .text(function(d) {
                //return d.relation == "-" ? "-" : d.depth == 0 ? null : "+";
                return d.depth == 0 || d.parent && (d.parent.children && d.parent.children[0] == d  || d.parent._children && d.parent._children[0] == d ) ? null : d.relation == "-" ? "-" : d.relation == "*" ? "×" : d.relation == "/" ? "÷" : "+";
            })
            .style("fill-opacity", 1)
            .style("font-size" , 1.2 * font_size)
            .style("display",function(d){
                if(d.parent && (d.parent.children && d.parent.children.length == 2 || d.parent._children && d.parent._children.length == 2)){
                    return "none";
                }
                else return "block";
            });

        //二元关系标签显示
        nodeGroup.append("text")
            .attr("x",font_size * maxLabelLength / 4 + font_size)
            .attr("class","binaryRelation")
            .attr("dy", ".35em")
            .attr("fill", "gray")
            .text(function(d) {
                if(d.children && d.children.length == 2){
                    return  !d.children[1].relation ? "+" : d.children[1].relation == "*" ?  "×" : d.children[1].relation == "/" ? "÷" : d.children[1].relation;
                }else{
                    if(d._children && d._children.length == 2){
                        return  !d._children[1].relation ? "+" : d._children[1].relation == "*" ?  "×" : d._children[1].relation == "/" ? "÷" : d._children[1].relation;
                    }else{
                        return "";
                    }
                }
            })
            .style("display",function(d){
                return d._children ? "none" : "block";
            })
            .style("fill-opacity", 1)
            .style("font-size" , 1.5 * font_size);


        //添加去年同比变动数据
        var nodeRate = nodeGroup.append("g");

        nodeRate.append("text")
            .attr("x",-font_size * 4)
            .attr("y",font_size * 1.5 )
            .style("font-size",font_size * 0.7)
            .text("同比");

        nodeRate.append("text")
            .attr("x",-font_size * 4)
            .attr("y",font_size * 2.2 )
            .style("font-size",font_size * 0.7)
            .text("变动");



        nodeRate.append("rect")
            .attr("x",-font_size * 2.2)
            .attr("y",font_size *0.9)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width",font_size * 4)
            .attr("height",font_size * 1.4)
            .attr("stroke","gray")
            .attr("fill","white");

        //同比变动数值
        nodeRate.append("text")
            .attr("x",-font_size * 1.4)
            .attr("y",font_size * 1.9 )
            .style("font-size",font_size * 0.7)
            .attr("fill","blue")
            .text(function(d){
                return d.year_on_year_fluctuation;
            });

        //x , y 是相对位置 ,画同比指示箭头
        nodeRate.append("polygon")
            .attr("fill", function(d){
                return d.year_on_year_fluctuation ? valueUpColor : valueDownColor;
            })
            .attr("opacity",0.5)
            .attr("points",function(d){

                var o = {
                    x: -font_size * 1.8,
                    y: font_size *1.2
                };

               var up = [{
                   x: o.x,
                   y: o.y
               },{
                   x: o.x - font_size * 0.3,
                   y: o.y + font_size * 0.3
               },{
                   x: o.x - font_size * 0.1,
                   y: o.y + font_size * 0.3
               },{
                   x: o.x - font_size * 0.1,
                   y: o.y + font_size * 1
               },{
                   x: o.x - font_size * 0.1,
                   y: o.y + font_size * 1
               },{
                   x: o.x + font_size * 0.1,
                   y: o.y + font_size * 1
               },{
                   x: o.x + font_size * 0.1,
                   y: o.y + font_size * 0.3
               },{
                   x: o.x + font_size * 0.3,
                   y: o.y + font_size * 0.3
               }];

               var down = [{
                   x: o.x,
                   y: o.y
               },{
                   x: o.x - font_size * 0.1,
                   y: o.y
               },{
                   x: o.x - font_size * 0.1,
                   y: o.y + font_size * 0.7
               },{
                   x: o.x - font_size * 0.3,
                   y: o.y + font_size * 0.7
               },{
                   x: o.x,
                   y: o.y + font_size * 1
               },{
                   x: o.x + font_size * 0.3,
                   y: o.y + font_size * 0.7
               },{
                   x: o.x + font_size * 0.1,
                   y: o.y + font_size * 0.7
               },{
                   x: o.x + font_size * 0.1,
                   y: o.y
               }];

                var out = "";

                if(d.year_on_year_fluctuation > 0){
                    up.forEach(function(d){
                        out += " " + d.x + "," + d.y + " ";
                    });
                }else{
                    down.forEach(function(d){
                        out += " " + d.x + "," + d.y + " ";
                    });
                }
                return out;
            });



        //标注详细描述
        var nodeDetail = nodeGroup.append("g")
            .attr("class","node-detail")
            .attr("opacity",0)
            .style("display","none");

        var nodeDetailWrap = nodeDetail.append("rect")
            .attr("x",function(d) {
                return -(font_size * 0.67 *1.5 + maxValueLength * font_size * 0.67);
            })
            .attr("y",function(d) {
                return  font_size;
            })
            .attr("width", font_size * 12)
            .attr("height", font_size * 5)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "white")
            .attr("stroke", "gray");

        var detailText = nodeDetail.append("text")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return 1.2 * font_size;
            });

        detailText.append("tspan")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return 2.2 * font_size;
            })
            .text(function(d) {
                return "名称：" + d.name ? d.name : "";
            });

        detailText.append("tspan")
            .attr("x", function(d) {
                return -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return 3.2 * font_size + 2;
            })
            .text(function(d) {
                return "今年数据：" + d.value ? d.value : "";
            });

        detailText.append("tspan")
            .attr("x", function(d) {
                return  -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return 4.2 * font_size + 2;
            })
            .text(function(d) {
                return "同比变动：" + d.year_on_year_fluctuation ? d.year_on_year_fluctuation : "";
            });

        detailText.append("tspan")
            .attr("x", function(d) {
                return -(font_size * 0.67 + maxValueLength * font_size * 0.67);
            })
            .attr("y", function(d) {
                return 5.2 * font_size + 2;
            })
            .text(function(d) {
                return "备注：" + d.beizhu ? d.beizhu : "";
            });

        //鼠标移动过节点名称将显示节点详细信息
        var node_name = d3.selectAll("text.value")
            .on("mouseover",function(){
                d3.select(this.parentNode).select("g.node-detail").attr("opacity", 1).style("display","block");
            })
            .on("mouseleave",function(){
                d3.select(this.parentNode).select("g.node-detail").attr("opacity", 0).style("display","none");
            });

        // Change the circle fill depending on whether it has children and is collapsed

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);


        //
        // Stash the old positions for transition.

        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

    }

    function setVisibleTreeByDepth(depth) {

        //d3.selectAll("g.node").select("text.collapseDot")
        //    .select(function(d){
        //        return d.depth == depth - 1 ? this : null;
        //    })
        //    .call(click);

    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root,visibleDepth);
    centerNode(root);

});