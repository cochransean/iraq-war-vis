

/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _districtViolenceData    -- violence data by district
 * @param _totalViolenceData    -- violence for entire country not divided by district
 * @param _dimensions       -- dimensions object
 * @param _colorScale       -- color scale desired from colorbrewer.js
 */

StackedAreaChart = function(_parentElement, _dimensions, _districtViolenceData, _totalViolenceData, _colorScale){
	this.parentElement = _parentElement;
  	this.districtViolenceData = _districtViolenceData;
  	this.totalViolenceData = _totalViolenceData;
	this.displayData = []; // see data wrangling

    // set dimensions; size based on width of div to allow for easier styling with bootstrap
    this.width = $("#" + this.parentElement).width();
    this.height = _dimensions.height;
    this.margin = _dimensions.margin;
    this.selectedColors = _colorScale;

  	this.initVis();

};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function(){

    var vis = this;

	// size with margins accounted for
	vis.width = vis.width - vis.margin.left - vis.margin.right;
  	vis.height = vis.height - vis.margin.top - vis.margin.bottom;


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

	vis.yAxisGroup = vis.svg.append("g")
		.attr("class", "y-axis axis");

	// Area generator
    vis.area = d3.svg.area()
        .x(function(d) { return vis.x(d.date) })
        .y0(function(d) { return vis.y(d.y0) })
        .y1(function(d) { return vis.y(d.y + d.y0) });

    // set time range globally (to extent of data on initial load, user can filter later)
    dateRange = d3.extent(vis.totalViolenceData, function(d) {
       return d.date;
    });

    // TODO: Tooltip placeholder

	// filter and format data for stacked area chart
  	vis.wrangleData();

};



/*
 * Data wrangling
 */
StackedAreaChart.prototype.wrangleData = function(){
	var vis = this;

    // TODO get user data selection and update appropriately (later allow for district level data and selection)
    var selectedOption = "totalViolenceData";

    // wrangle aggregate data TODO fix for district level data also
    vis.displayData = vis[selectedOption];

    // filter by date
    vis.displayData = vis.displayData.filter(filterByDate);

    var dataCategories = ["df", "idf", "ied_total", "suicide"];
    vis.displayData = dataCategories.map(function(category) {
        return {
            name: category,
            values: vis.displayData.map(function(d) {
                return {date: d.date, y: d[category]};
            })
        };
    });


    // init stack layout
    var stack = d3.layout.stack()
        .values(function(d) { return d.values; });

    // stack data
    this.displayData = stack(this.displayData);

	// Update the visualization
  	vis.updateVis();

};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
StackedAreaChart.prototype.updateVis = function(){
	var vis = this;

    // update the axes
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
	vis.y.domain([0, d3.max(vis.displayData, function(d) {
			return d3.max(d.values, function(e) {
                return e.y0 + e.y;
			});
		})
	]);
    vis.x.domain(dateRange);

    // update color scale
    var categoryNames = vis.displayData.map(function(d) {
        return d.name;
    });
    vis.colorScale
        .domain(categoryNames)
        .range(colorbrewer[vis.selectedColors][categoryNames.length]);

    // Call axis functions with the new domain
    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);

	// Draw the layers
	var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);
  
  	categories.enter().append("path")
		.attr("class", "area");

  	categories
		.style("fill", function(d) {
			return vis.colorScale(d.name);
  		})
  		.attr("d", function(d) {
			return vis.area(d.values);
      	});

	categories.exit().remove();

    // TODO: update tooltip text


};
