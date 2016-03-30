
// Will be used to the save the loaded JSON data
var allData = [];

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var areachart, timeline;


// Start application by loading the data
loadData();

function loadData() {

	// load data

}

function createVis() {

	// TO-DO: Instantiate visualization objects here
	// areachart = new ...

}


function brushed() {

	// TO-DO: React to 'brushed' event
}
