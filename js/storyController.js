/**
 * Object constructor for a controller to advance the storytelling elements of the map and timeline.
 *
 * Arguments: button IDs from DOM for forward and back functionality
 */

StoryController = function(nextButtonID, backButtonID, exitID) {
    var controller = this;

    controller.backgroundSelect = $("#district-level-data");
    controller.dataSelect = $("#circle-data");
    controller.nextButton = $("#" + nextButtonID);
    controller.backButton = $("#" + backButtonID);
    controller.exitButton = $("#" + exitID);

    // boxes to highlight info on map
    controller.southHighlight = iraqMap.svg.append("rect")
        .attr("class", "highlightRect")
        .style("stroke-width", 0.002 * iraqMap.projectionScale) // make responsive
        .call(controller.hideRect);


    controller.northHighlight = iraqMap.svg.append("rect")
        .attr("class", "highlightRect")
        .style("stroke-width", 0.002 * iraqMap.projectionScale) // make responsive
        .call(controller.hideRect);

    // call views function (closure is needed to ensure sub-functions know what "this" is
    controller.views = controller.views();


    // add listeners for buttons
    controller.nextButton.on("click", function() { controller.advanceView(1) });
    controller.backButton.on("click", function() { controller.advanceView(-1) });

    // get max and min slides to make sure repeated button presses don't go into number ranges not corresponding to slide
    controller.minSlide = 0;
    controller.maxSlide = d3.keys(controller.views).length - 1;

    // create a rectangle to display the extent of dates changed in storytelling mode
    controller.extentRectangle = timeSelect.svg.append("rect")
        .attr("class", "story-extent");

    controller.enterStory(0);

};

StoryController.prototype.enterStory = function(slideNumber) {

    var controller = this;
    storyMode = true;

    // remove brush elements to prevent user date changes
    timeSelect.svg.selectAll(".brush").remove();

    // change the text on the button to indicate that it exits story mode and update functionality
    controller.exitButton.text("Exit Story Mode");

    // select d3's brush extent and make disappear by altering width
    timeSelect.svg.selectAll(".extent").attr("width", 0);

    // reset current view
    controller.currentView = slideNumber;

    // display first slide
    controller.views[controller.currentView].setup();

    // remove then add listeners for exit button (to prevent repeated calls)
    controller.exitButton.off();
    controller.exitButton.on("click", function() { controller.exitStory() });

    // disable user selections initially
    controller.backgroundSelect.attr("disabled", "true");
    controller.dataSelect.attr("disabled", "true");

};


