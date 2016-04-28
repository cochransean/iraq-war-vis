
/*
 * IraqMap - Object constructor function
 * @param _parentElement -- the HTML element in which to draw the visualization
 * @param _data -- the data used for the map
 */

IraqMap = function(_parentElement, _districtBorders, _exteriorBorder, _placeData, _districtViolenceData, _districtData,
    _civilianCasualties){

    this.parentElement = _parentElement;
    this.districtBorders = _districtBorders;
    this.placeData = _placeData;
    this.exteriorBorder = _exteriorBorder;
    this.districtViolenceData = _districtViolenceData;
    this.districtCentroids = {};
    this.districtData = _districtData;
    this.civilianCasualties = _civilianCasualties;
    this.displayData = {}; // see data wrangling
    this.displayDataArray = [];

    this.initVis();
};

IraqMap.prototype.initVis = function() {

    // set this so it remains consistent
    var vis = this;

    // size map based on width of its div (to take up all available space and allow for easier styling)
    vis.margin = {top: 20, right: 20, bottom: 40, left: 20};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;

    // make map entire height of stacked area chart + controls to use up all space
    vis.height = $("#area-chart-div").height() - vis.margin.top - vis.margin.bottom;

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
    vis.MAX_CIRCLE_RADIUS = vis.width * 0.0449101796;
    vis.MIN_CIRCLE_RADIUS = vis.width * 0.00299401198;
    vis.circleScale = d3.scale.linear()
        .range([vis.MIN_CIRCLE_RADIUS, vis.MAX_CIRCLE_RADIUS]);

    // set tooltips
    vis.tipDistrict = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { return vis.updateBackgroundTooltip(d) });
    vis.svg.call(vis.tipDistrict);

    // Render the Iraq map (no need to update borders so include here and not update vis)
    vis.svg.append("path")
        .datum(vis.exteriorBorder)
        .attr("d", path)
        .attr("class", "map exterior-borders");

    vis.svg.selectAll(".district-borders")
        .data(vis.districtBorders)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "map district-borders")
        .on('mouseover', vis.tipDistrict.show)
        .on('mouseout', vis.tipDistrict.hide);

    // get district centroids and place into object for constant time access
    vis.svg.selectAll(".district-borders")
        .each(function (d) {
            vis.districtCentroids[d.properties.ADM3NAME] = path.centroid(d);
        });

    // Right now, map is a bit crowded. I've put city names into a tooltip for now
    vis.tipCity = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { return d.properties.name; });
    vis.svg.call(vis.tipCity);

    vis.svg.selectAll(".city")
        .data(vis.placeData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
        .attr("class", "map city point")
        .attr("r", "4px")
        .on('mouseover', vis.tipCity.show)
        .on('mouseout', vis.tipCity.hide);

    /** commented out (city name moved into tooltip):
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
     */

    // add groups for legends; place based on size of div which is dynamically calculated on load
    vis.circleLegend = vis.svg.append("g");
    vis.circleLegend
        .attr("transform", "translate(" + (0.0524737631 * vis.width) + ", " + (0.00727802038 * vis.height) + ")");
    const NUMBER_OF_CIRCLES = 5;
    const DIFFERENCE_BETWEEN_CIRCLE_RADIUS = (vis.MAX_CIRCLE_RADIUS - vis.MIN_CIRCLE_RADIUS) / NUMBER_OF_CIRCLES;
    var spaceFromTop = 0;

    // remember which radii are actually displayed in the legend
    vis.legendRadii = [];

    // create a circle for every step up in circle radius displayed on map
    for (var i = 0; i < NUMBER_OF_CIRCLES; i++) {

        // track radius to get appropriate positioning
        var radius = vis.MAX_CIRCLE_RADIUS - i * DIFFERENCE_BETWEEN_CIRCLE_RADIUS;
        const CIRCLE_PADDING = 0.01497005988 * vis.width;
        spaceFromTop += radius * 2 + CIRCLE_PADDING;

        vis.circleLegend.append("circle")
            .attr("cx", 0)
            .attr("r", radius)
            .attr("cy", spaceFromTop )
            .attr("class", "circle-legend")
            .style({ "fill": "black", "opacity": "0.6" });

        // track positioning and size for later appending of labels
        vis.legendRadii.push({
            radius: radius,
            spaceFromTop: spaceFromTop
        })
    }

    // add groups for color legend
    vis.colorLegend = vis.svg.append("g");

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
        vis.selectedCircleValue == "totalViolenceData" || vis.selectedCircleValue == "suicide") {
        vis.displayDataArray = vis.districtViolenceData;
    }

    else if (vis.selectedCircleValue == "min-civilian" || vis.selectedCircleValue == "max-civilian") {
        vis.displayDataArray = vis.civilianCasualties;
    }

    // otherwise must not be something with geographic component, post warning to user and break (don't continue with update)
    else {

        // hide circles in legend
        vis.circleLegend.style("display", "none");

        $("#alert-div").html('<div class="alert alert-warning alert-dismissible fade in" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span></button>' +
            '<strong>Sorry!</strong> Map data is unavailable for the selected data. </div>'
        );

        // remove current circles and stop without updating data and circles
        vis.circles.remove();
        return

    }

    vis.displayDataArray = vis.displayDataArray.filter(filterByDate);

    // populate object with districts prior to augmented assignment below to prevent key error
    var districts = d3.keys(vis.districtData);
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

    vis.circles = vis.svg.selectAll(".circle-symbol")
        .data(vis.displayDataArray, function(d) { return d.district });

    vis.circles.enter()
        .append("circle")
        .attr("cx", function (d) { return vis.districtCentroids[d.district][0]; } )
        .attr("cy", function (d) { return vis.districtCentroids[d.district][1]; } )
        .attr("class", "circle-symbol")
        .style({ "fill": "black", "opacity": "0.6" });

    vis.circles
        .attr("r", function(d) {
            var scaledValue = vis.circleScale(d.value);

            // don't circles so small they aren't legible and look like noise
            scaledValue = scaledValue < vis.MIN_CIRCLE_RADIUS ? 0: scaledValue;
            return scaledValue;
        });

    vis.circles.exit()
        .remove();

    // show circles for legend
    vis.circleLegend.style("display", "initial");

    // update text on circle legend
    var circleLegendText = vis.circleLegend.selectAll(".circle-legend-text")
        .data(vis.legendRadii);

    circleLegendText.enter()
        .append("text")
        .attr("x", function() { return vis.width * 0.0523952096 })
        .attr("y", function(d) {
            return d.spaceFromTop + 5;
        })
        .attr("class", "circle-legend-text")
        .attr("font-size", function() { return Math.round(0.0209580838 * vis.width) } );

    // update text as required
    circleLegendText
        .text(function(d) {
            var numberFormatter = d3.format(",.3s");
            return numberFormatter(vis.circleScale.invert(d.radius))
        });

};

