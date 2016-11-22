(function() {
  $(function() {
    $("#helper-list-hide-button").on("click", function() {
      $("#helper-list-container").fadeOut(1000, function() {
        return $("#page-content-container").addClass("helper-list-hidden");
      });
      return $("#helper-list-show-button").delay(1000).fadeIn(1000);
    });
    $("#helper-list-show-button").on("click", function() {
      $("#page-content-container").removeClass("helper-list-hidden");
      $("#helper-list-show-button").fadeOut(1000);
      return $("#helper-list-container").delay(1000).fadeIn(1000);
    });
    return $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', function(e) {
      e.preventDefault();
      $("#helper-list-tab-content > .active").removeClass("active").removeClass("in").addClass("fade");
      return $("#helper-list-tab-content > " + $(this).attr("href")).removeClass("fade").addClass("active").addClass("in");
    });
  });

}).call(this);
