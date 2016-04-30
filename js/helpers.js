/**
 * Helper functions for the visualization
 */


/*
 * React to brush events on the time select
 */
function brushend() {

    // globally update dates
    dateRange = niceExtent(timeSelect.brush.extent());

    // if brush has been deselected, select all
    if (timeSelect.brush.empty()) {
        dateRange = timeSelect.x.domain();
    }

    // announce change with event handler
    $(document).trigger("datesChanged");

    function niceExtent(dateArray) {
        var nicedDates = [];
        nicedDates.push(niceDate(dateArray[0]));
        nicedDates.push(niceDate(dateArray[1]));
        return nicedDates
    }

}


/*
 * This filters by week using the global variable "dateRange". The min is represented by the 0 position in the week
 * range array; the max by 1 position.
 *
 * Use: Provide this as an argument for .filter(). Example: array.filter(filterByDate);
 */
function filterByDate(arrayDataPoint) {
    if (arrayDataPoint.date >= dateRange[0] && arrayDataPoint.date <= dateRange[1]) {
        return true
    }
}

/* filter events based on the current zoom level and the importance from the event dataset */
function filterByImportance(arrayDataPoint) {
    var currentRangeInDays = (dateRange[1] - dateRange[0]) / 86400000;
    const ALL_THRESHOLD = 730;
    const HIGH_THRESHOLD = 1460;
    if (currentRangeInDays < ALL_THRESHOLD) {
        return true
    }
    else if (currentRangeInDays >= ALL_THRESHOLD && currentRangeInDays <= HIGH_THRESHOLD) {
        return arrayDataPoint.importance == "Very High" ||  arrayDataPoint.importance == "High"
    }
    else {
        return arrayDataPoint.importance == "Very High"
    }

}


/*
 * Convert week from data set to date object
 *
 * Arguments:
 *      endMonth: the month you want to convert to a date object
 *      startDate: the date object representing the first day of the data set (reference ESOC code book)
 *      startMonth: the int representing the numeric value of the starting week in the ESOC dataset (earliest in the set)
 *
 * Returns: A javascript date object corresponding to the week from the ESOC dataset
 */
function convertMonthToDate(endMonth, startMonth, startDate) {
    var monthsElapsed = endMonth - startMonth;
    var convertedDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + monthsElapsed));
    return convertedDate
}


/*
 * Convert numeric strings from csv into actual numeric data types and convert date
 *
 * Arguments:
 *      array: the array of objects that you want to convert
 *
 * Returns: The data-set converted
 */
function prepEsocMonthlyViolenceData(array) {
    var numericFields = ["SIGACT", "SIG_1", "df", "idf", "suicide", "ied_attack", "ied_clear", "ied_total", "month"];

    // dates per code book and data
    var startDate = new Date(2004, 1, 1);
    var startMonth = 529;

    return array.map(function (value) {
        numericFields.forEach(function (field) {
            value[field] = +value[field];
        });

        // convert date
        value.date = convertMonthToDate(value.month, startMonth, startDate);

        // aggregate totals for later use
        value.totalViolenceData = value["ied_total"] + value.df + value.idf;

        return value
    });
}

/*
 * Preps ethnic data by arranging in object with key as district name
 *
 * Arguments:
 *      array of ethnic data
 *
 * Returns:
 *      an object arranged with key as district and numeric strings converted to numeric data types
 */
function prepDistrictData(Eth, Oil, Unem) {

    var districtDataObject = {};

    Eth.forEach(function (value) {
        districtDataObject[value.district] = {};

        var Shia = value.shia_pop_CIA_2003 / value.total_pop_CIA_2003;
        var Sunni = value.sunni_pop_CIA_2003 / value.total_pop_CIA_2003;
        var Kurdish = value.kurd_pop_CIA_2003 / value.total_pop_CIA_2003;

        districtDataObject[value.district].Shia = Shia;
        districtDataObject[value.district].Sunni = Sunni;
        districtDataObject[value.district].Kurdish = Kurdish;

        if (Shia == 1) {
            districtDataObject[value.district].Composition = "Shia";
        }
        if (Sunni == 1) {
            districtDataObject[value.district].Composition = "Sunni";
        }
        if (Kurdish == 1) {
            districtDataObject[value.district].Composition = "Kurdish";
        }
        if (Shia != 0 && Sunni != 0 && Kurdish == 0) {
            districtDataObject[value.district].Composition = "Shia and Sunni"
        }
        if (Shia != 0 && Sunni == 0 && Kurdish != 0) {
            districtDataObject[value.district].Composition = "Shia and Kurdish"
        }
        if (Shia == 0 && Sunni != 0 && Kurdish != 0) {
            districtDataObject[value.district].Composition = "Sunni and Kurdish"
        }
        if (Shia != 0 && Sunni != 0 && Kurdish != 0) {
            districtDataObject[value.district].Composition = "Shia, Sunni and Kurdish"
        }

        // take standard deviation of each as a measure of the amount of ethnic mixing in each district (lower is more
        // heterogeneous)
        var ethnicHomogeneity = Math.pow(((Math.pow(Shia, 2) + Math.pow(Sunni, 2) + Math.pow(Kurdish, 2)) / 3), 0.5);
        districtDataObject[value.district].ethnicHomogeneity = ethnicHomogeneity;

    });

    // Takes too long. I could delete all irrelevant data manually from csv, but that's lame. 
    Oil.forEach(function (value) {

        if (value.YEAR == 2004 && value.MONTH == 1) {
            districtDataObject[value.District].OilGas = parseFloat(value.dist_resv);
        }

    });

    // This data seems super unreliable.
    Unem.forEach(function (value) {

        if (value.year == 2006) {
            districtDataObject[value.district].Unemployment = parseFloat(value.urate);
        }
    });

    return districtDataObject;
}

