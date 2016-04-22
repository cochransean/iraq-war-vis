/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _districtViolenceData    -- violence data by district
 * @param _totalViolenceData    -- violence for entire country not divided by district
 * @param _dimensions       -- dimensions object
 * @param _colorScale       -- color scale desired from colorbrewer.js
 */

StackedAreaChart = function (_parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                             _troopNumbersData, _usCasualtiesMonthData, _civCasualtiesMonthly, _eventsData,
                             _colorScale) {

    this.parentElement = _parentElement;
    this.districtViolenceData = _districtViolenceData;
    this.totalViolenceData = _totalViolenceData;
    this.troopsBySource = _troopNumbersData;
    this.usCasualtiesByMonth = _usCasualtiesMonthData;
    this.civCasualtiesMonthly = _civCasualtiesMonthly;
    this.displayData = []; // see data wrangling
    this.eventsData = _eventsData;
    this.displayEvents = []; // see updateUI function

    // set dimensions; size based on width of div to allow for easier styling with bootstrap
    this.width = $("#" + this.parentElement).width();
    this.heightRatio = _dimensions.heightRatio;
    this.margin = _dimensions.margin;
    this.selectedColors = _colorScale;

};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function () {

    var vis = this;

    var otherDivsHeight = $("#controls").height() + $("#information").height();
    vis.height = (vis.width - otherDivsHeight) * vis.heightRatio - vis.margin.top - vis.margin.bottom;
    vis.width = vis.width - vis.margin.left - vis.margin.right;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // append rectangle to listen for clicks on background (to reset back to parent category from sub-category)
    vis.svg.append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("class", "area-background")
        .on("click", function() {
            var select = $("#circle-data");
            var currentSelection = select.children("option:selected");

            // if down in hierarchy of selections
            if (currentSelection.hasClass("level2")) {

                // reset selection to previous level of hierarchy
                var parentLevel = currentSelection.prevAll(".level1").val();
                select.val(parentLevel);

                // trigger change for update sequence
                select.trigger("change");
            }
        });

    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    // color brewer scale, update range and domain depending on data
    vis.colorScale = d3.scale.ordinal();

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(5);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.xLabel = vis.xAxisGroup.append("text")
        .attr("x", vis.width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Time");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.yLabel = vis.yAxisGroup.append("text")
        .attr("transform", "translate(-70," + (vis.height / 2) + ") rotate(90)")
        .attr("text-anchor", "middle");

    // Area generator
    vis.area = d3.svg.area()
        .x(function (d) {
            return vis.x(d.date)
        })
        .y0(function (d) {
            return vis.y(d.y0)
        })
        .y1(function (d) {
            return vis.y(d.y + d.y0)
        });

    // group for tooltips
    vis.focus = vis.svg.append("g");

    // set time range globally (to extent of data on initial load, user can filter later)
    dateRange = d3.extent(vis.totalViolenceData, function (d) {
        return d.date;
    });


    // filter and format data for stacked area chart
    vis.wrangleData();

};


/*
 * Data wrangling
 */
StackedAreaChart.prototype.wrangleData = function () {
    var vis = this;

    // track old option to see if a new data type has been selected, requiring reseting of dates
    var oldOption = vis.selectedOption;

    // map subcategories to categories to allow for subselections
    var subcategoryToCategory = {
        totalViolenceData: "totalViolenceData",
        ied_total: "totalViolenceData",
        idf: "totalViolenceData",
        suicide: "totalViolenceData",
        df: "totalViolenceData",
        troopsBySource: "troopsBySource",
        usTroops: "troopsBySource",
        intTroops: "troopsBySource",
        usCasualtiesByMonth: "usCasualtiesByMonth",
        fatalities: "usCasualtiesByMonth",
        wounded: "usCasualtiesByMonth",
        civCasualtiesMonthly: "civCasualtiesMonthly",
        "min-civilian": "civCasualtiesMonthly",
        "max-civilian":  "civCasualtiesMonthly"

    };

    // update data selection based on user input
    vis.selectedOption = $("#circle-data").val();
    vis.displayData = vis[subcategoryToCategory[vis.selectedOption]];

    // if new data selection, update date range
    if (oldOption !== vis.selectedOption) {
        dateRange = d3.extent(vis.displayData, function (d) {
            return d.date
        });

        // announce change with event handler
        $(document).trigger("dateRangeChanged");
    }

    // if same as old data selection, filter by date
    else {
        vis.displayData = vis.displayData.filter(filterByDate);
    }

    // object to map user selection to fields you want to display; update here as data types are added
    // sub-categories are listed so that filtering occurs by nature of map function below
    var selectionToCategories = {
        totalViolenceData: ["suicide", "df", "idf", "ied_total"],
        troopsBySource: ["usTroops", "intTroops"],
        usCasualtiesByMonth: ["fatalities", "wounded"],
        fatalities: ["fatalities"],
        wounded: ["wounded"],
        ied_total: ["ied_total"],
        idf: ["idf"],
        df: ["df"],
        suicide: ["suicide"],
        usTroops: ["usTroops"],
        intTroops: ["intTroops"],
        civCasualtiesMonthly: ["min-civilian", "delta"],
        "min-civilian": ["min-civilian"],
        "max-civilian": ["max-civilian"]
    };

    // get fields appropriate for the user selection
    var dataCategories = selectionToCategories[vis.selectedOption];
    vis.displayData = dataCategories.map(function (category) {
        var noNaN = true;
        return {
            name: category,
            values: vis.displayData.map(function (d) {

                // warn user if data is not available for entire range
                if (isNaN(d[category]) && noNaN == true) {
                    noNaN = false;

                    // TODO update something on the DOM to reflect data is not available for whole range (as in wounded
                    // data which isn't available after 2011
                    console.log("found a nan value for " + category);
                    return {date: d.date, y: 0};
                }
                else if (isNaN(d[category])) {
                    return {date: d.date, y: 0};
                }
                else {
                    return {date: d.date, y: d[category]}
                }
            })
        };
    });


    // init stack layout
    var stack = d3.layout.stack()
        .values(function (d) {
            return d.values;
        });

    // stack data
    vis.displayData = stack(vis.displayData);

    // Update the visualization
    vis.updateVis();

};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
StackedAreaChart.prototype.updateVis = function () {
    var vis = this;

    // update the axes
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function (d) {
        return d3.max(d.values, function (e) {
            return e.y0 + e.y;
        });
    })
    ]);
    vis.x.domain(dateRange);

    // update color scale
    var categoryNames = vis.displayData.map(function (d) {
        return d.name;
    });
    var numberColors = categoryNames.length <= 2 ? 3 : categoryNames.length;
    vis.colorScale
        .domain(categoryNames)
        .range(colorbrewer[vis.selectedColors][numberColors]);

    // Call axis functions with the new domain
    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);

    // Draw the layers
    vis.categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    vis.newPaths = vis.categories.enter().append("path")
        .attr("class", "area");

    vis.categories
        .style("fill", function (d) {
            return vis.colorScale(d.name);
        })
        .attr("d", function (d) {
            return vis.area(d.values);
        });

    vis.categories.exit().remove();

    // if any categories are entering, remove and redraw tooltip elements (needed to prevent overlapping)
    if (vis.categories.enter().empty() !== true) {
        vis.focus.remove();
        vis.addTooltipElements();
    }

    vis.updateUI();

};


