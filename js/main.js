
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapPlaces = [];
var iraqMapAirport = [];
var iraqMapExteriorBorders;
var districtViolenceData = [];
var totalViolenceData = [];

// globals for linking of map and stacked area chart
var dateRange;


// Variables for the visualization instances
var iraqMap, baghdadMap, areaChart, timeSelect;


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
        .defer(d3.csv, "Data/Ethnicity-Data.csv")
        .await(function(error, districtData, waterData, placeData, airportData, districtViolence, countryViolence,
                ethnicData){

            // if error, print and return
            if (error) {
                console.log(error);
            }

            iraqMapDistricts = topojson.feature(districtData, districtData.objects.Iraq_districts).features;

            // TODO: Load all the data that the Choropleth should be able to display and attach the data to the districts
            // TODO: So far, I only load in the ethnicity data, but more can be added
            for (var i = 0; i < ethnicData.length; i++) {
                for (var j = 0; j < iraqMapDistricts.length; j++) {
                    if (ethnicData[i].district == iraqMapDistricts[j].properties.ADM3NAME) {
                        iraqMapDistricts[j].properties.ShareShia = ethnicData[i].shia_pop_CIA_2003 / ethnicData[i].total_pop_CIA_2003;
                        iraqMapDistricts[j].properties.ShareSunni = ethnicData[i].sunni_pop_CIA_2003 / ethnicData[i].total_pop_CIA_2003;
                        iraqMapDistricts[j].properties.ShareKurdish = ethnicData[i].kurd_pop_CIA_2003 / ethnicData[i].total_pop_CIA_2003;
                        // "break" terminates the loop once the matching states have been found
                        break;
                    }
                }
            }

            iraqMapExteriorBorders = topojson.mesh(districtData, districtData.objects.Iraq_districts, function(a, b) {
                return a === b;
            });
            iraqMapWater = topojson.feature(waterData, waterData.objects.waterways).features;
            iraqMapPlaces = topojson.feature(placeData, placeData.objects.places).features;
            iraqMapAirport = topojson.feature(airportData, airportData.objects.SDE_BAGH_AIRPRT).features;

            // convert violence data as required (to numeric data types)
            districtViolenceData = prepEsocWeeklyViolenceData(districtViolence);
            totalViolenceData = prepEsocWeeklyViolenceData(countryViolence);

            createVis();
        });

}

function createVis() {

	iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapExteriorBorders, iraqMapPlaces);
    baghdadMap = new BaghdadMap("baghdad-map", iraqMapDistricts, iraqMapWater, iraqMapAirport);

    // Area chart with different dimensions from corresponding timeline select
    var areaChartDimensions = {
        "width": 800,
        "height": 400,
        "margin": { top: 40, right: 40, bottom: 40, left: 40 }
    };
    areaChart = new StackedAreaChart("area-chart", areaChartDimensions, districtViolenceData, totalViolenceData, "Set1");

    // add event listener for area chart
    $(document).on("datesChanged", function() { areaChart.wrangleData() });

    // Timeline select: smaller version of area chart with brush functionality added
    var timeSelectDimensions = {
        "width": areaChartDimensions.width,
        "height": 100,
        "margin": { top: 40, right: 40, bottom: 40, left: 40 }
    };
    timeSelect = new TimeSelect("area-chart", timeSelectDimensions, districtViolenceData, totalViolenceData, "Greys")

}