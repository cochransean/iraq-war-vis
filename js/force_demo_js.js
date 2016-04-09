
var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .linkDistance(50);

d3.csv("data/esoc-iraq-v3_sigact-district-year.csv",function(error, links){

    if (error) throw error;

    links.forEach(function(link){
        link.suicide = +link.suicide;
        link.year = +link.year;
    });

    links.filter(function(link){
        return link.year == 2004;
    });
    console.log(links);

    var node = svg.selectAll(".node")
        .data(links)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .attr("r", function(d){
            return d.suicide
        })
        .call(force.drag);

    force
        .nodes(links)
        .on("tick", tick)
        .start();

    function tick() {
        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});
    }

});
