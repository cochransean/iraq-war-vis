

/*
 * timeSelect - Extends StackedAreaChart, overriding properties as necessary to act as brush controls for overall vis
 *
 */

TimeSelect.prototype = StackedAreaChart.prototype;
TimeSelect.prototype.constructor = TimeSelect;

function TimeSelect(_parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                    _troopNumbersData, _usCasualtiesMonthData, _civCasualtiesMonthly, eventsData, _colorScale) {
    StackedAreaChart.call(this, _parentElement, _dimensions, _districtViolenceData, _totalViolenceData,
                          _troopNumbersData, _usCasualtiesMonthData, _civCasualtiesMonthly, eventsData, _colorScale);

    this.initVis = function() {
        StackedAreaChart.prototype.initVis.call(this);
        var vis = this;

        // remove unneeded labels
        vis.yAxisGroup.remove();
        vis.xLabel.remove();

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
    };

    this.updateUI = function() {

        // override this method (no UI updating on time select)
        return false
    };

    this.addTooltipElements = function() {

        // override this method (no tooltips)
        return false
    }
}