
var width = 500,
    height = 500;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .size([width,height])
    .linkDistance(50);

d3.csv("data/esoc-iraq-v3_ibc.csv",function(error, links){
    console.log(links);
    if (error) throw error;

    var nodesByName = {};

    links.forEach(function(link){
        link.source = nodeByName(link.source);
        link.target = nodeByName(link.target);
    });

    var nodes = d3.values(nodesByName);

    var link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class","link");

    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 4.5)
        .call(force.drag);

    force
        .nodes(nodes)
        .links(links)
        .on("tick", tick)
        .start();

    function tick() {
        link.attr("x1", function(d) {return d.source.x})
        .attr("y1", function(d){return d.source.y})
        .attr("x2", function(d){return d.target.x})
        .attr("y2", function(d){return d.target.y});

        node.attr("cx", function(d){return d.x})
            .attr("cy", function(d){return d.y});

    }

    function nodeByName(name){
        return nodesByName[name] || (nodesByName[name] = {name: name});
    }
});

