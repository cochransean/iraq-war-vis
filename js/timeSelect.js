

/*
 * timeSelect - Extends StackedAreaChart, overriding properties as necessary to act as brush controls for overall vis
 *
 */

TimeSelect.prototype = StackedAreaChart.prototype;
TimeSelect.prototype.constructor = TimeSelect;

function TimeSelect(_parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                    _troopNumbersData, _usCasualtiesMonthData, _civCasualtiesMonthly, _eventsData, _colorScale) {
    StackedAreaChart.call(this, _parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                          _troopNumbersData, _usCasualtiesMonthData, _civCasualtiesMonthly, _eventsData, _colorScale);

    this.brush = d3.svg.brush()
        .on("brushend", brushend);

    this.initVis = function() {
        StackedAreaChart.prototype.initVis.call(this);
        var vis = this;

        // remove unneeded labels
        vis.yAxisGroup.remove();
        vis.xLabel.remove();

        // update axis for brush now that it exists
        vis.brush
            .x(vis.x);

        // add brush
        console.log("adding brush");
        vis.svg.append("g")
            .attr("class", "x brush")
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);

    };

    this.updateUI = function() {

        // override (not needed on timeline)
        return false

    };

    this.addTooltipElements = function() {

        var vis = this;

        // Remove then append brush component (to prevent overlap)
        vis.svg.selectAll(".brush")
            .remove();

        console.log("updating brush");
        vis.svg.append("g")
            .attr("class", "x brush")
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);
    }
}