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

    this.enterStory();

};

StoryController.prototype.enterStory = function() {

    var controller = this;

    // reset current view
    controller.currentView = 0;

    // display first slide
    controller.views["0"]();

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

};


// object with functions to set up each view (essentially instructions to make slides)
StoryController.prototype.views = function() {

    var controller = this;
    return {

        '0': function() {
            controller.backButton.prop('disabled', true);
            controller.nextButton.prop('disabled', false);
            $("#information-headline").text("Slide 1 Headline Here");
            $("#information-subtitle").text("Slide 1 Subtitle Here");
        },

        '1': function() {
            controller.backButton.prop('disabled', false);
            controller.nextButton.prop('disabled', true);
            $("#information-headline").text("Slide 2 Headline Here");
            $("#information-subtitle").text("Slide 2 Subtitle Here");
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

    // remove listeners for forward and back buttons
    controller.nextButton.off();
    controller.backButton.off();

    controller.backgroundSelect.removeAttr("disabled");
    controller.dataSelect.removeAttr("disabled");
    controller.backButton.prop('disabled', false);
    controller.nextButton.prop('disabled', false);

    // if forward or back buttons are hit, reenter story mode at first slide
    controller.nextButton.on("click", function() { controller.enterStory() });
    controller.backButton.on("click", function() { controller.enterStory() });
};
