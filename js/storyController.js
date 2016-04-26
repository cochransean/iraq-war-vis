/**
 * Object constructor for a controller to advance the storytelling elements of the map and timeline.
 *
 * Arguments: button IDs from DOM for forward and back functionality
 */

StoryController = function(nextButtonID, backButtonID, exitID) {

    this.backgroundSelect = $("#district-level-data");
    this.dataSelect = $("#circle-data");
    this.nextButton = $("#" + nextButtonID);
    this.backButton = $("#" + backButtonID);
    this.exitButton = $("#" + exitID);

    // call views function (closure is needed to ensure sub-functions know what "this" is
    this.views = this.views();

    this.enterStory(0);

};

StoryController.prototype.enterStory = function(slideNumber) {

    var controller = this;

    // reset current view
    controller.currentView = slideNumber;

    // display first slide
    controller.views[controller.currentView.toString()]();

    // remove any current button listeners to prevent repeated function calls
    controller.nextButton.off();
    controller.backButton.off();

    // add listeners
    controller.nextButton.on("click", function() { controller.advanceView(1) });
    controller.backButton.on("click", function() { controller.advanceView(-1) });
    controller.exitButton.on("click", function() { controller.exitStory() });

    // disable user selections initially
    controller.backgroundSelect.attr("disabled", "true");
    controller.dataSelect.attr("disabled", "true");

    // get last true slide to call up when back button is hit after story mode has been exited
    controller.lastSlide = d3.keys(controller.views).length - 2;

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
    var currentViewString = controller.currentView.toString();
    controller.views[currentViewString]();
};


// exits the storytelling mode and gives user all controls
StoryController.prototype.exitStory = function() {
    var controller = this;

    // set dates to entire extent of data
    dateRange = timeSelect.x.domain();
    $(document).trigger("datesChanged");

    // remove listeners for forward and back buttons
    controller.nextButton.off();
    controller.backButton.off();

    controller.backgroundSelect.removeAttr("disabled");
    controller.dataSelect.removeAttr("disabled");
    controller.backButton.prop('disabled', false);
    controller.nextButton.prop('disabled', true);

    // add text
    $("#information-headline").text("Explore the data on your own");
    $("#information-subtitle").text("Use the select boxes to filter by category and the gray timeline to filter by date");

    // if back buttons is hit, reenter story mode at last slide
    controller.backButton.on("click", function() { controller.enterStory(controller.lastSlide) });
};


// updates brush extent and date object itself (so visuals and dates selected match)
StoryController.prototype.changeDates = function(dateString1, dateString2) {

    dateRange = [new Date(dateString1), new Date(dateString2)];

    // TODO create a rectangle to show which dates are selected (changing the extent itself doesn't update display)

    $(document).trigger("datesChanged");

};
