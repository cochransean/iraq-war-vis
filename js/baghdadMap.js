
/*
 * BaghdadMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

BaghdadMap = function(_parentElement, _data){
    this.parentElement = _parentElement;

    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = [];

    this.initVis();
};

BaghdadMap.prototype.initVis = function() {

    // set this so it remains consistent
    var vis = this;

    vis.margin = {top: 20, right: 20, bottom: 20, left: 20};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 800 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // setup project and path generator
    var projection = d3.geo.mercator()
        .translate([vis.width / 2, vis.height / 2])
        .center([44.36, 33.32])
        .scale(20000);

    var path = d3.geo.path()
        .projection(projection);

    // Render the Iraq map (no need to update borders so include here and not update vis)
    vis.svg.selectAll("path")
        .data(vis.data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map")
        .attr("fill", "white")
        .attr("stroke", "black");
};