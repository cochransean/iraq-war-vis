
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapRoads = [];
var iraqMapPlaces = [];
var iraqMapAirport = [];
var iraqMapExteriorBorders;

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var iraqMap, baghdadMap, areachart, timeline;


// Start application by loading the data
loadData();

function loadData() {

    // Use the Queue.js library to read two files
    // TODO we might want to rethink how all this is loaded once we've got more included; some vis's might be able
    // TODO to load and go while others (further down page can load after first vis's are already display loading
    queue()
        .defer(d3.json, "data/iraq-topo.json")
        .defer(d3.json, "data/waterways.json")
        .defer(d3.json, "data/places.json")
        .defer(d3.json, "data/baghdad-airport.json")
        .await(function(error, districtData, waterData, placeData, airportData){

            // if error, print and return
            if (error) {
                console.log(error);
            }

            iraqMapDistricts = topojson.feature(districtData, districtData.objects.Iraq_districts).features;
            iraqMapExteriorBorders = topojson.mesh(districtData, districtData.objects.Iraq_districts, function(a, b) {
                return a === b;
            });
            iraqMapWater = topojson.feature(waterData, waterData.objects.waterways).features;
            iraqMapPlaces = topojson.feature(placeData, placeData.objects.places).features;
            iraqMapAirport = topojson.feature(airportData, airportData.objects.SDE_BAGH_AIRPRT).features;

            createVis();
        });

}

function createVis() {

	iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapExteriorBorders, iraqMapPlaces);
    baghdadMap = new BaghdadMap("baghdad-map", iraqMapDistricts, iraqMapWater, iraqMapAirport);

}


function brushed() {

	// TO-DO: React to 'brushed' event
}
