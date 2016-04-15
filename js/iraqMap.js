
/*
 * IraqMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

IraqMap = function(_parentElement, _districtData, _exteriorBorder, _placeData){
    this.parentElement = _parentElement;

    this.districtData = _districtData;
    this.placeData = _placeData;
    this.exteriorBorder = _exteriorBorder;

    // No data wrangling, no update sequence
    this.displayData = [];

    this.initVis();
};

IraqMap.prototype.initVis = function() {

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
        .center([43.68, 33.22])
        .scale(4400);

    var path = d3.geo.path()
        .projection(projection);

    // Render the Iraq map (no need to update borders so include here and not update vis)
    vis.svg.append("path")
        .datum(vis.exteriorBorder)
        .attr("d", path)
        .attr("class", "map exterior-borders");

    vis.svg.selectAll(".district-borders")
        .data(vis.districtData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map district-borders")
        .style({
            "stroke": "black",
            "stroke-width": "0.5"
        });

    vis.svg.selectAll(".city")
        .data(vis.placeData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
        .attr("class", "map city point")
        .attr("r", "3px");

    vis.svg.selectAll(".city-label")
        .data(vis.placeData)
        .enter()
        .append("text")
        .text(function(d) { return d.properties.name; })
        .attr("x", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("y", function (d) {
            const verticalOffset = 7;
            return projection(d.geometry.coordinates)[1] - verticalOffset;
        })
        .attr("class", "city-label");

    // Update the visualization
    vis.updateVis();

};

IraqMap.prototype.updateVis = function(){

    var vis = this;

    /** Create a quantize scale that sorts the data values into color buckets: */

    var colorScale = d3.scale.quantize()
        .range(colorbrewer.Greens[6]);

    /** Load CSV (data for the areas): */

    d3.csv("Data/Ethnicity-Data.csv", function(data) {

        /** Define the domain for the quantize scale: */

        colorScale.domain([
            d3.min(data, function(d) { return d.shia_pop_CIA_2003; }),
            d3.max(data, function(d) { return d.shia_pop_CIA_2003; })
        ]);

        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < vis.districtData.length; j++) {
                if (data[i].district == vis.districtData[j].properties.ADM3NAME) {
                    vis.districtData[j].properties.ShiaPop = data[i].shia_pop_CIA_2003;
                    // "break" terminates the loop once the matching states have been found
                    break;
                }
            }
        }

        vis.svg.selectAll(".district-borders")
            .style("fill", function(d) {
                var value = d.properties.ShiaPop;
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });
    })};
