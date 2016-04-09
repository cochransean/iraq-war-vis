
var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .linkDistance(50);

var data;

d3.csv("data/esoc-iraq-v3_sigact-district-year.csv",function(error, links){

    if (error) throw error;

    links.filter(function(link){
        link.suicide = +link.suicide;
        link.year = +link.year;
    });

    console.log(links);

    data = links;

    updateVisualization();
    $('#button').click();

});

function updateVisualization(){

    var ranking = d3.select("#button").property("value");

    var node = svg.selectAll(".node")
        .data(data)
        .enter().append("circle")
        .filter(function(d){
            return d.year == ranking;
        })
        .attr("class", "node")
        .attr("r", 5)
        .attr("r",function(d){
            return d.suicide;
        })
        .call(force.drag);

    force
        .nodes(data)
        .on("tick", tick)
        .start();


    function tick() {
        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});
    }
}

