
// variables for data
var iraqMapData = [];

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var iraqMap, areachart, timeline;


// Start application by loading the data
loadData();

function loadData() {

	// load data for map
    d3.json("data/iraq-topo.json", function(error, data) {

        // handle errors
        if (error) {
            console.log("Error loading data.  Error: " + error)
        }

        else {
            iraqMapData = topojson.feature(data, data.objects.Iraq_districts).features;

            // TODO delete this debug statement after it works
            console.log(iraqMapData);
            createVis();
        }

    });

}

function createVis() {

	iraqMap = new IraqMap("iraq-map", iraqMapData);

}


function brushed() {

	// TO-DO: React to 'brushed' event
}
