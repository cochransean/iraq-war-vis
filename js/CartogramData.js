
var field = {name: "Population Estimate", id: "popest", key: "Casualties"};
var colors = colorbrewer.RdYlBu[5];

var body = d3.select("body");
var stat = d3.select("#status");

var map = d3.select("#map");
var zoom = d3.behavior.zoom()
    .translate([-38, 32])
    .scale(.94)
    .scaleExtent([0.5, 10.0])
    .on("zoom", updateZoom);
var layer = map.append("g")
    .attr("id", "layer");
var states = layer.append("g")
    .attr("id", "states")
    .selectAll("path");

// map.call(zoom);
updateZoom();

function updateZoom() {
    var scale = zoom.scale();
    layer.attr("transform",
        "translate(" + zoom.translate() + ") " +
        "scale(" + [scale, scale] + ")");
}

var proj = d3.geo.albersUsa();
var topology;
var geometries;
var rawData;
var dataById = {};
var carto = d3.cartogram()
    .projection(proj)
    .properties(function(d) {
        return dataById[d.id];
    })
    .value(function(d) {
        return +d.properties[field];
    });

window.onhashchange = function() {
    parseHash();
};

d3.json("data/us-states.topojson", function(topo) {
    topology = topo;
    geometries = topology.objects.states.geometries;
    d3.csv("data/CasualtiesUSStates.csv", function(data) {
        rawData = data;
        dataById = d3.nest()
            .key(function(d) { return d.Name; })
            .rollup(function(d) { return d[0]; })
            .map(data);
        init();
    });
});

function init() {
    var features = carto.features(topology, geometries),
        path = d3.geo.path()
            .projection(proj);

    states = states.data(features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("id", function(d) {
            return d.properties.Name;
        })
        .attr("fill", "#fafafa")
        .attr("d", path);

    states.append("title");

    parseHash();
}

function update() {
    var start = Date.now();
    body.classed("updating", true);

    var key = field.key,
        fmt = (typeof field.format === "function")
            ? field.format
            : d3.format(field.format || ","),
        value = function(d) {
            return +d.properties[key];
        },
        values = states.data()
            .map(value)
            .filter(function(n) {
                return !isNaN(n);
            })
            .sort(d3.ascending),
        lo = values[0],
        hi = values[values.length - 1];

    var color = d3.scale.linear()
        .range(colors)
        .domain(lo < 0
            ? [lo, 0, hi]
            : [lo, d3.mean(values), hi]);

    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);

    // tell the cartogram to use the scaled values
    carto.value(function(d) {
        return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = carto(topology, geometries).features;

    // update the data
    states.data(features)
        .select("title")
        .text(function(d) {
            return [d.properties.Name, fmt(value(d))].join(": ");
        });

    states.transition()
        .duration(750)
        .ease("linear")
        .attr("fill", function(d) {
            return color(value(d));
        })
        .attr("d", carto.path);

    var delta = (Date.now() - start) / 1000;
    stat.text(["calculated in", delta.toFixed(1), "seconds"].join(" "));
    body.classed("updating", false);
}

var deferredUpdate = (function() {
    var timeout;
    return function() {
        var args = arguments;
        clearTimeout(timeout);
        stat.text("calculating...");
        return timeout = setTimeout(function() {
            update.apply(null, arguments);
        }, 10);
    };
})();

var hashish = d3.selectAll("a.hashish")
    .datum(function() {
        return this.href;
    });

function parseHash() {

    deferredUpdate();
    location.replace("#" + field.id);

    hashish.attr("href", function(href) {
        return href + location.hash;
    });
}