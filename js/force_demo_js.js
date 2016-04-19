var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .gravity(0.1);

var data;

d3.csv("data/esoc-iraq-v3_ethnicity.csv",function(error, links){

    if (error) throw error;

    links.filter(function(link){
        link.sunni_pop_CIA_2003 = +link.sunni_pop_CIA_2003;
        link.kurd_pop_CIA_2003 = +link.kurd_pop_CIA_2003;
        link.shia_pop_CIA_2003 = +link.shia_pop_CIA_2003;
        link.total_pop_CIA_2003 = +link.total_pop_CIA_2003;
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
            return d.sunni_pop_CIA_2003/1000;
        });

    var node1 = gnodes.append("circle").attr("class", "node1")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
                return d.shia_pop_CIA_2003/500;
        });

    var node2 = gnodes.append("circle").attr("class", "node2")
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd_pop_CIA_2003/1000;
        });

    var node3 = gnodes.append("circle").attr("class", "node3")
        .attr("fill", "red")
        .filter(function(d){
            return d.district == district;
        })
        .attr('opacity',0.5)
        .attr("r",function(d) {
                return (d.total_pop_CIA_2003/500);
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
            .attr("cy", function(d){return d.y});
        node1.attr("cx", function(d){return d.x+125})
            .attr("cy", function(d){return d.y+50});
        node2.attr("cx", function(d){return d.x+100})
            .attr("cy", function(d){return d.y-75});
        node3.attr("cx", function(d){return d.x+50})
            .attr("cy", function(d){return d.y-30});
        //label.attr("x", function(d){return d.x})
        //    .attr("y", function(d){return d.y})

    }
}