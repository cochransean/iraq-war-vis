
/*
 * IraqMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

IraqMap = function(_parentElement, _districtData, _exteriorBorder, _placeData, _districtViolenceData){
    this.parentElement = _parentElement;

    this.districtData = _districtData;
    this.placeData = _placeData;
    this.exteriorBorder = _exteriorBorder;
    this.districtViolenceData = _districtViolenceData;
    this.districtCentroids = {};

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

    /** Here, I added the centroid of the SVG district paths to the Violence Data. It works,
     * but the code is totally killing loading times.
     * The idea behind this was to use the centroid for each district to move to circles to the right place.
     */
    vis.svg.selectAll(".district-borders")
        .each(function (d) {
            vis.districtCentroids[d.properties.ADM3NAME] = path.centroid(d);
            console.log(vis.districtCentroids[d.properties.ADM3NAME]);
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
    vis.createChoropleth();
    vis.createCircles();

};

IraqMap.prototype.createChoropleth = function() {

    var vis = this;

    /** Create "Shia population" as (arbitrary) custom view (for now) */

    /** Create a quantize scale that sorts the data values into color buckets: */

    var colorScale = d3.scale.quantize()
        .domain([
            d3.min(vis.districtData, function (d) { return d.properties.ShareShia; }),
            d3.max(vis.districtData, function (d) { return d.properties.ShareShia; }) ])
        .range(colorbrewer.Greens[6]);

    // TODO: The domain could also simply go from 0 to 1. May make more sense for consistency.
    /** an alternative color range that allows for more control:
        var color = [];
        var color_length = 255;
        for (var i = 0; i < color_length; i++) {
            var color_new = "rgb(" + Math.floor( i / ( color_length - 1 ) * 200 + 55) + ", 0, 0)";
            color.push(color_new);
        }
        var colorScale = d3.scale.quantize()
            .range(color);
    */

    vis.svg.selectAll(".district-borders")
        .style("fill", function (d) {
            var value = d.properties.ShareShia;
            if (value) { return colorScale(value); }
            else { return "#ccc"; }
        })
        .append("title")
        .text(function (d) {
            return "Shia population in " + d.properties.ADM3NAME + ": " + Math.floor(d.properties.ShareShia * 100) + "%.";
        });
};

IraqMap.prototype.createCircles = function() {
    var vis = this;

    vis.svg.selectAll("circle")
        .data(vis.districtViolenceData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return vis.districtCentroids[d.district][0]; } )
        .attr("cy", function (d) { return vis.districtCentroids[d.district][1]; } )
        .attr("r", 3)
        .style({ "fill": "black", "opacity": "0.6" });

};

function UpdateChoropleth() {

    var vis = iraqMap;

    var selectBox = document.getElementById("district-level-data");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    if (selectedValue == "Population-Shia") {

        var colorScale = d3.scale.quantize()
            .domain([
                d3.min(vis.districtData, function (d) { return d.properties.ShareShia; }),
                d3.max(vis.districtData, function (d) { return d.properties.ShareShia; }) ])
            .range(colorbrewer.Greens[6]);

        vis.svg.selectAll(".district-borders")
            .style("fill", function (d) {
                var value = d.properties.ShareShia;
                if (value) { return colorScale(value); }
                else { return "#ccc"; }
            });

        vis.svg.selectAll("title")
            .text(function (d) {
                return "Shia population in " + d.properties.ADM3NAME + ": " + Math.floor(d.properties.ShareShia * 100) + "%.";
            });
    }

    if (selectedValue == "Population-Sunni") {

        var colorScale = d3.scale.quantize()
            .domain([
                d3.min(vis.districtData, function (d) { return d.properties.ShareSunni; }),
                d3.max(vis.districtData, function (d) { return d.properties.ShareSunni; }) ])
            .range(colorbrewer.Greens[6]);

        vis.svg.selectAll(".district-borders")
            .style("fill", function (d) {
                var value = d.properties.ShareSunni;
                if (value) { return colorScale(value); }
                else { return "#ccc"; }
            });

        vis.svg.selectAll("title")
            .text(function (d) {
                return "Sunni population in " + d.properties.ADM3NAME + ": " + Math.floor(d.properties.ShareSunni * 100) + "%.";
            });
    }

    if (selectedValue == "Population-Kurdish") {

        var colorScale = d3.scale.quantize()
            .domain([
                d3.min(vis.districtData, function (d) { return d.properties.ShareKurdish; }),
                d3.max(vis.districtData, function (d) { return d.properties.ShareKurdish; }) ])
            .range(colorbrewer.Greens[6]);

        vis.svg.selectAll(".district-borders")
            .style("fill", function (d) {
                var value = d.properties.ShareKurdish;
                if (value) { return colorScale(value); }
                else { return "#ccc"; }
            });

        vis.svg.selectAll("title")
            .text(function (d) {
                return "Kurdish population in " + d.properties.ADM3NAME + ": " + Math.floor(d.properties.ShareKurdish * 100) + "%.";
            });
    }
}
