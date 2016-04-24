var width = 500,
    height = 500;

var svg = d3.select("#force-layout").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .gravity(0.1);

var data;

d3.csv("data/ethnicity_cleaned.csv",function(error, links){

    if (error) throw error;

    links.filter(function(link){
        link.sunni = +link.sunni;
        link.kurd = +link.kurd;
        link.shia = +link.shia;
        link.total = +link.total;
    });

    console.log(links);

    data = links;

    updateVisualization();
    $('#button').click();

});

function updateVisualization(){

    var district = d3.select("#button").property("value");

    var gnodes = svg.selectAll('gnode')
        .data(data)
        .enter()
        .append('g')
        .classed('gnode', true)
        .call(force.drag);

    var node = gnodes.append("circle").attr("class", "node")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.sunni;
        })
        .attr("fill","green");

    var node1 = gnodes.append("circle").attr("class", "node1")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.shia;
        })
        .attr("fill","blue");

    var node2 = gnodes.append("circle").attr("class", "node2")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd;
        })
        .attr("fill","red");

    var node3 = gnodes.append("circle").attr("class", "node3")
        .filter(function(d){
            return d.district == district;
        })
        .attr('opacity',0.5)
        .attr("r",function(d) {
            return (d.total);
        });

    // ASK //
    //node3.exit().remove();
    // ASK //
    node.transition()
        .duration(10000);
    node1.transition()
        .duration(10000);
    node2.transition()
        .duration(10000);
    node3.transition()
        .duration(10000);
    // ASK //
    var label = gnodes.append("text")
        .text("text");

    force
        .nodes(data)
        .on('tick', tick)
        .start();

    function tick() {
        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y+30});
        node1.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y+50});
        node2.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y+75});
        node3.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});
        //label.attr("x", function(d){return d.x})
        //  .attr("y", function(d){return d.y})

    }
}