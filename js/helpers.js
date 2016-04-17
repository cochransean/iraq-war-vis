/**
 * Helper functions for the visualization
 */


/*
 * React to brush events on the time select
 */
function brushend() {

    console.log(timeSelect.brush.extent());

    // globally update dates
    dateRange = timeSelect.brush.extent();

    // announce change with event handler
    $(document).trigger( "datesChanged" );

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
function convertWeekToDate(endMonth, startMonth, startDate) {
    var monthsElapsed = endMonth - startMonth;
    var convertedDate = new Date(new Date(startDate).setMonth(startDate.getMonth()+monthsElapsed));
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
function prepEsocWeeklyViolenceData(array) {
    var numericFields = ["SIGACT", "SIG_1", "df", "idf", "suicide", "ied_attack", "ied_clear", "ied_total", "month"];

    // dates per code book and data
    var startDate = new Date(2004, 1, 1);
    var startMonth = 529;

    return array.map(function(value) {
        numericFields.forEach(function(field) {
            value[field] = +value[field];
        });

        // convert date
        value.date = convertWeekToDate(value.month, startMonth, startDate);

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
function prepEthnicData(array) {

    var ethnicDataObject = {};
    
    array.forEach(function(value) {
        ethnicDataObject[value.district] = {};

        var Shia = value.shia_pop_CIA_2003 / value.total_pop_CIA_2003;
        var Sunni = value.sunni_pop_CIA_2003 / value.total_pop_CIA_2003;
        var Kurdish = value.kurd_pop_CIA_2003 / value.total_pop_CIA_2003;

        ethnicDataObject[value.district].Shia = Shia;
        ethnicDataObject[value.district].Sunni = Sunni;
        ethnicDataObject[value.district].Kurdish = Kurdish;

        if (Shia == 1) { ethnicDataObject[value.district].Composition = "Shia"; }
        if (Sunni == 1) { ethnicDataObject[value.district].Composition = "Sunni"; }
        if (Kurdish == 1) { ethnicDataObject[value.district].Composition = "Kurdish"; }
        if (Shia != 0 && Sunni != 0 && Kurdish == 0) { ethnicDataObject[value.district].Composition = "Shia and Sunni"}
        if (Shia != 0 && Sunni == 0 && Kurdish != 0) { ethnicDataObject[value.district].Composition = "Shia and Kurdish"}
        if (Shia == 0 && Sunni != 0 && Kurdish != 0) { ethnicDataObject[value.district].Composition = "Sunni and Kurdish"}
        if (Shia != 0 && Sunni != 0 && Kurdish != 0) { ethnicDataObject[value.district].Composition = "Shia, Sunni and Kurdish"}

    });

    return ethnicDataObject;
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

    var preppedData = array.map(function(value) {

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