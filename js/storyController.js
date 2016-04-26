/**
 * Object constructor for a controller to advance the storytelling elements of the map and timeline.
 *
 * Arguments: button IDs from DOM for forward and back functionality
 */

StoryController = function(nextButtonID, backButtonID) {

    var controller = this;

    this.currentView = 0;

    $("#" + nextButtonID).on("click", function() { controller.advanceView(1) });
    $("#" + backButtonID).on("click", function() { controller.advanceView(-1) });

};

StoryController.prototype.views = {

    '0': function() {
        console.log("function 0 going");
        $("#information-headline").text("Test 1");
        $("#information-subtitle").text("Test 1");
    },

    '1': function() {
        $("#information-headline").text("Test 2");
        $("#information-subtitle").text("Test 2");
    }

};

StoryController.prototype.advanceView = function(incrementAmount) {
    var controller = this;
    controller.currentView += incrementAmount;
    var currentViewString = controller.currentView.toString();
    controller.views[currentViewString]();
};