// object with functions to set up each view (essentially instructions to make slides)
StoryController.prototype.views = function() {

    var controller = this;
    return [

        {
            'setup': function () {
                // set selects (whatever first slide is, needs this line)
                controller.backButton.prop('disabled', true);
                controller.nextButton.prop('disabled', false);

                // update highlighted event
                highlightedEvent = "event12";

                // set data
                controller.backgroundSelect.val("ethnicHomogeneity");
                controller.dataSelect.val("totalViolenceData");

                // set dates
                controller.changeDates("Sun Feb 01 2004 00:00:00 GMT-0500 (EST)", "Fri Jul 06 2007 22:28:54 GMT-0400 (EDT)");

                // set text
                $("#information-headline").text("In early 2006, violence rose dramatically");
                $("#information-subtitle").text("Al Qaeda's bombing of the the Shia al-Askari mosque in Samarra, a Shia holy site, set off violent sectarian conflict.");
            },

            'cleanup': function () {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();
            }
        },

        {
            'setup': function() {

                // set selects (whatever second slide is, needs this line)
                controller.backButton.prop('disabled', false);

                // offset tip since it's near the edge
                areaChart.timelineTooltip.offset([areaChart.height / 2, 0.28 * areaChart.width]);

                // update highlighted event
                highlightedEvent = "event17";

                // set data
                controller.backgroundSelect.val("ethnicHomogeneity");
                controller.dataSelect.val("totalViolenceData");

                // set dates
                controller.changeDates("Sun Dec 31 2006 00:28:38 GMT-0500 (EST)", "Sun Feb 01 2009 00:00:00 GMT-0500 (EST)");

                // set text
                $("#information-headline").text("In summer of 2007, violence began to fall");
                $("#information-subtitle").text("The US's \"surge\" strategy, along with the Sunni Awakening was credited with the striking reduction.");
            },

            'cleanup': function () {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // reset offset
                areaChart.timelineTooltip.offset([areaChart.height / 2, 0]);
            }
        },

        {

            'setup': function() {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // hide any showing rectangles
                controller.southHighlight
                    .call(controller.hideRect);
                controller.northHighlight
                    .call(controller.hideRect);

                // update highlighted event
                highlightedEvent = false;

                // set data
                controller.backgroundSelect.val("ethnicHomogeneity");
                controller.dataSelect.val("ied_total");

                // trigger update
                controller.changeDates();

                // set text
                $("#information-headline").text("Most violent incidents involved Improvised Explosive Devices (IEDs)");
                $("#information-subtitle").text("IED events peaked in June 2007, with 3106 IEDs reported.");
            },

            'cleanup': function () {

                return false
            }

        },

        {
            'setup': function () {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // clean up previous slide
                areaChart.timelineTooltip.offset([areaChart.height / 2, 0]);

                // reset color (always in case transition was in progress)
                controller.backgroundSelect.val("ethnicHomogeneity");
                iraqMap.updateChoropleth();

                // update highlighted event
                highlightedEvent = false;

                // set data
                controller.dataSelect.val("totalViolenceData");

                // append rectangles to highlight the data
                // scales rectangles based on projection, not on width (sometimes height is used for scaling)
                var southLocation = iraqMap.projection([42.12506142018065, 33.21713792358125]);
                controller.southHighlight
                    .transition()
                    .duration(1500)
                    .attr("transform", "translate(" + southLocation[0] + "," + southLocation[1] + ") rotate(-45)")
                    .attr("width", 0.06 * iraqMap.projectionScale)
                    .attr("height", 0.05 * iraqMap.projectionScale);

                var northLocation = iraqMap.projection([41.85, 37.15]);
                controller.northHighlight
                    .transition()
                    .duration(1500)
                    .attr("transform", "translate(" + northLocation[0] + "," + northLocation[1] + ")")
                    .attr("width", 0.055 * iraqMap.projectionScale)
                    .attr("height", 0.05 * iraqMap.projectionScale);

                // set dates
                controller.changeDates();

                // set text
                $("#information-headline").text("Most violence occurred along ethnic fault lines");
                $("#information-subtitle").text("Purple areas on the map indicate Iraq's most ethnically mixed districts.");
            },

            'cleanup': function () {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // hide rectangles
                controller.southHighlight
                    .call(controller.hideRect);
                controller.northHighlight
                    .call(controller.hideRect);

                // stop any current transitions
                iraqMap.districts
                    .interrupt()
                    .transition();
            }
        },

        {

            'setup': function() {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // update rectangles
                var northLocation = iraqMap.projection([42.8, 37.4]);
                controller.northHighlight
                    .transition()
                    .duration(1500)
                    .attr("transform","translate(" + northLocation[0] + "," + northLocation[1] + ") rotate(40)")
                    .attr("width", 0.08 * iraqMap.projectionScale)
                    .attr("height", 0.045 * iraqMap.projectionScale);

                // set data
                controller.backgroundSelect.val("OilGas");
                controller.dataSelect.val("totalViolenceData");

                // update the map and when transitions are complete, initiate another toggle between background colors
                dispatch.on("mapBackgroundChanged", function() { setTimeout(cycleBackground, 1500) });
                iraqMap.updateChoropleth();
                controller.changeDates();

                // set text
                $("#information-headline").text("Many oil reserves are located on an ethnic fault line");
                $("#information-subtitle").text("Equitably splitting these valuable reserves has proved difficult for Iraq's leaders, challenging political reconciliation.");

                function cycleBackground() {

                    // switch to opposite value but only if still on this slide
                    if (controller.currentView == 4) {
                        var newValue = controller.backgroundSelect.val() == "OilGas" ? "ethnicHomogeneity": "OilGas";
                        controller.backgroundSelect.val(newValue);
                        iraqMap.updateChoropleth();
                    }
                }
            },

            'cleanup': function() {

                // hide any showing tooltips
                areaChart.timelineTooltip.hide();

                // remove dispatch
                dispatch.on("mapBackgroundChanged", null);

                // update rectangles
                controller.northHighlight
                    .call(controller.hideRect);

                // stop any current transitions
                iraqMap.districts
                    .interrupt()
                    .transition();

                // remove listener
                dispatch.on("mapBackgroundChanged", null);
            }
        },

        {
            'setup': function() {

                // update highlighted event
                highlightedEvent = "event3";

                // set data
                controller.backgroundSelect.val("ethnicHomogeneity");
                iraqMap.updateChoropleth();
                controller.dataSelect.val("fatalities");

                // offset tip since it's near the edge
                areaChart.timelineTooltip.offset([areaChart.height / 1.3, 0.29 * areaChart.width]);

                // set dates
                controller.changeDates();

                // change color so highlight line is apparent
                areaChart.svg.selectAll(".stacked-category").style("fill", "#984EA3");

                // set text
                $("#information-headline").text("Few predicted the length and costs of the war");
                $("#information-subtitle").text("In the 13 years since President Bush's \"Mission Accomplished\" speech, 4318 US Soldiers were killed");
            },

            'cleanup': function() {

                // stop any current transitions
                iraqMap.districts
                    .interrupt()
                    .transition();

                // reset offset
                areaChart.timelineTooltip.offset([areaChart.height / 2, 0]);
            }
        },

        {
            'setup': function() {

                // set data
                controller.backgroundSelect.val("ethnicHomogeneity");
                controller.dataSelect.val("totalViolenceData");
                controller.exitStory();
            },

            'cleanup': function() {
                return false
            }
        }

    ]

};

