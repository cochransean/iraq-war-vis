/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _districtViolenceData    -- violence data by district
 * @param _totalViolenceData    -- violence for entire country not divided by district
 * @param _dimensions       -- dimensions object, contains multiples to scale parent div dimensions by
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
    var mapAreaDiv = $("#mapAreaVis");
    var otherDivsHeight = $("#controls").height() + $("#information").height() + $("#area-map-heading").height()
        + mapAreaDiv.outerHeight(true) - mapAreaDiv.height(); // include padding and margins
    this.height = ($(window).height() - otherDivsHeight) * _dimensions.heightRatio;
    this.margin = _dimensions.margin;
    this.selectedColors = _colorScale;

    // convert margins to pixels based on viewport dimensions
    this.margin.left = this.margin.left * this.width;
    this.margin.right = this.margin.right * this.width;
    this.margin.top = this.margin.top * this.height;
    this.margin.bottom = this.margin.bottom * this.height;

    // map subcategories to categories to allow for subselections
    this.subcategoryToCategory = {
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

    // set width of alert div here since it needs to be same width as stacked area chart
    $("#alert-div").css("width", this.width);

};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function () {

    var vis = this;


    vis.height = vis.height - vis.margin.top - vis.margin.bottom;
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


    // tooltips for timeline events
    vis.timelineTooltip = d3.tip()
        .attr('class', 'd3-tip-timeline')
        .html(function(d) { return '<div class="text-center">' + d.event + '</div>'; })
        .offset([vis.height / 2, 0]);
    vis.svg.call(vis.timelineTooltip);

    // tooltip for data on stacked area chart
    vis.tooltip = d3.select("#area-chart-tooltip");
    vis.jQueryTooltip = $("#area-chart-tooltip");
    vis.tooltipTitle = d3.select("#area-chart-tooltip-title");
    vis.tooltipText = d3.select("#area-chart-tooltip-p");
    vis.tooltipDate = d3.select("#area-chart-tooltip-date");

    // filter and format data for stacked area chart
    vis.wrangleData();

};


/*
 * Data wrangling
 */
