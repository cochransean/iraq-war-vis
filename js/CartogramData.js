// This code is based on the script in index.html from this repository: https://github.com/shawnbot/topogram

// create group for US states paths
var states = d3.select("#us-map")
    .append("g")
    .attr("id", "states")
    .selectAll("path");

var statesJquery = $("#us-map");

// set up projection and cartogram
var mapDivWidth = statesJquery.width();
var projection = d3.geo.albersUsa()
    .scale(1.22887865 * mapDivWidth)
    .translate([mapDivWidth / 2.2, statesJquery.height() / 2]);
var cartogram = d3.cartogram()
    .projection(projection)
    .properties(function(d) {
        return stateCasualtiesObject[d.id];
    });

// create variables for geo and casualty data
var topology;
var geometries;
var casualties;
var populations = {};
var stateCasualtiesObject = {};
const NORMING_UNIT = 100000;

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

// load population by state
d3.csv("data/2010-census-population.csv", function(data) {
    data.forEach(function(state) {
        populations[state.NAME] = +state.POPESTIMATE2010;
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

    // update on DOM changes
    $("#cartogram-data").change(update);
}

function update() {

        // get selected option
        var selectedOption = $("#cartogram-data").val();

        // TODO: we should create the color scales on the init and just update domain / range as required, not
        // every time the visualization is updated
        if (selectedOption == 'normedCasualties') {

            // create array and sort casualty numbers
            var value = function(d) {
                var normingUnitsPerState = populations[d.id] / NORMING_UNIT;
                return +d.properties["Casualties"] / normingUnitsPerState;
            };

            var color = d3.scale.quantize()
                .range(colorbrewer.Reds[6]);
        }


        // TODO: update this with an else if, if we add more than 2 options
        else {

            // create array and sort casualty numbers
            var value = function(d) {
                return +d.properties["Casualties"];
            };

            // use quartiles (calculated in excel) as thresholds for the color scale
            var color = d3.scale.threshold()
                .domain([25, 62, 88, 500])
                .range(["#fee5d9","#fcae91","#fb6a4a","#cb181d"]);

        }


    // tell the cartogram which values to use
    cartogram.value(function(d) {
        return value(d);
    });

    // generate the new features (pre-projected)
    var features = cartogram(topology, geometries).features;

    // update color scale of normed values since we have not precalculated values as yet
    // TODO maybe precalculate thresholds for the scale as in the raw data example; could also do this more efficiently
    // (we calculate using the value() function repeatedly when we could just get the values for all our options
    // when the data is first loaded and store if for future use
    if (selectedOption == 'normedCasualties') {
        color
            .domain(d3.extent(features, function(d) {
                return value(d)
            }));
    }

    // update the features and add text to the tooltips
    states.data(features)
        .select("title")
        .text(function(d) {
            if (selectedOption == 'normedCasualties') {
                return value(d) + " US service members died per 100,000 residents in " + [d.properties.Name];
            }

            // TODO update this if we add more options (to else if)
            else {
                return value(d) + " US service members that died came from " + [d.properties.Name];
            }
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
