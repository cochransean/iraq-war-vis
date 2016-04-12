
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapPlaces = [];
var iraqMapAirport = [];
var iraqMapExteriorBorders;
var districtViolenceData = [];
var totalViolenceData = [];

// globals for linking of map and stacked area chart
const minWeek = 2292;
const maxWeek = 2555;
var weekRange = [minWeek, maxWeek]; // TODO make this dynamically update with brush


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

            // convert violence data as required (to numeric data types)
            var numericFields = ["SIGACT", "SIG_1", "df", "idf", "suicide",
                "ied_attack", "ied_clear", "ied_total", "week"];
            districtViolenceData = convertToNumeric(districtViolence, numericFields);
            totalViolenceData = convertToNumeric(countryViolence, numericFields);

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
 * Use: Provide this as an argument for .filter(). Example: array.filter(filterByWeek);
 */
function filterByWeek(arrayDataPoint) {
    if (arrayDataPoint.week >= weekRange[0] && arrayDataPoint.week <= weekRange[1]) {
        return true
    }
}


/*
 * Convert week from data set to date object
 *
 * Arguments:
 *      endWeek: the week you want to convert to a date object
 *      startDate: the date object representing the first day of the data set (reference ESOC code book)
 *      startWeek: the int representing the numeric value of the starting week in the ESOC dataset (earliest in the set)
 *
 * Returns: A javascript date object corresponding to the week from the ESOC dataset
 */
function convertWeekToDate(endWeek, startDate, startWeek) {

    const MS_IN_DAY = 86400000;
    var daysElapsed = endWeek - startWeek;
    new Date(startDate.getTime() + daysElapsed * MS_IN_DAY);
}


/*
 * Convert numeric strings from csv into actual numeric data types
 *
 * Arguments:
 *      array: the array of objects that you want to convert
 *      fields: the fields from each object that need to be converted
 *
 * Returns: The data-set converted
 */
function convertToNumeric(array, fields) {

    return array.map(function(value) {
        fields.forEach(function(field) {
            value[field] = +value[field];
        });
        return value
    });
}