StoryController.prototype.advanceView = function(incrementAmount) {
    var controller = this;

    // first, cleanup current slide
    controller.views[controller.currentView].cleanup();

    // increment view
    controller.currentView += incrementAmount;

    // factor for repeated button presses that can take current view out of slide range
    if (controller.currentView < controller.minSlide) {
         controller.currentView = controller.minSlide;
    }
    else if (controller.currentView > controller.maxSlide) {
        controller.currentView = controller.maxSlide;
    }

    controller.views[controller.currentView].setup();
};


// exits the storytelling mode and gives user all controls
StoryController.prototype.exitStory = function() {
    var controller = this;
    storyMode = false;

    // cleanup current slide
    controller.views[controller.currentView].cleanup();

    // update highlighted event
    highlightedEvent = false;

    // hide any tooltips showing
    areaChart.timelineTooltip.hide();

    // change the text on the button to indicate that it reenters story mode and update button functionality too
    controller.exitButton.text("Enter Story Mode");
    controller.exitButton.off();
    controller.exitButton.on("click", function() { controller.enterStory(0) });

    // set dates to entire extent of data
    controller.changeDates();

    controller.backgroundSelect.removeAttr("disabled");
    controller.dataSelect.removeAttr("disabled");
    controller.backButton.prop('disabled', true);
    controller.nextButton.prop('disabled', true);

    // add text
    $("#information-headline").text("Explore the data on your own");
    $("#information-subtitle").text("Use the select boxes to filter by category and the grey timeline to filter by date");

    // change width of rectangle to make it go away
    controller.extentRectangle
        .attr("width", 0);

    // add brush elements
    timeSelect.svg.append("g")
        .attr("class", "x brush")
        .call(timeSelect.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", timeSelect.height + 7);

};


// updates brush extent and date object itself (so visuals and dates selected match); if no args resets dates
StoryController.prototype.changeDates = function(dateString1, dateString2) {
    var controller = this;

    var newDateRange = dateString1 && dateString2 ? [new Date(dateString1), new Date(dateString2)] :
        d3.extent(timeSelect[timeSelect.subcategoryToCategory[controller.dataSelect.val()]], function(d) {
            return d.date;
        });

    // if dates haven't actually changed, trigger regular update (affects transitions)
    if (newDateRange[0].getTime() == dateRange[0].getTime() && newDateRange[1].getTime() == dateRange[1].getTime()) {
        $("#circle-data").trigger("change");
    }

    // if dates have changed trigger date change so transitions work as should
    else {
        dateRange = newDateRange;

        $(document).trigger("datesChanged");

        // update extent rectangle to match display
        controller.extentRectangle
            .transition()
            .duration(1500)
            .attr("x", function() { return timeSelect.x(dateRange[0])})
            .attr("y", -6)
            .attr("height", function() { return timeSelect.height + 7 })
            .attr("width", function() { return timeSelect.x(dateRange[1]) - timeSelect.x(dateRange[0])});
    }

};

// used via .call to hide rectangles when done with them
StoryController.prototype.hideRect = function(selection) {
    selection
        .transition()
        .duration(1500)
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform","rotate(0)")
        .attr("transform", "translate(0,0)")
        .attr("width", 0)
        .attr("height", 0);
};
