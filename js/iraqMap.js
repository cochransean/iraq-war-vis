
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
    this.displayData = {}; // see data wrangling
    this.displayDataArray = [];

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

    // setup color scale here; update range and domain upon updates to allow for color scale changes
    // get array of values to calculate extent for color scale
    vis.colorScale = d3.scale.quantize();

    // setup linear scale for proportionate symbol circle radii; update domain later because it will change on selection
    vis.circleScale = d3.scale.linear()
        .range([0, 30]);

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

    // get district centroids and place into object for constant time access
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

    // get currently selected data
    var selectBox = document.getElementById("circle-data");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;

    // start with the entire data set then filter by date
    // TODO we need to go back to all these functions that are hard coded for violence data and make them
    // TODO broadly applicable for whatever category is selected once it's all working
    vis.displayDataArray = vis.districtViolenceData;
    vis.displayDataArray = vis.displayDataArray.filter(filterByDate);

    // populate object with districts prior to augmented assignment below to prevent key error
    var districts = d3.keys(vis.ethnicData);
    districts.forEach(function(district) {
        vis.displayData[district] = 0;
    });

    // cycle through time periods adding up cumulative for each district
    vis.displayDataArray.forEach(function(timePeriod) {
        vis.displayData[timePeriod.district] += timePeriod[selectedValue];
    });

    vis.updateCircles();
};

IraqMap.prototype.updateCircles = function() {
    var vis = this;

    var districts = d3.keys(vis.displayData);
    vis.displayDataArray = districts.map(function(district) {
       return {
           "district": district,
           "value": vis.displayData[district]
       }
    });

    // update circle scale
    vis.circleScale
        .domain(d3.extent(vis.displayDataArray, function(d) {
            return d.value;
        }));

    var circles = vis.svg.selectAll("circle")
        .data(vis.displayDataArray, function(d) { return d.district });

    circles.enter()
        .append("circle")
        .attr("cx", function (d) { return vis.districtCentroids[d.district][0]; } )
        .attr("cy", function (d) { return vis.districtCentroids[d.district][1]; } )
        .style({ "fill": "black", "opacity": "0.6" });

    circles
        .attr("r", function(d) {
            var scaledValue = vis.circleScale(d.value);

            // don't circles so small they aren't legible and look like noise
            scaledValue = scaledValue < 2 ? 0: scaledValue;
            return scaledValue;
        });

    circles.exit()
        .remove();

};

IraqMap.prototype.updateChoropleth = function() {

    var vis = this;

    var selectBox = document.getElementById("district-level-data");
    var ethnicGroupName = selectBox.options[selectBox.selectedIndex].value;
    var selectedValue = "Share" + ethnicGroupName;

    // update color scale
    var districts = d3.keys(vis.ethnicData);
    var valuesForExtent = districts.map(function(district) {
        return vis.ethnicData[district][selectedValue];
    });
    vis.colorScale
        .domain(d3.extent(valuesForExtent))
        .range(colorbrewer.Greens[6]);

    vis.svg.selectAll(".district-borders")
        .style("fill", function (d) {
            var value = vis.ethnicData[d.properties.ADM3NAME][selectedValue];
            if (value) { return vis.colorScale(value); }
            else { return "#ccc"; }
        });

    vis.svg.selectAll("title")
        .text(function (d) {
            return ethnicGroupName + " population in " + d.properties.ADM3NAME + ": " +
                Math.floor(d.properties.ShareShia * 100) + "%.";
        });

};
