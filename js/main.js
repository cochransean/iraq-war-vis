
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapPlaces = [];
var iraqMapAirport = [];
var iraqMapExteriorBorders;
var districtViolenceData = [];
var totalViolenceData = [];

// globals for linking of map and stacked area chart
var weekRange = [2292, 2555]; // TODO make this dynamically update with brush


// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var iraqMap, baghdadMap, areaChart;


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
        .defer(d3.csv, "data/violence/Violence_district_level_week.csv")
        .defer(d3.csv, "data/violence/Violence_country_level_week.csv")
        .await(function(error, districtData, waterData, placeData, airportData, districtViolence, countryViolence){

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
            districtViolenceData = districtViolence;
            totalViolenceData = countryViolence;

            createVis();
        });

}

function createVis() {

	iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapExteriorBorders, iraqMapPlaces);
    baghdadMap = new BaghdadMap("baghdad-map", iraqMapDistricts, iraqMapWater, iraqMapAirport);
    areaChart = new StackedAreaChart("area-chart", districtViolenceData, totalViolenceData);

}


function brushed() {

	// TO-DO: React to 'brushed' event
}

/*
 * This filters by week using the global variable "weekRange". The min is represented by the 0 position in the week
 * range array; the max by 1 position.
 *
 * Use: provide this as an argument for .filter(). Example: array.filter(filterByWeek);
 */
function filterByWeek(arrayDataPoint) {
    if (arrayDataPoint.week >= weekRange[0] && arrayDataPoint.week <= weekRange[1]) {
        return true
    }
}

/*
 * Convert week to date object
 */
function convertWeekToDate(week) {

    // TODO need a function converting weeks from the data into data objects for use with our graphs
}
