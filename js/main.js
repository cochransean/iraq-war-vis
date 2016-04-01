
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapRoads = [];
var iraqMapPoints = [];
var iraqMapPlaces = [];

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
    // TODO we might want to nest additional queues for the two maps underneath the district borders file (so each map
    // TODO can load exactly the files it needs instead of waiting on all files
    queue()
        .defer(d3.json, "data/iraq-topo.json")
        .defer(d3.json, "data/waterways.json")
        .defer(d3.json, "data/roads.json")
        .defer(d3.json, "data/points.json")
        .defer(d3.json, "data/places.json")
        .await(function(error, districtData, waterData, roadData, pointData, placeData){

            // if error, print and return
            if (error) {
                console.log(error);
                return
            }

            iraqMapDistricts = topojson.feature(districtData, districtData.objects.Iraq_districts).features;
            iraqMapWater = topojson.feature(waterData, waterData.objects.waterways).features;
            iraqMapRoads = topojson.feature(roadData, roadData.objects.roads).features;
            iraqMapPoints = topojson.feature(pointData, pointData.objects.points).features;
            iraqMapPlaces = topojson.feature(placeData, placeData.objects.places).features;

            // TODO delete this debug statement after it works
            console.log(iraqMapDistricts);
            console.log(iraqMapWater);
            console.log(iraqMapRoads);
            console.log(iraqMapPoints);
            console.log(iraqMapPlaces);
            createVis();
        });

}

function createVis() {

	iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapPlaces);
    baghdadMap = new BaghdadMap("baghdad-map", iraqMapDistricts, iraqMapWater, iraqMapRoads, iraqMapPoints);

}


function brushed() {

	// TO-DO: React to 'brushed' event
}