StackedAreaChart.prototype.addTooltipElements = function() {
    var vis = this;

    // tooltip setup
    // based on ideas from http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html
    vis.focus = vis.svg.append("g");
    vis.focus.style("display", "none")
        .attr("class", "areaTooltip");

    // append the x line
    vis.focus.append("line")
        .attr("class", "tooltipLine tooltip-x")
        .attr("y1", 0)
        .attr("y2", vis.height);

    // append the y line
    vis.focus.append("line")
        .attr("class", "tooltipLine tooltip-y")
        .attr("x1", 0)
        .attr("x2", 0);

    vis.focus.append("circle")
        .attr("class", "tooltipCircle")
        .attr("r", 4);

    // build out group to contain tooltip elements
    const BOX_HEIGHT = 65;
    vis.focusBox = vis.focus.append("g");

    // background box
    vis.tooltipBackground = vis.focusBox.append("rect")
        .attr("class", "tooltipBackground")
        .attr("width", BOX_HEIGHT)
        .attr("height", 65);

    // place the text elements
    const TEXT_PADDING = 3;
    vis.tooltipTitle = vis.focusBox.append("text")
        .attr("class", "tooltipTitle")
        .attr("dx", TEXT_PADDING)
        .attr("dy", "1.2em");

    vis.tooltipText = vis.focusBox.append("text")
        .attr("class", "tooltipValue")
        .attr("dx", TEXT_PADDING)
        .attr("dy", "2.5em");

    vis.tooltipDate = vis.focusBox.append("text")
        .attr("class", "tooltipDate")
        .attr("dx", TEXT_PADDING)
        .attr("dy", "3.8em");

};

