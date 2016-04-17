/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _districtViolenceData    -- violence data by district
 * @param _totalViolenceData    -- violence for entire country not divided by district
 * @param _dimensions       -- dimensions object
 * @param _colorScale       -- color scale desired from colorbrewer.js
 */

StackedAreaChart = function (_parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                             _troopNumbersData, _colorScale) {

    this.parentElement = _parentElement;
    this.districtViolenceData = _districtViolenceData;
    this.totalViolenceData = _totalViolenceData;
    this.troopsBySource = _troopNumbersData;
    this.displayData = []; // see data wrangling

    // set dimensions; size based on width of div to allow for easier styling with bootstrap
    this.width = $("#" + this.parentElement).width();
    this.heightRatio = _dimensions.heightRatio;
    this.margin = _dimensions.margin;
    this.selectedColors = _colorScale;

    this.initVis();

};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function () {

    var vis = this;

    var controlsHeight = $("#controls").height();
    vis.height = (vis.width - controlsHeight) * vis.heightRatio - vis.margin.top - vis.margin.bottom;
    vis.width = vis.width - vis.margin.left - vis.margin.right;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    // color brewer scale, update range and domain depending on data
    vis.colorScale = d3.scale.ordinal();

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.xLabel = vis.xAxisGroup.append("text")
        .attr("x", vis.width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

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

    // update data selection based on user input
    vis.selectedOption = $("#" + vis.parentElement + "-data-select").val();
    vis.displayData = vis[vis.selectedOption];

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
    var selectionToCategories = {
        "totalViolenceData": ["df", "idf", "ied_total", "suicide"],
        "troopsBySource": ["usTroops", "intTroops"]
    };

    // get fields appropriate for the user selection
    var dataCategories = selectionToCategories[vis.selectedOption];
    vis.displayData = dataCategories.map(function (category) {
        return {
            name: category,
            values: vis.displayData.map(function (d) {
                return {date: d.date, y: d[category]};
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

    // update axis text based on text from index
    vis.xLabel.text($('[class=' + vis.parentElement + '-option][value=' + vis.selectedOption + ']').text());

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .on("mouseover", function (d) { $("#area-chart-tooltip").html(d.name) });

    categories
        .style("fill", function (d) {
            return vis.colorScale(d.name);
        })
        .attr("d", function (d) {
            return vis.area(d.values);
        });

    categories.exit().remove();

    // TODO: update tooltip text


};
