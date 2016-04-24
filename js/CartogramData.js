
// TODO embed it nicely in DOM

// TODO now it automatically updates and shows casualties, but it would be nicer if the user could choose a view
/** What would be ideal is to have three views:
 *     1. original US map
 *     2. cartogram casualties
 *     3. cartogram population
 *  Why add a cartogram population?
 *  I don't think that the cartogram casualties is that shocking as the states (like Texas) are big anyway.
 *  What would be more interesting is to compare cartogram casualties to cartogram population.
 *  But well, we would need to put more work into it :-)
 */

// This code is based on the script in index.html from this repository: https://github.com/shawnbot/topogram

// create group for US states paths
var states = d3.select("#map")
    .append("g")
    .attr("id", "states")
    .selectAll("path");

// set up projection and cartogram
var projection = d3.geo.albersUsa();
var cartogram = d3.cartogram()
    .projection(projection)
    .properties(function(d) {
        // TODO I don't understand why id is added to d.id, but it works :-)
        return stateCasualtiesObject[d.id];
    });

// create variables for geo and casualty data
var topology;
var geometries;
var casualties;
var stateCasualtiesObject = {};

// load data
d3.json("data/us-states.topojson", function(topo) {
    topology = topo;
    geometries = topology.objects.states.geometries;
    d3.csv("data/CasualtiesUSStates.csv", function(data) {
        casualties = data;
        stateCasualtiesObject = d3.nest()
            .key(function(d) { return d.Name; })
            .rollup(function(d) { return d[0]; })
            .map(data);
        init();
    });
});

function init() {

    // add features to cartogram
    var features = cartogram.features(topology, geometries);

    var path = d3.geo.path()
        .projection(projection);

    // create initial map
    states = states.data(features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("id", function(d) {
            return d.properties.Name;
        })
        .attr("fill", "red")
        .attr("d", path);

    // add empty tooltips for casualty numbers
    states.append("title");

    update();
}

function update() {

    // create array and sort casualty numbers
    var value = function(d) {
            return +d.properties["Casualties"];
        };

    // use quartiles (calculated in excel) as thresholds for the color scale
    var color = d3.scale.threshold()
        .domain([25, 62, 88, 500])
        .range(["#fee5d9","#fcae91","#fb6a4a","#cb181d"]);

    // tell the cartogram which values to use
    cartogram.value(function(d) {
        return value(d);
    });

    // generate the new features (pre-projected)
    var features = cartogram(topology, geometries).features;

    // update the features and add text to the tooltips
    states.data(features)
        .select("title")
        .text(function(d) {
            // TODO how do you call them? I don't think soldiers is correct.
            return value(d) + " US soldiers that died came from " + [d.properties.Name];
        });

    // set transition
    // TODO makes little sense with one view
    states.transition()
        .duration(2000)
        .ease("linear")
        .attr("fill", function(d) {
            return color(value(d));
        })
        .attr("d", cartogram.path);

}