// updates the axes labels and provides tooltip functionality
StackedAreaChart.prototype.updateUI = function() {
    var vis = this;

    // formatter for time
    var monthYear = d3.time.format("%B %Y");

    // bisector to get valid dates from mouse position
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    // update axis text based on text from index
    vis.yLabel.text($('.chart-option[value=' + vis.selectedOption +']').text());

    // TODO add timeline lines
    // filter events by date
    vis.displayEvents = vis.eventsData.filter(filterByDate);

    // enter, update, and exit lines for timeline

    // enter, update, and exit text for each line

    // add tooltip updates to entering categories


    vis.newPaths
        .on("click", function(d) {
            var select = $("#circle-data");

            // if civ casualty delta clicked on; zoom in on max civilian casualties
            if (d.name === "delta") {
                select.val("max-civilian")
            }

            // else set value to element clicked on to trigger update sequence
            else {
                select.val(d.name);
            }

            // trigger change since it won't trigger with .val along
            select.trigger("change");
        })
        .on("mouseover", function (d) {
            vis.tooltipTitle.text(convertAbbreviation(d.name));
            vis.focus.style("display", null);
        })
        .on("mousemove", function(d) {

            // get mouse position and corresponding values
            vis.mousePosition = d3.mouse(this);
            var mouseDate = vis.x.invert(vis.mousePosition[0]);

            // get the surrounding dates
            var indexNextHigherDate = bisectDate(d.values, mouseDate),
                d0 = d.values[indexNextHigherDate - 1].date,
                d1 = d.values[indexNextHigherDate].date;

            // determine which potential date is closer to mouse position
            if (mouseDate - d0 > d1 - mouseDate) {
                var closestDate = d1,
                    closestIndex = indexNextHigherDate;
            }

            else {
                closestDate = d0;
                closestIndex = indexNextHigherDate - 1;
            }

            vis.focus
                .attr("transform",
                    "translate(" + vis.x(closestDate) + "," +
                    vis.y(d.values[closestIndex].y + d.values[closestIndex].y0) + ")");

            vis.focus.select(".tooltip-x")
                .attr("y2", vis.height - vis.y(d.values[closestIndex].y + d.values[closestIndex].y0));

            vis.focus.select(".tooltip-y")
                .attr("x1", 0 - vis.x(closestDate));

            // update text and get new width
            vis.tooltipText.text(d.values[closestIndex].y);
            vis.tooltipDate.text(monthYear(closestDate));
            var textWidth = getTextWidth([vis.tooltipTitle, vis.tooltipText, vis.tooltipDate]);

            vis.tooltipBackground
                .attr("width", textWidth);

            // shift focus box to accommodate new width
            const BOX_HEIGHT = 65;
            const BOX_VERTICAL_PADDING = 10;
            vis.focusBox
                .attr("transform",
                    "translate(" + (-textWidth / 2) + "," + (-(BOX_HEIGHT + BOX_VERTICAL_PADDING)) + ")");

            // returns greatest width from an array of nodes to check
            function getTextWidth(nodes) {

                const PADDING = 6;

                // get bounding box
                var highestWidth = nodes[0].node().getBBox().width;

                for (var i = 1; i < nodes.length; i++) {
                    var currentWidth = nodes[i].node().getBBox().width;
                    highestWidth = currentWidth > highestWidth ? currentWidth: highestWidth;
                }

                // return width plus padding
                return highestWidth + PADDING;
            }

        })
        .on("mouseout", function() {
            vis.focus.style("display", "none");
        })
};