StackedAreaChart.prototype.wrangleData = function (datesChanged) {
    var vis = this;

    // track old option to see if a new data type has been selected, requiring reseting of dates
    var oldOption = vis.selectedOption;

    // update data selection based on user input
    vis.selectedOption = $("#circle-data").val();
    vis.displayData = vis[vis.subcategoryToCategory[vis.selectedOption]];

    // if new data selection, update date range
    if (oldOption !== vis.selectedOption) {
        var newDateRange = d3.extent(vis.displayData, function (d) {
            return d.date
        });

        // check to see if dates actually are different
        if (newDateRange[0].getTime() != dateRange[0].getTime() || newDateRange[1].getTime() != dateRange[1].getTime()) {

            datesChanged = true;
            dateRange = newDateRange;

            // announce change with event handler
            $(document).trigger("dateRangeChanged");
        }

    }

    // if not a timeline, update based on date range
    if (!(vis instanceof TimeSelect)) {
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
    vis.updateVis(datesChanged);

};


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
StackedAreaChart.prototype.updateVis = function (datesChanged) {
    var vis = this;

    // update the axes
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.y.domain([0, d3.max(vis.displayData, function (d) {
        return d3.max(d.values, function (e) {
            return e.y0 + e.y;
        });
    })
    ]);

    // update based on if full area chart of time select, otherwise leave at full extent of data
    if (!(vis instanceof TimeSelect)) {
        vis.x.domain(dateRange);
    }
    else {
        vis.x.domain(d3.extent(vis[vis.subcategoryToCategory[vis.selectedOption]], function (d) {
            return d.date
        }));
    }

    // update color scale
    var categoryNames = vis.displayData.map(function (d) {
        return d.name;
    });
    var numberColors = categoryNames.length <= 2 ? 3 : categoryNames.length;
    vis.colorScale
        .domain(categoryNames)
        .range(colorbrewer[vis.selectedColors][numberColors]);

    // Call axis functions with the new domain
    vis.xAxisGroup
        .transition()
        .duration(1500)
        .call(vis.xAxis);
    vis.yAxisGroup
        .transition()
        .duration(1500)
        .call(vis.yAxis);

    // Draw the layers
    vis.categories = vis.svg.selectAll(".area")
        .data(vis.displayData, function(d) { return d.name });

    vis.newPaths = vis.categories.enter().append("path")
        .style("fill", function (d) {
            return vis.colorScale(d.name);
        })
        .attr("class", "area stacked-category");


    // only transition the areas if the dates have not changed (otherwise it gets confusing and muddled)
    if (!datesChanged) {
        vis.categories
            .style("opacity", 0.5)
            .transition()
            .duration(1500)
            .attr("d", function (d) {
                return vis.area(d.values);
            })
            .each("end", function() {
                var category = d3.select(this);
                category.style("opacity", 1);
            })

    }
    else {
        vis.categories
            .style("opacity", 0.5)
            .attr("d", function (d) {
                return vis.area(d.values);
            })
            .transition()
            .duration(1500)
            .style("opacity", 0.5)
            .each("end", function() {
                var category = d3.select(this);
                category.style("opacity", 1);
            });
    }


    vis.categories.exit().remove();


    vis.updateUI();

    // always redraw tooltip elements, otherwise they will be behind the timeline lines
    vis.focus.remove();
    vis.addTooltipElements();

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

    // overlay with path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

};

// updates the axes labels and provides tooltip functionality
StackedAreaChart.prototype.updateUI = function() {
    var vis = this;

    // first, update any existing events to make the transition clearer to the user (movement of time)
    vis.events = vis.svg.selectAll(".event")
        .data(vis.displayEvents);

    // old events (currently displayed)
    // after transition, remove and add timeline lines (to ensure they are always on top of paths
    vis.events
        .transition()
        .duration(1500)
        .attr("height", vis.height)
        .style("fill", function(d) { return d.id == highlightedEvent ? "#E41A1C" : "black" })
        .style("stroke", function(d) { return d.id == highlightedEvent ? "white" : "black" })
        .style("stroke-width", function(d) { return d.id == highlightedEvent ? "2" : "1" })
        .style("width", function(d) { return d.id == highlightedEvent ? 7 : 4 })
        .attr("x", function(d) { return vis.x(d.date) - this.getBBox().width / 2 })
        .style("opacity", function(d) { return d.id == highlightedEvent ? 1 : 0.5 })
        .remove()
        .call(endall, function() { addEvents() });

    // formatter for time
    var monthYear = d3.time.format("%B %Y");

    // bisector to get valid dates from mouse position
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    // update axis text based on text from index
    vis.yLabel.text($('.chart-option[value=' + vis.selectedOption +']').text());


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
        });

    vis.newPaths
        .on("mouseover", function (d) {
            vis.jQueryTooltip.removeClass('hidden');
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

            var xPos = vis.x(closestDate);
            var yPos = vis.y(d.values[closestIndex].y + d.values[closestIndex].y0);

            vis.focus
                .attr("transform",
                    "translate(" + xPos + "," +
                    yPos + ")");

            vis.focus.select(".tooltip-x")
                .attr("y2", vis.height - vis.y(d.values[closestIndex].y + d.values[closestIndex].y0));

            vis.focus.select(".tooltip-y")
                .attr("x1", 0 - vis.x(closestDate));

            vis.tooltip
                .style("top", function() {
                    return yPos + vis.margin.top -  vis.jQueryTooltip.outerHeight(true) + "px"
                })
                .style("left", function() {
                    return xPos + vis.margin.left - vis.jQueryTooltip.outerWidth() / 2 + "px"
                });

            // update text and get new width
            vis.tooltipText.text(d.values[closestIndex].y);
            vis.tooltipDate.text(monthYear(closestDate));

        })
        .on("mouseout", function() {
            vis.jQueryTooltip.addClass('hidden');
            vis.focus.style("display", "none");
        });

    function addEvents() {

        // filter events by date
        vis.displayEvents = vis.eventsData.filter(filterByDate);
        vis.displayEvents = vis.displayEvents.filter(filterByImportance);

        vis.events = vis.svg.selectAll(".event")
            .data(vis.displayEvents);

        vis.events.enter()
            .append("rect");

        vis.events
            .attr("height", vis.height)
            .style("fill", function(d) { return d.id == highlightedEvent ? "#E41A1C" : "black" })
            .style("stroke", function(d) { return d.id == highlightedEvent ? "#f7f7f7" : "black" })
            .style("stroke-width", function(d) { return d.id == highlightedEvent ? "2" : "1" })
            .style("width", function(d) { return d.id == highlightedEvent ? 7 : 4 })
            .attr("x", function(d) { return vis.x(d.date) - this.getBBox().width / 2 })
            .style("opacity", function(d) { return d.id == highlightedEvent ? 1 : 0.5 })
            .attr("id", function(d) { return d.id })
            .attr("class", "event")
            .on("mouseover", function(d) { vis.timelineTooltip.show(d, this) })
            .on("mouseout", function(d) { vis.timelineTooltip.hide(d, this) })
            .each(function(d) {
                if (d.id == highlightedEvent) {
                    vis.timelineTooltip.show(d, this); // show tooltip if highlighted
                }
            });
    }

};
