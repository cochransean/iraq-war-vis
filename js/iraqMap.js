
/*
 * IraqMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

IraqMap = function(_parentElement, _districtData, _exteriorBorder, _placeData, _districtViolenceData, _ethnicData){
    this.parentElement = _parentElement;

    this.districtData = _districtData;
    this.placeData = _placeData;
    this.exteriorBorder = _exteriorBorder;
    this.districtViolenceData = _districtViolenceData;
    this.districtCentroids = {};
    this.ethnicData = _ethnicData;
    this.displayData = []; // see data wrangling

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
    vis.updateChoropleth();
    vis.wrangleData();

};

IraqMap.prototype.wrangleData = function() {
    var vis = this;

    console.log(districtViolenceData);
    var selectBox = document.getElementById("circle-data");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    console.log(selectedValue);

    // TODO filter by current date range and arrange into totals for that range by district


    vis.displayData = vis.districtViolenceData;
    vis.updateCircles();
};

IraqMap.prototype.updateCircles = function() {
    var vis = this;

    vis.svg.selectAll("circle")
        .data(vis.displayData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return vis.districtCentroids[d.district][0]; } )
        .attr("cy", function (d) { return vis.districtCentroids[d.district][1]; } )
        .attr("r", 3)
        .style({ "fill": "black", "opacity": "0.6" });

};

IraqMap.prototype.updateChoropleth = function() {

    var vis = this;

    var selectBox = document.getElementById("district-level-data");
    var ethnicGroupName = selectBox.options[selectBox.selectedIndex].value;
    var selectedValue = "Share" + ethnicGroupName;

    // get array of values to calculate extent for color scale
    var districts = d3.keys(vis.ethnicData);
    var valuesForExtent = districts.map(function(district) {
        return vis.ethnicData[district][selectedValue];
    });

    var colorScale = d3.scale.quantize()
        .domain(d3.extent(valuesForExtent))
        .range(colorbrewer.Greens[6]);

    vis.svg.selectAll(".district-borders")
        .style("fill", function (d) {
            var value = vis.ethnicData[d.properties.ADM3NAME][selectedValue];
            if (value) { return colorScale(value); }
            else { return "#ccc"; }
        });

    vis.svg.selectAll("title")
        .text(function (d) {
            return ethnicGroupName + " population in " + d.properties.ADM3NAME + ": " +
                Math.floor(d.properties.ShareShia * 100) + "%.";
        });

};