IraqMap.prototype.updateChoropleth = function() {

    var vis = this;

    var selectBox = document.getElementById("district-level-data");
    vis.selectedBackgroundValue = selectBox.options[selectBox.selectedIndex].value;

    // update color scale
    var districts = d3.keys(vis.districtData);
    var valuesForExtent = districts.map(function(district) {
        return vis.districtData[district][vis.selectedBackgroundValue];
    });

    if (vis.selectedBackgroundValue == "Composition") {

        var groupings = ["Shia", "Sunni", "Kurdish", "Shia and Sunni", "Sunni and Kurdish", "Shia, Sunni and Kurdish"];
        var colors = colorbrewer.Set1[6];

        vis.colorScale = d3.scale.ordinal()
            .domain(groupings)
            .range(colors);

        // create mapping from color to category since scales don't support inversion
        vis.categoryColorMap = {};
        for (var i = 0; i < colors.length; i++) {
            vis.categoryColorMap[colors[i]] = groupings[i];
        }

    }

    else if (vis.selectedBackgroundValue == "Shia" || vis.selectedBackgroundValue == "Sunni" || vis.selectedBackgroundValue == "Kurdish") {
        vis.colorScale = d3.scale.threshold()
            .domain([0.02, 0.2, 0.4, 0.6, 0.8, 1.001])
            .range(["grey","#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"]);
    }

    else if (vis.selectedBackgroundValue == "ethnicHomogeneity") {
        vis.colorScale = d3.scale.quantize()
            .domain(d3.extent(valuesForExtent))
            .range(colorbrewer.RdYlGn[6]);
    }

    // I used quintiles for above 0
    else if (vis.selectedBackgroundValue == "OilGas") {
        vis.colorScale = d3.scale.threshold()
            .domain([1, 383, 551, 1442, 2921, 50000])
            .range(["grey","#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"]);
    }

    // I used quantiles with six buckets
    else if (vis.selectedBackgroundValue == "Unemployment") {
        vis.colorScale = d3.scale.threshold()
            .domain([0.0580, 0.0909, 0.1102, 0.1350, 0.1557, d3.max(valuesForExtent)])
            .range(colorbrewer.Oranges[6]);
    }

    vis.svg.selectAll(".district-borders")
        .style("fill", function (d) {
            var value = vis.districtData[d.properties.ADM3NAME][vis.selectedBackgroundValue];
            return vis.colorScale(value);
        });

    const COLOR_SWATCH_WIDTH = vis.width * 0.0374251497;
    const COLOR_SWATCH_HORIZONTAL_PADDING = vis.width * 0.00748502994;

    // dynamically position based on size of div and number of colors
    vis.colorLegend
        .attr("transform", "translate(" + (0.0424737631 * vis.width) + "," + ( vis.height * 0.82 ) + ")");

    console.log(vis.colorScale.range().length);

    // update color scale by binding data from new color scale
    var colorSwatches = vis.colorLegend.selectAll(".color-swatch")
        .data(vis.colorScale.range());

    colorSwatches.enter()
        .append("rect")
        .attr("width", COLOR_SWATCH_WIDTH)
        .attr("height", COLOR_SWATCH_WIDTH)
        .attr("x", 0)
        .attr("y", function(d, i) {
            return COLOR_SWATCH_WIDTH * i
        });

    colorSwatches
        .attr("fill", function(d) { return d } )
        .attr("class", "color-swatch");

    var swatchText = vis.colorLegend.selectAll(".swatch-text")
        .data(vis.colorScale.range());

    swatchText.enter()
        .append("text")
        .attr("x", COLOR_SWATCH_WIDTH + COLOR_SWATCH_HORIZONTAL_PADDING)
        .attr("class", "swatch-text")
        .attr("font-size", function() { return Math.round(0.0209580838 * vis.width) } );

    // adjust y-attribute here since text element needs actual text for BBox to work
    swatchText
        .text(function(d, i) { return updateSwatchText(d, i) })
        .attr("y", function(d, i) {
            const TEXT_HEIGHT = this.getBBox().height;
            console.log(TEXT_HEIGHT);
            return COLOR_SWATCH_WIDTH * i + COLOR_SWATCH_WIDTH / 2 + TEXT_HEIGHT / 2
        });

    function updateSwatchText(d, i) {

        // update with text explaining scale (vs std dev values that won't make sense
        if (vis.selectedBackgroundValue == "ethnicHomogeneity") {

            var lastItem = vis.colorScale.range().length - 1;

            // if first item in scale
            if (i == 0) {
                return "Most Heterogeneous District"
            }

            // if last item in scale
            else if (i == lastItem) {
                return "Completely Homogenous District"
            }
        }

        // if ordinal scale selected
        else if (vis.selectedBackgroundValue == "Composition") {
            return(vis.categoryColorMap[d]);
        }

        else if (vis.selectedBackgroundValue == "OilGas") {
            var range = vis.colorScale.invertExtent(d);
            if ( isNaN( vis.colorScale.invertExtent(d)[0] )) { return "No oil and gas reserves"; }
            else return ( range[0] + " to " + range[1] + " billions of barrels" );
        }

        // otherwise, scale must be in percentage. update with value represented by each color
        else {
            var formatter = d3.format(".3p");
            var range = vis.colorScale.invertExtent(d);
            if (isNaN(vis.colorScale.invertExtent(d)[0]))
                { return "Below " + formatter(range[1]); }
            else
                return(formatter(range[0]) + " to " + formatter(range[1]));
        }
    }

};

