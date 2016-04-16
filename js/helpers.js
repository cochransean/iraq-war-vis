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
 *      endWeek: the week you want to convert to a date object
 *      startDate: the date object representing the first day of the data set (reference ESOC code book)
 *      startWeek: the int representing the numeric value of the starting week in the ESOC dataset (earliest in the set)
 *
 * Returns: A javascript date object corresponding to the week from the ESOC dataset
 */
function convertWeekToDate(endWeek, startWeek, startDate) {

    const MS_IN_DAY = 86400000;
    var daysElapsed = (endWeek - startWeek) * 7;
    return new Date(startDate.getTime() + daysElapsed * MS_IN_DAY);
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
    var numericFields = ["SIGACT", "SIG_1", "df", "idf", "suicide", "ied_attack", "ied_clear", "ied_total", "week"];

    // dates per code book and data
    var startDate = new Date(2004, 1, 1);
    var startWeek = 2292;

    return array.map(function(value) {
        numericFields.forEach(function(field) {
            value[field] = +value[field];
        });

        // convert date
        value.date = convertWeekToDate(value.week, startWeek, startDate);

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

    // fields to convert to numbers
    var numericFields = ["sunni_pop_CIA_1978", "kurd_pop_CIA_1978", "shia_pop_CIA_1978", "total_pop_CIA_1978",
        "sunni_pop_CIA_2003", "kurd_pop_CIA_2003", "shia_pop_CIA_2003" , "total_pop_CIA_2003", "sunni_pop_CIA_1992",
        "kurd_pop_CIA_1992", "shia_pop_CIA_1992", "total_pop_CIA_1992", "landscan_pop", "shiapop", "sunnipop", "kurdpop",
        "xtianpop", "turcpop", "mixedpop"];

    array.forEach(function(value) {
        ethnicDataObject[value.district] = {};
        ethnicDataObject[value.district].ShareShia = value.shia_pop_CIA_2003 / value.total_pop_CIA_2003;
        ethnicDataObject[value.district].ShareSunni = value.sunni_pop_CIA_2003 / value.total_pop_CIA_2003;
        ethnicDataObject[value.district].ShareKurdish = value.kurd_pop_CIA_2003 / value.total_pop_CIA_2003;
    });

    return ethnicDataObject;
}