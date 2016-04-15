
var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .linkDistance(50);

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

    node
        .enter().append("circle").attr("class", "node")
        .call(force.drag);

    node
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.sunni_pop_CIA_2003/1000;
        });

    node
        .enter().append("circle").attr("class", "node")
        .call(force.drag);

    node
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.kurd_pop_CIA_2003/1000;
        });

    node
        .enter().append("circle").attr("class", "node")
        .call(force.drag);
    node
        .filter(function(d){
            return d.district == district;
        })
        .attr("r",function(d){
            return d.shia_pop_CIA_2003/1000;
        });

    node.exit().remove();

    force
        .nodes(data)
        .on("tick", tick)
        .start();

    function tick() {
        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});
    }
}