IraqMap.prototype.updateBackgroundTooltip = function(d) {

    // TODO: can clean up this whole section so that you loop over an array of the ethnicity names rather than copying
    // and pasting code for each
    var vis = this;

    if (vis.selectedBackgroundValue == "Shia" || vis.selectedBackgroundValue == "Sunni" ||
        vis.selectedBackgroundValue == "Kurdish") {

        var ethnicGroupName = vis.selectedBackgroundValue;
        var message = ethnicGroupName + " population in District " + d.properties.ADM3NAME + ": " +
        Math.floor(vis.districtData[d.properties.ADM3NAME][ethnicGroupName] * 100) + "%";
        return message
    }

    else if (vis.selectedBackgroundValue == "Composition") {
        ethnicGroupName = vis.selectedBackgroundValue;
        message = "Population in District " + d.properties.ADM3NAME + ": " +
            vis.districtData[d.properties.ADM3NAME][ethnicGroupName];
        return message
    }

    // TODO need to clean up the code here so that rounding doesn't lead to percentages that don't added up to 100%
    // Code now overestimates Shia, but that was the fastest solution I could think of.
    else if (vis.selectedBackgroundValue == "ethnicHomogeneity") {

        var SunniTooltip = Math.floor(vis.districtData[d.properties.ADM3NAME]["Sunni"] * 100);
        var KurdishTooltip = Math.floor(vis.districtData[d.properties.ADM3NAME]["Kurdish"] * 100);

        message = "Ethnic Composition of District " + d.properties.ADM3NAME + ": <br>" +
            "Shia: " + (100 - SunniTooltip - KurdishTooltip) + "%</br>" +
            "Sunni: " + SunniTooltip + "%</br>" +
            "Kurdish: " + KurdishTooltip + "%</br>";

        return message
    }

    else if (vis.selectedBackgroundValue == "OilGas") {
        message = "Gas and oil reserves in district " + d.properties.ADM3NAME + ": " +
            Math.floor(vis.districtData[d.properties.ADM3NAME][vis.selectedBackgroundValue]);
        return message
    }

    else if (vis.selectedBackgroundValue == "Unemployment") {
        message = "Unemployment in district " + d.properties.ADM3NAME + ": " +
            Math.floor(vis.districtData[d.properties.ADM3NAME][vis.selectedBackgroundValue] * 100) + "%";
        return message
    }

    else {
        return "No data for current selection"
    }

    // TODO: add other cases for different background selections here
    // else if...
    // else...




};
