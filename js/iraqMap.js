
/*
 * IraqMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

IraqMap = function(_parentElement, _districtData, _exteriorBorder, _placeData, _districtViolenceData, _ethnicData,
    _civilianCasualties){

    this.parentElement = _parentElement;
    this.districtData = _districtData;
    this.placeData = _placeData;
    this.exteriorBorder = _exteriorBorder;
    this.districtViolenceData = _districtViolenceData;
    this.districtCentroids = {};
    this.ethnicData = _ethnicData;
    this.civilianCasualties = _civilianCasualties;
    this.displayData = {}; // see data wrangling
    this.displayDataArray = [];

    this.initVis();
};

IraqMap.prototype.initVis = function() {

    // set this so it remains consistent
    var vis = this;

    // size map based on width of its div (to take up all available space and allow for easier styling)
    vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
    vis.width = $("#" + vis.parentElement).width();

    // make map entire height of stacked area chart + controls to use up all space
    vis.height = $("#area-chart-div").height() - vis.margin.top - vis.margin.bottom;
    vis.width = vis.width - vis.margin.left - vis.margin.right;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // setup project and path generator; make map resize based on window size
    const widthToProjectRatio = 5.9;
    var projection = d3.geo.mercator()
        .translate([vis.width / 2, vis.height / 2])
        .center([43.75, 33.6])
        .scale(vis.width * widthToProjectRatio);

    var path = d3.geo.path()
        .projection(projection);

    // setup linear scale for proportionate symbol circle radii; update domain later because it will change on selection
    vis.circleScale = d3.scale.linear()
        .range([0, 30]);

    // set tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { return vis.updateBackgroundTooltip(d) });
    vis.svg.call(vis.tip);

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
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
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
    vis.selectedCircleValue = selectBox.options[selectBox.selectedIndex].value;

    // wrangle data based on selection
    if (vis.selectedCircleValue == "ied_total" || vis.selectedCircleValue == "df" || vis.selectedCircleValue == "idf" ||
        vis.selectedCircleValue == "totalViolenceData") {
        vis.displayDataArray = vis.districtViolenceData;
    }

    else if (vis.selectedCircleValue == "min-civilian" || vis.selectedCircleValue == "max-civilian") {
        vis.displayDataArray = vis.civilianCasualties;
    }

    // if not something with geographic component, post warning to user and break (don't continue with update)
    else if (vis.selectedCircleValue == "troopsBySource" || vis.selectedCircleValue == "usCasualtiesByMonth" ||
            vis.selectedCircleValue == "fatalities" || vis.selectedCircleValue == "wounded") {

        $("#alert-div").html('<div class="alert alert-warning alert-dismissible fade in" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span></button>' +
            '<strong>Sorry!</strong> Map data is unavailable for the selected data. </div>'
        )
    }

    vis.displayDataArray = vis.displayDataArray.filter(filterByDate);

    // populate object with districts prior to augmented assignment below to prevent key error
    var districts = d3.keys(vis.ethnicData);
    districts.forEach(function(district) {
        vis.displayData[district] = 0;
    });

    // cycle through time periods adding up cumulative for each district
    vis.displayDataArray.forEach(function(timePeriod) {
        vis.displayData[timePeriod.district] += timePeriod[vis.selectedCircleValue];
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
    vis.selectedBackgroundValue = selectBox.options[selectBox.selectedIndex].value;

    // create color scale (needs to be done here now as the scale's type depends on data)


    // update color scale
    var districts = d3.keys(vis.ethnicData);
    var valuesForExtent = districts.map(function(district) {
        return vis.ethnicData[district][vis.selectedBackgroundValue];
    });

    if (vis.selectedBackgroundValue == "Composition") {
        vis.colorScale = d3.scale.ordinal()
            .domain(["Shia", "Sunni", "Kurdish", "Shia and Sunni", "Sunni and Kurdish", "Shia, Sunni and Kurdish"])
            .range(colorbrewer.Greens[6]);
    }
    else if (vis.selectedBackgroundValue == "ethnicHomogeneity") {
        vis.colorScale = d3.scale.quantize()
            .domain(d3.extent(valuesForExtent))
            .range(colorbrewer.RdYlGn[6]);
    }
    else {
        vis.colorScale = d3.scale.quantize()
            .domain(d3.extent(valuesForExtent))
            .range(colorbrewer.Greens[6]);
    }

    vis.svg.selectAll(".district-borders")
        .style("fill", function (d) {
            var value = vis.ethnicData[d.properties.ADM3NAME][vis.selectedBackgroundValue];
            if (value) { return vis.colorScale(value); }
            else { return "#ccc"; }
        });

};

IraqMap.prototype.updateBackgroundTooltip = function(d) {

    // TODO: can clean up this whole section so that you loop over an array of the ethnicity names rather than copying
    // and pasting code for each
    var vis = this;

    if (vis.selectedBackgroundValue == "Shia" || vis.selectedBackgroundValue == "Sunni" ||
        vis.selectedBackgroundValue == "Kurdish") {

        var ethnicGroupName = vis.selectedBackgroundValue;
        var message = ethnicGroupName + " population in District " + d.properties.ADM3NAME + ": " +
        Math.floor(vis.ethnicData[d.properties.ADM3NAME][ethnicGroupName] * 100) + "%";
        return message
    }
    else if (vis.selectedBackgroundValue == "Composition") {
        ethnicGroupName = vis.selectedBackgroundValue;
        message = "Population in District " + d.properties.ADM3NAME + ": " +
            vis.ethnicData[d.properties.ADM3NAME][ethnicGroupName];
        return message
    }
    // TODO need to clean up the code here so that rounding doesn't lead to percentages that don't added up to 100%
    else if(vis.selectedBackgroundValue == "ethnicHomogeneity") {
        message = "Ethnic Composition of District " + d.properties.ADM3NAME + ": <br>" +
            "Shia: " + Math.floor(vis.ethnicData[d.properties.ADM3NAME]["Shia"] * 100) + "%</br>" +
            "Sunni: " + Math.floor(vis.ethnicData[d.properties.ADM3NAME]["Sunni"] * 100) + "%</br>" +
            "Kurish: " + Math.floor(vis.ethnicData[d.properties.ADM3NAME]["Kurdish"] * 100) + "%</br>";
        return message
    }
    else {
        return "No data for current selection"
    }
    // TODO: add other cases for different background selections here
    // else if...
    // else...




};
