
var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .linkDistance(50);

d3.csv("data/esoc-iraq-v3_ethnicity.csv",function(error, links){
    //console.log(links);

    if (error) throw error;

    var nodesByName = {};

    links.forEach(function(link){
        link.district = nodeByName(link.district);
        link.sunni_pop_CIA_1978 = +link.sunni_pop_CIA_1978;
    });
    
    var nodes = d3.values(nodesByName);

    var node = svg.selectAll(".node")
        .data(links)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 4.5)
        .call(force.drag)
        .attr("fill", function(d){
            if (d.sunni_pop_CIA_1978 > 1000)
                return ("blue");
            else
                return ("red");
        });


    force
        .nodes(links)
        .on("tick", tick)
        .start();

    function tick() {

        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});

    }

    function nodeByName(name){
        return nodesByName[name] || (nodesByName[name] = {name: name});
    }

});

