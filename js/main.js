
// variables for data
var iraqMapDistricts = [];
var iraqMapWater = [];
var iraqMapPlaces = [];
var iraqMapAirport = [];
var iraqMapExteriorBorders;
var districtViolenceData = [];
var totalViolenceData = [];
var ethnicDistrictData;

// globals for linking of map and stacked area chart
var dateRange;


// Variables for the visualization instances
var iraqMap, areaChart, timeSelect;


// Start application by loading the data
loadData();

function loadData() {

    // Use the Queue.js library to read two files
    // TODO we might want to rethink how all this is loaded once we've got more included; some vis's might be able
    // TODO to load and go while others (further down page can load after first vis's are already display loading
    queue()
        .defer(d3.json, "data/iraq-topo.json")
        .defer(d3.json, "data/places.json")
        .defer(d3.csv, "data/violence/Violence_district_level_month.csv")
        .defer(d3.csv, "data/violence/Violence_country_level_month.csv")
        .defer(d3.csv, "data/Ethnicity-Data.csv")
        .await(function(error, districtData, placeData, districtViolence, countryViolence,
                ethnicData){

            // if error, print and return
            if (error) {
                console.log(error);
            }

            iraqMapDistricts = topojson.feature(districtData, districtData.objects.Iraq_districts).features;

            // load ethnic data in object with key as district for use by multiple visualizations
            ethnicDistrictData = prepEthnicData(ethnicData);

            console.log(ethnicDistrictData);

            iraqMapExteriorBorders = topojson.mesh(districtData, districtData.objects.Iraq_districts, function(a, b) {
                return a === b;
            });
            iraqMapPlaces = topojson.feature(placeData, placeData.objects.places).features;

            // convert violence data as required (to numeric data types)
            districtViolenceData = prepEsocWeeklyViolenceData(districtViolence);
            totalViolenceData = prepEsocWeeklyViolenceData(countryViolence);

            createVis();
        });

}

function createVis() {

    // Area chart with different dimensions from corresponding timeline select
    var areaChartDimensions = {
        "width": null,
        "heightRatio": 4/5,
        "margin": { top: 20, right: 40, bottom: 20, left: 45 }
    };
    areaChart = new StackedAreaChart("area-chart", areaChartDimensions, districtViolenceData, totalViolenceData, "Set1");
    $(document).on("datesChanged", function() { areaChart.wrangleData() });

    // Timeline select: smaller version of area chart with brush functionality added
    var timeSelectDimensions = {
        "width": null,
        "heightRatio": 1/5,
        "margin": { top: 20, right: 40, bottom: 20, left: 45 }
    };
    timeSelect = new TimeSelect("area-chart", timeSelectDimensions, districtViolenceData, totalViolenceData, "Greys");

    // Create map after timeline because timeline generates dates needed for map data selection
    iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapExteriorBorders, iraqMapPlaces, districtViolenceData,
        ethnicDistrictData);
    $("#district-level-data").change(function() { iraqMap.updateChoropleth() });
    $(document).on("datesChanged", function() { iraqMap.wrangleData() });

}