

/*
 * timeSelect - Extends StackedAreaChart, overriding properties as necessary to act as brush controls for overall vis
 *
 */

TimeSelect.prototype = StackedAreaChart.prototype;
TimeSelect.constructor = TimeSelect;

function TimeSelect(_parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                    _troopNumbersData, _colorScale) {
    StackedAreaChart.call(this, _parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                          _troopNumbersData, _colorScale);

    var vis = this;

    // remove y-axis
    vis.yAxisGroup.remove();

    // remove update functionality so vis doesn't update with brushes
    $("#" + vis.parentElement).off("datesChanged");

    // Initialize brush component
    vis.brush = d3.svg.brush()
        .x(vis.x)
        .on("brushend", brushend);

    // Append brush component
    vis.svg.append("g")
        .attr("class", "x brush")
        .call(vis.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

}
