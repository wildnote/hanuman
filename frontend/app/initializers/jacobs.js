if (!window.jacobs) {
  window.jacobs = false;
}

$('.hide_announcement').click(function () {
  var a_id = $('.hide_announcement.announcement-close').attr("data-announcementid");
  // createCookie("announcement_" + a_id, "hidden", 45);
  //$(this).parent().slideDown();
  $('announce').first().slideUp();

  $.ajax({
    url: "/users/read_latest_terms/",
    type: "GET",
    error: function (error) {
      console.log(error)
    },
  });
});

export function initialize(application) {
  application.register('global:jacobs', window.jacobs, { instantiate: false });
  application.inject('route', 'isJacobs', 'global:jacobs');
  application.inject('controller', 'isJacobs', 'global:jacobs');
  application.inject('component', 'isJacobs', 'global:jacobs');
}

export default {
  name: 'isJacobs',
  initialize
};
