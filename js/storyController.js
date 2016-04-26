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

    // save interaction elements to enable / disable interactions
    controller.interactionElements = d3.selectAll(".stacked-category, .brush, .area-background");

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

    // disable user interactions
    controller.interactionElements.style("pointer-events", "none");

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

            // set selects (whatever second slide is, needs this line)
            controller.backButton.prop('disabled', false);

            // set data
            controller.backgroundSelect.val("ethnicHomogeneity");
            controller.dataSelect.val("totalViolenceData");

            // set dates
            controller.changeDates("Thu May 31 2007 06:19:16 GMT-0400 (EDT)", "Sun Feb 01 2009 00:00:00 GMT-0500 (EST)");

            // set text
            $("#information-headline").text("In summer of 2007, violence began to fall");
            $("#information-subtitle").text("The US's \"surge\" strategy, along with the Sunni Awakening was credited with the striking reduction.");
        },

        '2': function() {
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

    // change the text on the button to indicate that it reenters story mode and update button functionality too
    controller.exitButton.text("Enter Story Mode");
    controller.exitButton.off();
    controller.exitButton.on("click", function() { controller.enterStory(0) });

    // set dates to entire extent of data
    dateRange = timeSelect.x.domain();
    $(document).trigger("datesChanged");

    // allow user interaction with brush and stacked area chart
    controller.interactionElements.style("pointer-events", "all");


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

};


// updates brush extent and date object itself (so visuals and dates selected match)
StoryController.prototype.changeDates = function(dateString1, dateString2) {
    var controller = this;
    dateRange = [new Date(dateString1), new Date(dateString2)];

    // update extent rectangle to match display
    controller.extentRectangle
        .attr("x", function() { return timeSelect.x(dateRange[0])})
        .attr("y", -6)
        .attr("height", function() { return timeSelect.height + 7 })
        .attr("width", function() { return timeSelect.x(dateRange[1]) - timeSelect.x(dateRange[0])});

    $(document).trigger("datesChanged");

};
