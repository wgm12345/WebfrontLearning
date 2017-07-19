/**
 * Created by wgm on 17/7/5.
 */

//p include data and dom
var p = d3.select("body")
    .selectAll("p")
    .data([4, 8, 15, 16, 23, 42])
    //.enter().append("p")
    .text(function(d) { return "I’m number " + d + "!"; });

//enter() means data exclude exist dom
p.enter().append("p")
    .text(function(d) { return d; });

//exit() means dom without binding data
p.exit().remove();


//transition
d3.selectAll(".change").transition()
    .duration(750)
    .style("background-color", "black");
