
/*
 * BaghdadMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

BaghdadMap = function(_parentElement, _districtData, _waterData, _roadData, _pointData){
    this.parentElement = _parentElement;

    this.districtData = _districtData;
    this.waterData = _waterData;
    this.roadData = _roadData;
    this.pointData = _pointData;

    // No data wrangling, no update sequence
    this.displayData = [];

    this.initVis();
};

BaghdadMap.prototype.initVis = function() {

    // set this so it remains consistent
    var vis = this;

    // filter out non-Baghdad districs
    this.districtData = this.districtData.filter(function(value) {
        if (value.properties.ADM2NAME === "Baghdad") { return true }
    });

    // filter out unimportant roads
    // TODO want to do this on the data itself so we aren't doing this client side each time
    this.roadData = this.roadData.filter(function(value) {
       if (value.properties.type === "primary") { return true }
    });

    // filter out canals
    // TODO do this in on the data itself so we aren't doing client side each time
    this.waterData = this.waterData.filter(function(value) {
        if (value.properties.type === "river") { return true }
    });

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
        .scale(38000);

    var path = d3.geo.path()
        .projection(projection);

    // Render the Iraq map (no need to update borders so include here and do not update vis)
    // start with geographic features (borders need to go over top)
    vis.svg.selectAll(".waterway")
        .data(vis.waterData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map waterway");

    vis.svg.selectAll(".point")
        .data(vis.pointData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
        .attr("r", "3px")
        .attr("class", "map point");

    vis.svg.selectAll(".roads")
        .data(vis.roadData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map road");

    vis.svg.selectAll(".district-borders")
        .data(vis.districtData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map district-borders");

};