/*
 * Preps troop number data
 *
 * Arguments: array of troop number data
 * Returns: formatted array
 */
function prepTroopNumbersData(array) {

    // create d3 date format
    var dateFormat = d3.time.format("%B %Y");

    var preppedData = array.map(function (value) {

        // turn string date into date object TODO later update this to reflect troop numbers are at end of month
        var formattedDate = dateFormat.parse(value["Month (end of)"]);
        return {
            "date": formattedDate,
            "usTroops": +value["US troops"],
            "intTroops": +value["Total international troops"]
        }

    });
    return preppedData
}

/*
 * Converts abbreviations from the data set to pretty-printed full text for display
 *
 * Arguments: abbreviation from dataset (string)
 * Returns: pretty-printed full-text string
 */
function convertAbbreviation(abbreviation) {

    var abbreviationMapping = {
        'ied_total': 'IEDs',
        'df': 'Direct Fire (Gunfire)',
        'idf': 'Indirect Fire (Mortars, Rockets)',
        'suicide': 'Suicide Bombing',
        'usTroops': 'US Troops',
        'intTroops': 'International Troops',
        'wounded': "Wounded",
        'fatalities': "Fatalities",
        'min-civilian': "Minimum Estimate of Fatalities",
        'max-civilian': "Maximum Estimate of Fatalities",
        'delta': "Additional Fatalities Under Worst Estimate"
    };


    return abbreviationMapping[abbreviation]
}


/*
 * Preps data for use
 *
 * Arguments: array of raw data
 * Returns: Data formatted with numeric data types where appropriate
 */
function prepUsCasualtiesMonth(array) {

    // create d3 date format
    var dateFormat = d3.time.format("%b-%y");

    return array.map(function (value) {

        var formattedDate = dateFormat.parse(value["Period"]);
        return {
            "date": formattedDate,
            "fatalities": +value["Fatalities"],
            "wounded": +value["Wounded"]
        }

    });
}

function prepCivilianCasualties(array) {

    // create d3 date format
    var dateFormat = d3.time.format("%d-%b-%y");

    // filter out data that can't be attributed to a district
    var preppedData = array.filter(function (value) {
            if (value["district"]) {
                return true
            }
    });

    preppedData = preppedData.map(function(value) {
        var formattedDate = dateFormat.parse(value["Start"]);
        var minCivilian = +value["Min"];
        var maxCivilian = +value["Max"];
        return {
            "date": formattedDate,
            "min-civilian": minCivilian,
            "max-civilian": maxCivilian,
            "delta": maxCivilian - minCivilian,
            "district": value["district"]
        }
    });

    return preppedData

}


// accepts the already-prepped daily data and converts to monthly data
function prepCivilianCasualtiesMonthly(array) {

    var preppedData = [];

    // track previous month so you know when to start new spot on array
    var previousMonth = 0;
    var previousYear = 0;
    var currentIndex = -1;

    array.forEach(function(value) {

        var currentMonth = value.date.getMonth();
        var currentYear = value.date.getFullYear();

        // check to see if we are on a new month
        if (currentMonth > previousMonth || currentYear > previousYear) {

            // if so, start on new spot on array
            currentIndex++;
            preppedData.push({
                "min-civilian": value["min-civilian"],
                "max-civilian": value["max-civilian"],
                "delta": value["delta"],
                "date": new Date(currentYear, currentMonth)
            });
        }

        // otherwise, must be on same month
        else {
            preppedData[currentIndex]["min-civilian"] += value["min-civilian"];
            preppedData[currentIndex]["max-civilian"] += value["max-civilian"];
            preppedData[currentIndex]["delta"] += value["delta"];
        }

        // update date of previous for check on next iteration
        previousMonth = currentMonth;
        previousYear = currentYear;

    });

    return preppedData
}


// prep events data for use
function prepEvents(array) {

    // create d3 date format
    var dateFormat = d3.time.format("%d-%b-%y");

    // track number for unique ID
    var i = 0;

    var preppedData = array.map(function(value) {
        i++;
        return {
            date: dateFormat.parse(value.Date),
            event: value.Event,
            importance: value.Importance,
            id: "event" + i
        }
    });

    return preppedData;

}

// takes a date and makes it match the closest true value found in the timeselect's data
function niceDate(date) {

    // bisector to get valid dates from mouse position
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    // get the surrounding dates
    var indexNextHigherDate = bisectDate(timeSelect.displayData[0].values, date),
        d0 = timeSelect.displayData[0].values[indexNextHigherDate - 1].date,
        d1 = timeSelect.displayData[0].values[indexNextHigherDate].date;

    // determine which potential date is closer to mouse position
    if (date - d0 > d1 - date) {
        var closestDate = d1;
    }

    else {
        closestDate = d0;
    }

    return closestDate
}


// used to tell when all transitions have finished
// http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
function endall(transition, callback) {
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
        .each(function() { ++n; })
        .each("end", function() { if (!--n) callback.apply(this, arguments); });
}