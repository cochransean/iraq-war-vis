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

    var node = svg.selectAll(".node")
        .data(data);

    var node1 = svg.selectAll(".node1")
        .data(data);

    var node2 = svg.selectAll('.node2')
        .data(data);

    var node3 = svg.selectAll('.node3')
        .data(data);

    node
        .enter()
        .append("circle").attr("class", "node")
        .call(force.drag);

    node
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.sunni_pop_CIA_2003/1000;
        });

    node.exit().remove();

    node1
        .enter()
        .append("circle").attr("class", "node1")
        .call(force.drag);

    node1
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.shia_pop_CIA_2003/1000;
        });

    node1.exit().remove();

    node2
        .enter()
        .append("circle").attr("class", "node2")
        .call(force.drag);

    node2
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd_pop_CIA_2003/1000;
        });

    node2.exit().remove();

    node3
        .enter()
        .append("circle").attr("class", "node2")
        .attr("fill", "red")
        .call(force.drag);

    node3
        .filter(function(d){
            return d.district == district;
        })
        .attr('opacity',0.5)
        .attr("r",function(d){
            return d.total_pop_CIA_2003/750;
        });

    node3.exit().remove();

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
    }
}