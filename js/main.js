
// variables for data
var iraqMapDistricts = [];
var iraqMapPlaces = [];
var iraqMapExteriorBorders;
var districtViolenceData = [];
var totalViolenceData = [];
var DistrictData;
var troopNumbersData;
var usCasualtiesMonthData;
var civilianCasualtiesData;
var civilianCasualtiesMonthly;
var eventsData;

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
        .defer(d3.csv, "data/us-troop-numbers-month.csv")
        .defer(d3.csv, "data/us-troop-casualties-by-month.csv")
        .defer(d3.csv, "data/Civilian-Casualty-Data.csv")
        .defer(d3.csv, "data/timeline-data.csv")
        .defer(d3.csv, "data/Natural-Resource-Data.csv")
        .defer(d3.csv, "data/Household-Income-Size-Unemployment.csv")
        .await(function(error, districtData, placeData, districtViolence, countryViolence,
                ethnicData, troopNumbers,usCasualtiesMonth, civilianCasualties, events, OilGas, Unemployment){

            // if error, print and return
            if (error) {
                console.log(error);
            }

            iraqMapDistricts = topojson.feature(districtData, districtData.objects.Iraq_districts).features;

            // load ethnic data in object with key as district for use by multiple visualizations
            DistrictData = prepDistrictData(ethnicData, OilGas, Unemployment);

            iraqMapExteriorBorders = topojson.mesh(districtData, districtData.objects.Iraq_districts, function(a, b) {
                return a === b;
            });
            iraqMapPlaces = topojson.feature(placeData, placeData.objects.places).features;

            // convert violence data as required (to numeric data types)
            districtViolenceData = prepEsocMonthlyViolenceData(districtViolence);
            totalViolenceData = prepEsocMonthlyViolenceData(countryViolence);

            // prep troop data
            troopNumbersData = prepTroopNumbersData(troopNumbers);

            // prep US casualty data by month
            usCasualtiesMonthData = prepUsCasualtiesMonth(usCasualtiesMonth);

            // prep civ casualties data
            civilianCasualtiesData = prepCivilianCasualties(civilianCasualties);
            civilianCasualtiesMonthly = prepCivilianCasualtiesMonthly(civilianCasualtiesData);

            // prep timeline data
            eventsData = prepEvents(events);


            createVis();
        });

}

function createVis() {

    // Area chart with different dimensions from corresponding timeline select
    var areaChartDimensions = {
        "width": null,
        "heightRatio": 4/5,
        "margin": { top: 40, right: 40, bottom: 40, left: 80 }
    };
    areaChart = new StackedAreaChart("area-chart", areaChartDimensions, districtViolenceData, totalViolenceData,
        troopNumbersData, usCasualtiesMonthData, civilianCasualtiesMonthly, eventsData, "Set1");
    areaChart.initVis();
    $(document).on("datesChanged", function() { areaChart.wrangleData() });
    $("#circle-data").change(function() { areaChart.wrangleData() });

    // Timeline select: smaller version of area chart with brush functionality added
    var timeSelectDimensions = {
        "width": null,
        "heightRatio": 1/5,
        "margin": { top: 10, right: 40, bottom: 45, left: 80 }
    };
    timeSelect = new TimeSelect("area-chart", timeSelectDimensions, districtViolenceData, totalViolenceData,
        troopNumbersData, usCasualtiesMonthData, civilianCasualtiesMonthly, eventsData, "Greys");
    timeSelect.initVis();
    $("#circle-data").change(function() { timeSelect.wrangleData() });

    // Create map after timeline because timeline generates dates needed for map data selection
    iraqMap = new IraqMap("iraq-map", iraqMapDistricts, iraqMapExteriorBorders, iraqMapPlaces, districtViolenceData,
        DistrictData, civilianCasualtiesData);
    $("#district-level-data").change(function() { iraqMap.updateChoropleth() });
    $("#circle-data").change(function() { iraqMap.wrangleData() });
    $(document).on("datesChanged", function() { iraqMap.wrangleData() });
    $(document).on("dateRangeChanged", function() { iraqMap.wrangleData() });

}