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
    d3.selectAll(".extent").attr("width", 0);

    // reset current view
    controller.currentView = slideNumber;

    // display first slide
    controller.views[controller.currentView.toString()]();

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
    return {

        '0': function() {

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

        '1': function() {

            // hide any showing tooltips
            areaChart.timelineTooltip.hide();

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

        '2': function() {

            // hide any showing tooltips
            areaChart.timelineTooltip.hide();

            // clean up previous slide
            areaChart.timelineTooltip.offset([areaChart.height / 2, 0]);

            // update highlighted event
            highlightedEvent = false;

            // set data
            controller.backgroundSelect.val("ethnicHomogeneity");
            controller.dataSelect.val("totalViolenceData");

            // set dates
            controller.changeDates();

            // set text
            $("#information-headline").text("Most violence occurred along ethnic fault lines");
            $("#information-subtitle").text("Red areas on the map indicate Iraq's most ethnically mixed districts.");

        },

        '3': function() {

            // hide any showing tooltips
            areaChart.timelineTooltip.hide();

            // update highlighted event
            highlightedEvent = false;

            // set data
            controller.backgroundSelect.val("ethnicHomogeneity");
            controller.dataSelect.val("ied_total");

            // trigger update (since dates haven't been changed which would otherwise trigger)
            controller.changeDates();

            // set text
            $("#information-headline").text("Most violent incidents involved Improvised Explosive Devices (IEDs)");
            $("#information-subtitle").text("IED events peaked in June 2007, with 3106 IEDs reported.");

        },

        '4': function() {

            // hide any showing tooltips
            areaChart.timelineTooltip.hide();

            // update highlighted event
            highlightedEvent = "event3";

            // set data
            controller.backgroundSelect.val("ethnicHomogeneity");
            controller.dataSelect.val("fatalities");

            // offset tip since it's near the edge
            areaChart.timelineTooltip.offset([areaChart.height / 2, 0.28 * areaChart.width]);

            // set dates
            controller.changeDates();

            // set text
            $("#information-headline").text("Few predicted the length and costs of the war");
            $("#information-subtitle").text("In the 13 years since President Bush's \"Mission Accomplished\" speech, 4318 US Soldiers were killed");

        },

        '5': function() {

            // clean up previous slide
            areaChart.timelineTooltip.offset([areaChart.height / 2, 0]);

            controller.exitStory();
        }

    }

};

StoryController.prototype.advanceView = function(incrementAmount) {
    var controller = this;
    controller.currentView += incrementAmount;
    var currentViewString;

    // factor for repeated button presses that can take current view out of slide range
    if (controller.currentView < controller.minSlide) {
         currentViewString = controller.minSlide.toString();
    }
    else if (controller.currentView > controller.maxSlide) {
        currentViewString = controller.maxSlide.toString();
    }
    else {
        currentViewString = controller.currentView.toString();
    }

    controller.views[currentViewString]();
};


// exits the storytelling mode and gives user all controls
StoryController.prototype.exitStory = function() {
    var controller = this;
    storyMode = false;

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
    $("#information-subtitle").text("Use the select boxes to filter by category and the gray timeline to filter by date");

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

    console.log(d3.extent(timeSelect[timeSelect.subcategoryToCategory[controller.dataSelect.val()]]));

    var newDateRange = dateString1 && dateString2 ? [new Date(dateString1), new Date(dateString2)] :
        d3.extent(timeSelect[timeSelect.subcategoryToCategory[controller.dataSelect.val()]], function(d) {
            return d.date;
        });

    // if dates haven't actually changed, trigger regular update (affects transitions)
    if (newDateRange[0].getTime() == dateRange[0].getTime() && newDateRange[1].getTime() == dateRange[1].getTime()) {
        console.log('same dates');
        $("#circle-data").trigger("change");
    }

    // if dates have changed trigger date change so transitions work as should
    else {
        dateRange = newDateRange;
        console.log('controller says dates changed');

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
